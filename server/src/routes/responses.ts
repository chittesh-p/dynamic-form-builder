import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { Form } from "../models/Form.js";
import { FormResponse } from "../models/FormResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

function csvEscape(value: unknown) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

async function findOwnedForm(formId: string, userId: string) {
  if (!mongoose.Types.ObjectId.isValid(formId)) {
    throw new HttpError(404, "Form was not found.");
  }

  const form = await Form.findOne({ _id: formId, createdBy: userId });
  if (!form) {
    throw new HttpError(404, "Form was not found.");
  }

  return form;
}

router.use(requireAuth);

router.get(
  "/:formId",
  asyncHandler(async (req, res) => {
    const formId = String(req.params.formId);
    await findOwnedForm(formId, req.user!.id);
    const responses = await FormResponse.find({ formId }).sort({ submittedAt: -1 }).lean();
    res.json(responses);
  })
);

router.get(
  "/:formId/export.csv",
  asyncHandler(async (req, res) => {
    const form = await findOwnedForm(String(req.params.formId), req.user!.id);
    const responses = await FormResponse.find({ formId: form._id }).sort({ submittedAt: -1 }).lean();
    const fields = [...form.fields].sort((a, b) => a.order - b.order);
    const header = ["Submitted At", ...fields.map((field) => field.label)].map(csvEscape).join(",");
    const rows = responses.map((response) =>
      [
        response.submittedAt?.toISOString?.() || response.createdAt?.toISOString?.() || "",
        ...fields.map((field) => response.answers?.[field.id])
      ]
        .map(csvEscape)
        .join(",")
    );

    res.header("Content-Type", "text/csv");
    res.attachment(`${form.slug}-responses.csv`);
    res.send([header, ...rows].join("\n"));
  })
);

router.delete(
  "/:formId/:responseId",
  asyncHandler(async (req, res) => {
    const form = await findOwnedForm(String(req.params.formId), req.user!.id);
    const response = await FormResponse.findOne({ _id: String(req.params.responseId), formId: form._id });

    if (!response) {
      throw new HttpError(404, "Response was not found.");
    }

    await response.deleteOne();
    res.status(204).send();
  })
);

export default router;
