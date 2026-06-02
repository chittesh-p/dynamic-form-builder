export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "dropdown"
  | "checkbox"
  | "radio"
  | "date"
  | "email";

export type ConditionOperator = "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";

export type FieldValidation = {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
};

export type ConditionalRule = {
  fieldId: string;
  operator: ConditionOperator;
  value: string | number | boolean;
};

export type FormField = {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | number | string[];
  options: string[];
  validation?: FieldValidation;
  conditional?: ConditionalRule;
  order: number;
};

export type FormDefinition = {
  _id?: string;
  title: string;
  description: string;
  fields: FormField[];
  createdBy?: string;
  isPublished: boolean;
  slug?: string;
  responseCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SavedResponse = {
  _id: string;
  formId: string;
  answers: Record<string, string | number | string[]>;
  submittedAt: string;
};

export type AnalyticsPayload = {
  totalSubmissions: number;
  trends: Array<{ date: string; count: number }>;
  optionCounts: Array<{
    fieldId: string;
    label: string;
    options: Array<{ name: string; count: number }>;
  }>;
};

export const fieldTypeLabels: Record<FieldType, string> = {
  text: "Text",
  textarea: "Textarea",
  number: "Number",
  dropdown: "Dropdown",
  checkbox: "Checkbox",
  radio: "Radio",
  date: "Date",
  email: "Email"
};

export const fieldTypeDescriptions: Record<FieldType, string> = {
  text: "Single line answer",
  textarea: "Long written response",
  number: "Numeric answer",
  dropdown: "One choice from a menu",
  checkbox: "Multiple choices",
  radio: "One visible choice",
  date: "Calendar date",
  email: "Validated email"
};

export const optionFieldTypes: FieldType[] = ["dropdown", "checkbox", "radio"];

