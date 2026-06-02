import { Router } from "express";
import { HttpError } from "../middleware/error.js";
import { Form } from "../models/Form.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/forms/:slug",
  asyncHandler(async (req, res) => {
    const form = await Form.findOne({ slug: req.params.slug, isPublished: true }).lean();

    if (!form) {
      throw new HttpError(404, "This form is not published or does not exist.");
    }

    res.json(form);
  })
);

export default router;

