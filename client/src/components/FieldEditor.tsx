import { Copy, Plus, Trash2, X } from "lucide-react";
import type { ConditionalRule, FormField } from "../types/form";
import { fieldTypeLabels, optionFieldTypes } from "../types/form";

type FieldEditorProps = {
  field: FormField;
  fields: FormField[];
  onChange: (patch: Partial<FormField>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
};

function optionalNumber(value: string) {
  return value === "" ? undefined : Number(value);
}

export function FieldEditor({ field, fields, onChange, onRemove, onDuplicate }: FieldEditorProps) {
  const conditionSource = fields.find((item) => item.id === field.conditional?.fieldId);
  const availableConditionFields = fields.filter((item) => item.id !== field.id);
  const hasOptions = optionFieldTypes.includes(field.type);

  const updateValidation = (patch: Partial<FormField["validation"]>) => {
    onChange({ validation: { ...(field.validation || {}), ...patch } });
  };

  const updateOption = (index: number, value: string) => {
    const options = [...field.options];
    options[index] = value;
    onChange({ options });
  };

  const removeOption = (index: number) => {
    onChange({ options: field.options.filter((_, optionIndex) => optionIndex !== index) });
  };

  const updateCondition = (patch: Partial<ConditionalRule>) => {
    const next = {
      fieldId: field.conditional?.fieldId || availableConditionFields[0]?.id || "",
      operator: field.conditional?.operator || "equals",
      value: field.conditional?.value ?? "",
      ...patch
    };

    onChange({ conditional: next.fieldId ? next : undefined });
  };

  return (
    <div className="grid gap-4 px-4 py-4">
      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Label
          <input
            className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
            value={field.label}
            onChange={(event) => onChange({ label: event.target.value })}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Type
          <select
            className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
            value={field.type}
            onChange={(event) => {
              const nextType = event.target.value as FormField["type"];
              onChange({
                type: nextType,
                options: optionFieldTypes.includes(nextType) ? field.options.length ? field.options : ["Option 1"] : []
              });
            }}
          >
            {Object.entries(fieldTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Placeholder
          <input
            className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
            value={field.placeholder || ""}
            onChange={(event) => onChange({ placeholder: event.target.value })}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Default value
          <input
            className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
            value={Array.isArray(field.defaultValue) ? field.defaultValue.join(", ") : field.defaultValue || ""}
            onChange={(event) => onChange({ defaultValue: event.target.value })}
          />
        </label>
      </div>

      <label className="grid gap-1 text-sm font-medium text-neutral-700">
        Help text
        <textarea
          className="focus-ring min-h-20 rounded-md border border-neutral-200 px-3 py-2"
          value={field.helpText || ""}
          onChange={(event) => onChange({ helpText: event.target.value })}
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-neutral-300 text-ocean"
          checked={field.required}
          onChange={(event) => onChange({ required: event.target.checked })}
        />
        Required field
      </label>

      {hasOptions ? (
        <section className="rounded-md border border-neutral-200 bg-paper/60 p-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-ink">Options</h4>
            <button
              onClick={() => onChange({ options: [...field.options, `Option ${field.options.length + 1}`] })}
              className="focus-ring inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-ink"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
          <div className="mt-3 grid gap-2">
            {field.options.map((option, index) => (
              <div key={`${option}-${index}`} className="flex items-center gap-2">
                <input
                  className="focus-ring flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
                  value={option}
                  onChange={(event) => updateOption(index, event.target.value)}
                />
                <button
                  onClick={() => removeOption(index)}
                  className="focus-ring rounded-md border border-neutral-200 bg-white p-2 text-neutral-500 hover:text-coral"
                  title="Remove option"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 rounded-md border border-neutral-200 bg-white p-3">
        <h4 className="text-sm font-semibold text-ink">Validation</h4>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Min length
            <input
              type="number"
              className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
              value={field.validation?.minLength ?? ""}
              onChange={(event) => updateValidation({ minLength: optionalNumber(event.target.value) })}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Max length
            <input
              type="number"
              className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
              value={field.validation?.maxLength ?? ""}
              onChange={(event) => updateValidation({ maxLength: optionalNumber(event.target.value) })}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Min
            <input
              type="number"
              className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
              value={field.validation?.min ?? ""}
              onChange={(event) => updateValidation({ min: optionalNumber(event.target.value) })}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Max
            <input
              type="number"
              className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
              value={field.validation?.max ?? ""}
              onChange={(event) => updateValidation({ max: optionalNumber(event.target.value) })}
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Pattern
          <input
            className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
            value={field.validation?.pattern || ""}
            onChange={(event) => updateValidation({ pattern: event.target.value || undefined })}
            placeholder="Example: ^[A-Z]{3}$"
          />
        </label>
      </section>

      <section className="grid gap-3 rounded-md border border-neutral-200 bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-ink">Conditional logic</h4>
          {field.conditional ? (
            <button
              onClick={() => onChange({ conditional: undefined })}
              className="focus-ring text-xs font-semibold text-coral"
            >
              Remove condition
            </button>
          ) : null}
        </div>

        {availableConditionFields.length === 0 ? (
          <p className="text-sm text-neutral-500">Add another field before using conditional visibility.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-sm font-medium text-neutral-700">
              Show when
              <select
                className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
                value={field.conditional?.fieldId || ""}
                onChange={(event) => {
                  const selected = fields.find((item) => item.id === event.target.value);
                  updateCondition({
                    fieldId: event.target.value,
                    value: selected?.options[0] || ""
                  });
                }}
              >
                <option value="">Always visible</option>
                {availableConditionFields.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-neutral-700">
              Operator
              <select
                className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
                value={field.conditional?.operator || "equals"}
                onChange={(event) =>
                  updateCondition({ operator: event.target.value as ConditionalRule["operator"] })
                }
                disabled={!field.conditional}
              >
                <option value="equals">Equals</option>
                <option value="notEquals">Does not equal</option>
                <option value="contains">Contains</option>
                <option value="greaterThan">Greater than</option>
                <option value="lessThan">Less than</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-neutral-700">
              Value
              {conditionSource && optionFieldTypes.includes(conditionSource.type) ? (
                <select
                  className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
                  value={String(field.conditional?.value || "")}
                  onChange={(event) => updateCondition({ value: event.target.value })}
                  disabled={!field.conditional}
                >
                  {conditionSource.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
                  value={String(field.conditional?.value || "")}
                  onChange={(event) => updateCondition({ value: event.target.value })}
                  disabled={!field.conditional}
                />
              )}
            </label>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-2">
        <button
          onClick={onDuplicate}
          className="focus-ring inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-paper"
        >
          <Copy size={16} />
          Duplicate
        </button>
        <button
          onClick={onRemove}
          className="focus-ring inline-flex items-center gap-2 rounded-md bg-coral px-3 py-2 text-sm font-semibold text-white hover:bg-coral/90"
        >
          <Trash2 size={16} />
          Delete field
        </button>
      </div>
    </div>
  );
}

