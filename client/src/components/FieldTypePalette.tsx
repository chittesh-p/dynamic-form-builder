import {
  AlignLeft,
  CalendarDays,
  CheckSquare,
  CircleDot,
  Hash,
  List,
  Mail,
  Type
} from "lucide-react";
import type { FieldType } from "../types/form";
import { fieldTypeDescriptions, fieldTypeLabels } from "../types/form";

const icons: Record<FieldType, typeof Type> = {
  text: Type,
  textarea: AlignLeft,
  number: Hash,
  dropdown: List,
  checkbox: CheckSquare,
  radio: CircleDot,
  date: CalendarDays,
  email: Mail
};

const fieldTypes: FieldType[] = ["text", "textarea", "number", "dropdown", "checkbox", "radio", "date", "email"];

type FieldTypePaletteProps = {
  onAdd: (type: FieldType) => void;
};

export function FieldTypePalette({ onAdd }: FieldTypePaletteProps) {
  return (
    <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-soft">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Add field</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {fieldTypes.map((type) => {
          const Icon = icons[type];
          return (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="focus-ring flex items-center gap-3 rounded-md border border-neutral-200 bg-white px-3 py-3 text-left transition hover:border-ocean hover:bg-ocean/5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-paper text-ocean">
                <Icon size={18} />
              </span>
              <span>
                <span className="block text-sm font-medium text-ink">{fieldTypeLabels[type]}</span>
                <span className="block text-xs text-neutral-500">{fieldTypeDescriptions[type]}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

