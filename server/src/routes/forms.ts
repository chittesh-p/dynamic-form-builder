import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { Form } from "../models/Form.js";
import { FormResponse } from "../models/FormResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { normalizeFields } from "../utils/fieldNormalizer.js";
import { makeSlug } from "../utils/slug.js";

const router = Router();

const formSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().max(1200).optional().default(""),
  fields: z.array(z.record(z.unknown())).optional().default([]),
  isPublished: z.boolean().optional().default(false)
});

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
  "/",
  asyncHandler(async (req, res) => {
    const forms = await Form.find({ createdBy: req.user!.id }).sort({ updatedAt: -1 }).lean();
    const counts = await FormResponse.aggregate([
      { $match: { formId: { $in: forms.map((form) => form._id) } } },
      { $group: { _id: "$formId", total: { $sum: 1 } } }
    ]);

    const countMap = new Map(counts.map((item) => [String(item._id), item.total]));
    res.json(forms.map((form) => ({ ...form, responseCount: countMap.get(String(form._id)) || 0 })));
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = formSchema.parse(req.body);
    const form = await Form.create({
      title: body.title,
      description: body.description,
      fields: normalizeFields(body.fields),
      createdBy: req.user!.id,
      isPublished: body.isPublished,
      slug: makeSlug(body.title)
    });

    res.status(201).json(form);
  })
);

router.post(
  "/:id/duplicate",
  asyncHandler(async (req, res) => {
    const source = await findOwnedForm(String(req.params.id), req.user!.id);
    const duplicate = await Form.create({
      title: `${source.title} copy`,
      description: source.description,
      fields: normalizeFields(source.fields),
      createdBy: req.user!.id,
      isPublished: false,
      slug: makeSlug(`${source.title} copy`)
    });

    res.status(201).json(duplicate);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const form = await findOwnedForm(String(req.params.id), req.user!.id);
    res.json(form);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const body = formSchema.parse(req.body);
    const form = await findOwnedForm(String(req.params.id), req.user!.id);

    form.title = body.title;
    form.description = body.description;
    form.set("fields", normalizeFields(body.fields));
    form.isPublished = body.isPublished;
    await form.save();

    res.json(form);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const form = await findOwnedForm(String(req.params.id), req.user!.id);
    await FormResponse.deleteMany({ formId: form._id });
    await form.deleteOne();
    res.status(204).send();
  })
);

export default router;
