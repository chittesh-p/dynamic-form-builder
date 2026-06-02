import type { FormField } from "../types/form";

export type AnswerMap = Record<string, string | number | string[] | undefined>;

function compare(actual: string | number | string[] | undefined, expected: unknown, operator: string) {
  const expectedText = String(expected ?? "");

  if (Array.isArray(actual)) {
    if (operator === "notEquals") {
      return !actual.includes(expectedText);
    }
    if (operator === "contains" || operator === "equals") {
      return actual.includes(expectedText);
    }
  }

  const actualText = String(actual ?? "");

  switch (operator) {
    case "notEquals":
      return actualText !== expectedText;
    case "contains":
      return actualText.toLowerCase().includes(expectedText.toLowerCase());
    case "greaterThan":
      return Number(actual) > Number(expected);
    case "lessThan":
      return Number(actual) < Number(expected);
    case "equals":
    default:
      return actualText === expectedText;
  }
}

export function isFieldVisible(field: FormField, answers: AnswerMap) {
  if (!field.conditional?.fieldId) {
    return true;
  }

  return compare(
    answers[field.conditional.fieldId],
    field.conditional.value,
    field.conditional.operator || "equals"
  );
}

