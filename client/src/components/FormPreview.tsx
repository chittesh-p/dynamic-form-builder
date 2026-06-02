import { useEffect, useMemo, useState } from "react";
import type { FormDefinition, FormField } from "../types/form";
import { isFieldVisible, type AnswerMap } from "../lib/conditional";

type FormPreviewProps = {
  form: FormDefinition;
  submitLabel?: string;
  onSubmit?: (answers: AnswerMap) => Promise<void> | void;
  serverErrors?: Record<string, string>;
};

function initialAnswers(fields: FormField[]) {
  return Object.fromEntries(
    fields.map((field) => [
      field.id,
      field.defaultValue ?? (field.type === "checkbox" ? [] : "")
    ])
  ) as AnswerMap;
}

function isBlank(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

export function FormPreview({ form, submitLabel = "Submit", onSubmit, serverErrors = {} }: FormPreviewProps) {
  const [answers, setAnswers] = useState<AnswerMap>(() => initialAnswers(form.fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAnswers(initialAnswers(form.fields));
    setErrors({});
  }, [form._id, form.fields.length]);

  const visibleFields = useMemo(() => {
    return [...form.fields].sort((a, b) => a.order - b.order).filter((field) => isFieldVisible(field, answers));
  }, [answers, form.fields]);

  const updateAnswer = (fieldId: string, value: string | number | string[]) => {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
    setErrors((current) => ({ ...current, [fieldId]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    for (const field of visibleFields) {
      const value = answers[field.id];
      if (field.required && isBlank(value)) {
        nextErrors[field.id] = `${field.label} is required.`;
      }
      if (field.type === "email" && !isBlank(value) && !/^\S+@\S+\.\S+$/.test(String(value))) {
        nextErrors[field.id] = "Enter a valid email address.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!onSubmit || !validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(answers);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const error = errors[field.id] || serverErrors[field.id];
    const commonClass =
      "focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-ink placeholder:text-neutral-400";

    return (
      <div key={field.id} className="grid gap-2 rounded-md border border-neutral-200 bg-white p-4">
        <label className="text-sm font-semibold text-ink">
          {field.label} {field.required ? <span className="text-coral">*</span> : null}
        </label>
        {field.helpText ? <p className="text-sm text-neutral-500">{field.helpText}</p> : null}

        {field.type === "textarea" ? (
          <textarea
            className={`${commonClass} min-h-28`}
            placeholder={field.placeholder}
            value={String(answers[field.id] || "")}
            onChange={(event) => updateAnswer(field.id, event.target.value)}
          />
        ) : null}

        {["text", "email", "date", "number"].includes(field.type) ? (
          <input
            className={commonClass}
            type={field.type === "text" ? "text" : field.type}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            value={String(answers[field.id] || "")}
            onChange={(event) =>
              updateAnswer(field.id, field.type === "number" ? Number(event.target.value) : event.target.value)
            }
          />
        ) : null}

        {field.type === "dropdown" ? (
          <select
            className={commonClass}
            value={String(answers[field.id] || "")}
            onChange={(event) => updateAnswer(field.id, event.target.value)}
          >
            <option value="">Choose an option</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : null}

        {field.type === "radio" ? (
          <div className="grid gap-2">
            {field.options.map((option) => (
              <label key={option} className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2">
                <input
                  type="radio"
                  name={field.id}
                  className="h-4 w-4 text-ocean"
                  checked={answers[field.id] === option}
                  onChange={() => updateAnswer(field.id, option)}
                />
                <span className="text-sm text-neutral-700">{option}</span>
              </label>
            ))}
          </div>
        ) : null}

        {field.type === "checkbox" ? (
          <div className="grid gap-2">
            {field.options.map((option) => {
              const selected = Array.isArray(answers[field.id]) ? (answers[field.id] as string[]) : [];
              return (
                <label key={option} className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-ocean"
                    checked={selected.includes(option)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...selected, option]
                        : selected.filter((item) => item !== option);
                      updateAnswer(field.id, next);
                    }}
                  />
                  <span className="text-sm text-neutral-700">{option}</span>
                </label>
              );
            })}
          </div>
        ) : null}

        {error ? <p className="text-sm font-medium text-coral">{error}</p> : null}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="rounded-md bg-ink px-5 py-6 text-white">
        <h1 className="text-2xl font-semibold">{form.title || "Untitled form"}</h1>
        {form.description ? <p className="mt-2 text-sm text-white/75">{form.description}</p> : null}
      </div>

      {visibleFields.length === 0 ? (
        <div className="rounded-md border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500">
          No visible fields yet.
        </div>
      ) : (
        visibleFields.map(renderField)
      )}

      {onSubmit ? (
        <button
          type="submit"
          disabled={submitting}
          className="focus-ring rounded-md bg-ocean px-4 py-3 text-sm font-semibold text-white hover:bg-ocean/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : submitLabel}
        </button>
      ) : null}
    </form>
  );
}

