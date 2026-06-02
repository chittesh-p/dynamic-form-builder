import { Router } from "express";
import mongoose from "mongoose";
import { HttpError } from "../middleware/error.js";
import { Form } from "../models/Form.js";
import { FormResponse } from "../models/FormResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateAnswers } from "../utils/answerValidation.js";

const router = Router();

router.post(
  "/:formId",
  asyncHandler(async (req, res) => {
    const formId = String(req.params.formId);
    const lookup = mongoose.Types.ObjectId.isValid(formId) ? { _id: formId } : { slug: formId };
    const form = await Form.findOne({ ...lookup, isPublished: true });

    if (!form) {
      throw new HttpError(404, "This form is not available for submissions.");
    }

    const result = validateAnswers(form, req.body.answers || {});
    if (!result.valid) {
      return res.status(400).json({ message: "Please fix the highlighted answers.", errors: result.errors });
    }

    const response = await FormResponse.create({
      formId: form._id,
      answers: result.answers,
      submittedAt: new Date()
    });

    res.status(201).json({ message: "Response submitted.", responseId: response._id });
  })
);

export default router;
