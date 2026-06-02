import crypto from "crypto";
import type { FormField } from "../models/Form.js";

function keyFromLabel(label: string, fallback: string) {
  const key = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");

  return key || fallback;
}

export function normalizeFields(fields: Partial<FormField>[] = []) {
  return fields.map((field, index) => {
    const id = field.id || crypto.randomUUID();
    const label = String(field.label || `Question ${index + 1}`).trim();
    const type = field.type || "text";
    const options = ["dropdown", "checkbox", "radio"].includes(type)
      ? (field.options || ["Option 1"]).map(String).filter(Boolean)
      : [];

    return {
      id,
      key: field.key || keyFromLabel(label, `question_${index + 1}`),
      label,
      type,
      required: Boolean(field.required),
      placeholder: field.placeholder || "",
      helpText: field.helpText || "",
      defaultValue: field.defaultValue ?? "",
      options,
      validation: field.validation || {},
      conditional: field.conditional?.fieldId ? field.conditional : undefined,
      order: index
    };
  });
}

