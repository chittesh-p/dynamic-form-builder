import { create } from "zustand";
import type { FieldType, FormDefinition, FormField } from "../types/form";

const emptyForm: FormDefinition = {
  title: "Untitled form",
  description: "",
  fields: [],
  isPublished: false
};

function makeId() {
  return globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
}

function keyFromLabel(label: string) {
  return (
    label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^_|_$)/g, "") || "question"
  );
}

export function createField(type: FieldType, order: number): FormField {
  const label = type === "email" ? "Email address" : "New question";
  const options = ["dropdown", "checkbox", "radio"].includes(type) ? ["Option 1", "Option 2"] : [];

  return {
    id: makeId(),
    key: `${keyFromLabel(label)}_${order + 1}`,
    label,
    type,
    required: false,
    placeholder: "",
    helpText: "",
    defaultValue: type === "checkbox" ? [] : "",
    options,
    validation: {},
    order
  };
}

type BuilderState = {
  form: FormDefinition;
  setForm: (form: FormDefinition) => void;
  reset: () => void;
  updateMeta: (patch: Partial<Pick<FormDefinition, "title" | "description" | "isPublished">>) => void;
  addField: (type: FieldType) => void;
  updateField: (fieldId: string, patch: Partial<FormField>) => void;
  removeField: (fieldId: string) => void;
  duplicateField: (fieldId: string) => void;
  reorderFields: (from: number, to: number) => void;
};

function orderFields(fields: FormField[]) {
  return fields.map((field, index) => ({ ...field, order: index }));
}

export const useBuilderStore = create<BuilderState>((set) => ({
  form: emptyForm,
  setForm: (form) => set({ form: { ...form, fields: orderFields(form.fields || []) } }),
  reset: () => set({ form: emptyForm }),
  updateMeta: (patch) => set((state) => ({ form: { ...state.form, ...patch } })),
  addField: (type) =>
    set((state) => ({
      form: {
        ...state.form,
        fields: orderFields([...state.form.fields, createField(type, state.form.fields.length)])
      }
    })),
  updateField: (fieldId, patch) =>
    set((state) => ({
      form: {
        ...state.form,
        fields: state.form.fields.map((field) => (field.id === fieldId ? { ...field, ...patch } : field))
      }
    })),
  removeField: (fieldId) =>
    set((state) => ({
      form: {
        ...state.form,
        fields: orderFields(
          state.form.fields
            .filter((field) => field.id !== fieldId)
            .map((field) =>
              field.conditional?.fieldId === fieldId ? { ...field, conditional: undefined } : field
            )
        )
      }
    })),
  duplicateField: (fieldId) =>
    set((state) => {
      const index = state.form.fields.findIndex((field) => field.id === fieldId);
      if (index === -1) {
        return state;
      }

      const field = state.form.fields[index];
      const duplicate = {
        ...field,
        id: makeId(),
        key: `${field.key}_copy`,
        label: `${field.label} copy`,
        conditional: field.conditional ? { ...field.conditional } : undefined
      };
      const fields = [...state.form.fields];
      fields.splice(index + 1, 0, duplicate);
      return { form: { ...state.form, fields: orderFields(fields) } };
    }),
  reorderFields: (from, to) =>
    set((state) => {
      const fields = [...state.form.fields];
      const [moved] = fields.splice(from, 1);
      fields.splice(to, 0, moved);
      return { form: { ...state.form, fields: orderFields(fields) } };
    })
}));

