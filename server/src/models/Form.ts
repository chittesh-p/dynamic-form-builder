import mongoose, { type InferSchemaType } from "mongoose";

export const fieldTypes = [
  "text",
  "textarea",
  "number",
  "dropdown",
  "checkbox",
  "radio",
  "date",
  "email"
] as const;

export const conditionOperators = [
  "equals",
  "notEquals",
  "contains",
  "greaterThan",
  "lessThan"
] as const;

const validationSchema = new mongoose.Schema(
  {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String
  },
  { _id: false }
);

const conditionalSchema = new mongoose.Schema(
  {
    fieldId: {
      type: String,
      required: true
    },
    operator: {
      type: String,
      enum: conditionOperators,
      default: "equals"
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  { _id: false }
);

const fieldSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    key: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: fieldTypes,
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    placeholder: String,
    helpText: String,
    defaultValue: mongoose.Schema.Types.Mixed,
    options: {
      type: [String],
      default: []
    },
    validation: validationSchema,
    conditional: conditionalSchema,
    order: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      default: "",
      maxlength: 1200
    },
    fields: {
      type: [fieldSchema],
      default: []
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    }
  },
  { timestamps: true }
);

export type FormField = InferSchemaType<typeof fieldSchema>;
export type FormDocument = InferSchemaType<typeof formSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Form = mongoose.model("Form", formSchema);

