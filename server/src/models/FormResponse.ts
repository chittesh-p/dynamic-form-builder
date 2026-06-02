import mongoose, { type InferSchemaType } from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {}
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

export type FormResponseDocument = InferSchemaType<typeof responseSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const FormResponse = mongoose.model("FormResponse", responseSchema);

