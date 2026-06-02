import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { Form } from "../models/Form.js";
import { FormResponse } from "../models/FormResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/:formId",
  asyncHandler(async (req, res) => {
    const formId = String(req.params.formId);

    if (!mongoose.Types.ObjectId.isValid(formId)) {
      throw new HttpError(404, "Form was not found.");
    }

    const form = await Form.findOne({ _id: formId, createdBy: req.user!.id });
    if (!form) {
      throw new HttpError(404, "Form was not found.");
    }

    const responses = await FormResponse.find({ formId: form._id }).lean();
    const trends = new Map<string, number>();
    const optionCounts: Record<string, { label: string; options: Record<string, number> }> = {};

    for (const field of form.fields) {
      if (["dropdown", "checkbox", "radio"].includes(field.type)) {
        optionCounts[field.id] = {
          label: field.label,
          options: Object.fromEntries(field.options.map((option) => [option, 0]))
        };
      }
    }

    for (const response of responses) {
      const day = (response.submittedAt || response.createdAt).toISOString().slice(0, 10);
      trends.set(day, (trends.get(day) || 0) + 1);

      for (const field of form.fields) {
        const bucket = optionCounts[field.id];
        if (!bucket) {
          continue;
        }

        const answer = response.answers?.[field.id];
        const selected = Array.isArray(answer) ? answer : answer ? [answer] : [];
        for (const option of selected) {
          const key = String(option);
          bucket.options[key] = (bucket.options[key] || 0) + 1;
        }
      }
    }

    res.json({
      totalSubmissions: responses.length,
      trends: [...trends.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
      optionCounts: Object.entries(optionCounts).map(([fieldId, value]) => ({
        fieldId,
        label: value.label,
        options: Object.entries(value.options).map(([name, count]) => ({ name, count }))
      }))
    });
  })
);

export default router;
