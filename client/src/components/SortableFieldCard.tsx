import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import type { FormField } from "../types/form";
import { fieldTypeLabels } from "../types/form";
import { FieldEditor } from "./FieldEditor";

type SortableFieldCardProps = {
  field: FormField;
  fields: FormField[];
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<FormField>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
};

export function SortableFieldCard({
  field,
  fields,
  selected,
  onSelect,
  onChange,
  onRemove,
  onDuplicate
}: SortableFieldCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={[
        "rounded-md border bg-white shadow-soft transition",
        selected ? "border-ocean ring-2 ring-ocean/20" : "border-neutral-200",
        isDragging ? "opacity-60" : ""
      ].join(" ")}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3 border-b border-neutral-100 px-4 py-3">
        <button
          className="focus-ring mt-1 rounded-md p-1 text-neutral-400 hover:bg-paper hover:text-ink"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-ink">{field.label}</h3>
            <span className="rounded-md bg-paper px-2 py-1 text-xs font-medium text-neutral-600">
              {fieldTypeLabels[field.type]}
            </span>
            {field.required ? (
              <span className="rounded-md bg-coral/10 px-2 py-1 text-xs font-medium text-coral">Required</span>
            ) : null}
            {field.conditional ? (
              <span className="rounded-md bg-lemon/30 px-2 py-1 text-xs font-medium text-ink">Conditional</span>
            ) : null}
          </div>
          {field.helpText ? <p className="mt-1 text-sm text-neutral-500">{field.helpText}</p> : null}
        </div>
      </div>
      {selected ? (
        <FieldEditor
          field={field}
          fields={fields}
          onChange={onChange}
          onRemove={onRemove}
          onDuplicate={onDuplicate}
        />
      ) : null}
    </article>
  );
}

