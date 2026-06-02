import type { FormDocument, FormField } from "../models/Form.js";

type Answers = Record<string, unknown>;

function isEmpty(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function compare(actual: unknown, expected: unknown, operator: string) {
  const actualText = Array.isArray(actual) ? actual.map(String) : String(actual ?? "");
  const expectedText = String(expected ?? "");

  switch (operator) {
    case "notEquals":
      return actualText !== expectedText;
    case "contains":
      return Array.isArray(actualText)
        ? actualText.includes(expectedText)
        : actualText.toLowerCase().includes(expectedText.toLowerCase());
    case "greaterThan":
      return Number(actual) > Number(expected);
    case "lessThan":
      return Number(actual) < Number(expected);
    case "equals":
    default:
      return Array.isArray(actualText) ? actualText.includes(expectedText) : actualText === expectedText;
  }
}

export function isFieldVisible(field: FormField, answers: Answers) {
  if (!field.conditional?.fieldId) {
    return true;
  }

  const actual = answers[field.conditional.fieldId];
  return compare(actual, field.conditional.value, field.conditional.operator || "equals");
}

function sanitizeAnswer(field: FormField, value: unknown) {
  if (isEmpty(value)) {
    return value;
  }

  if (field.type === "number") {
    return Number(value);
  }

  if (field.type === "checkbox") {
    return Array.isArray(value) ? value.map(String) : [String(value)];
  }

  return String(value).trim();
}

export function validateAnswers(form: FormDocument, incoming: Answers) {
  const errors: Record<string, string> = {};
  const sanitized: Answers = {};

  const sortedFields = [...form.fields].sort((a, b) => a.order - b.order);

  for (const field of sortedFields) {
    if (!isFieldVisible(field, { ...incoming, ...sanitized })) {
      continue;
    }

    const rawValue = incoming[field.id];
    const value = sanitizeAnswer(field, rawValue);

    if (field.required && isEmpty(value)) {
      errors[field.id] = `${field.label} is required.`;
      continue;
    }

    if (isEmpty(value)) {
      continue;
    }

    if (field.type === "email" && !/^\S+@\S+\.\S+$/.test(String(value))) {
      errors[field.id] = "Enter a valid email address.";
      continue;
    }

    if (field.type === "number" && Number.isNaN(Number(value))) {
      errors[field.id] = "Enter a valid number.";
      continue;
    }

    if (field.type === "number") {
      const min = field.validation?.min;
      const max = field.validation?.max;

      if (min != null && Number(value) < min) {
        errors[field.id] = `Value must be at least ${min}.`;
        continue;
      }
      if (max != null && Number(value) > max) {
        errors[field.id] = `Value must be no more than ${max}.`;
        continue;
      }
    }

    if (["text", "textarea", "email"].includes(field.type)) {
      const minLength = field.validation?.minLength;
      const maxLength = field.validation?.maxLength;

      if (minLength != null && String(value).length < minLength) {
        errors[field.id] = `Answer must be at least ${minLength} characters.`;
        continue;
      }
      if (maxLength != null && String(value).length > maxLength) {
        errors[field.id] = `Answer must be no more than ${maxLength} characters.`;
        continue;
      }
      if (field.validation?.pattern) {
        const pattern = new RegExp(field.validation.pattern);
        if (!pattern.test(String(value))) {
          errors[field.id] = "Answer does not match the required format.";
          continue;
        }
      }
    }

    if (["dropdown", "radio"].includes(field.type) && !field.options.includes(String(value))) {
      errors[field.id] = "Choose one of the available options.";
      continue;
    }

    if (field.type === "checkbox") {
      const selected = Array.isArray(value) ? value.map(String) : [];
      const invalid = selected.some((item) => !field.options.includes(item));
      if (invalid) {
        errors[field.id] = "Choose only available options.";
        continue;
      }
    }

    sanitized[field.id] = value;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    answers: sanitized
  };
}
