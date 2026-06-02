import { useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import toast from "react-hot-toast";
import { Eye, Save, Send, Share2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { FieldTypePalette } from "../components/FieldTypePalette";
import { FormPreview } from "../components/FormPreview";
import { SortableFieldCard } from "../components/SortableFieldCard";
import { api } from "../lib/api";
import { useBuilderStore } from "../stores/builderStore";
import type { FormDefinition } from "../types/form";

export function BuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const { form, setForm, reset, updateMeta, addField, updateField, removeField, duplicateField, reorderFields } =
    useBuilderStore();
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!id) {
      reset();
      setLoading(false);
      return;
    }

    setLoading(true);
    api<FormDefinition>(`/forms/${id}`)
      .then((data) => {
        setForm(data);
        setSelectedFieldId(data.fields[0]?.id || null);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load form");
        navigate("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [id, navigate, reset, setForm]);

  const selectedField = useMemo(
    () => form.fields.find((field) => field.id === selectedFieldId) || form.fields[0],
    [form.fields, selectedFieldId]
  );

  useEffect(() => {
    if (!selectedFieldId && form.fields[0]) {
      setSelectedFieldId(form.fields[0].id);
    }
  }, [form.fields, selectedFieldId]);

  const saveForm = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        fields: form.fields,
        isPublished: form.isPublished
      };
      const saved = form._id
        ? await api<FormDefinition>(`/forms/${form._id}`, { method: "PUT", body: JSON.stringify(payload) })
        : await api<FormDefinition>("/forms", { method: "POST", body: JSON.stringify(payload) });

      setForm(saved);
      toast.success("Form saved");
      if (isNew && saved._id) {
        navigate(`/forms/${saved._id}`, { replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save form");
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const from = form.fields.findIndex((field) => field.id === active.id);
    const to = form.fields.findIndex((field) => field.id === over.id);
    if (from >= 0 && to >= 0) {
      reorderFields(from, to);
    }
  };

  const copyPublicLink = async () => {
    if (!form.slug) {
      toast.error("Save and publish the form before sharing.");
      return;
    }

    await navigator.clipboard.writeText(`${window.location.origin}/form/${form.slug}`);
    toast.success("Public link copied");
  };

  if (loading) {
    return (
      <div className="rounded-md border border-neutral-200 bg-white p-8 text-center text-neutral-500 shadow-soft">
        Loading builder...
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 rounded-md border border-neutral-200 bg-white p-4 shadow-soft xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-[1fr_1.4fr]">
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Form title
            <input
              className="focus-ring rounded-md border border-neutral-200 px-3 py-2 text-lg font-semibold text-ink"
              value={form.title}
              onChange={(event) => updateMeta({ title: event.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Description
            <input
              className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
              value={form.description}
              onChange={(event) => updateMeta({ description: event.target.value })}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded text-ocean"
              checked={form.isPublished}
              onChange={(event) => updateMeta({ isPublished: event.target.checked })}
            />
            Published
          </label>
          <button
            onClick={() => setPreviewMode((value) => !value)}
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-ink hover:bg-paper"
          >
            <Eye size={16} />
            {previewMode ? "Edit" : "Preview"}
          </button>
          <button
            onClick={copyPublicLink}
            disabled={!form.isPublished || !form.slug}
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Share2 size={16} />
            Share
          </button>
          <button
            onClick={saveForm}
            disabled={saving}
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-ocean/90 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {previewMode ? (
        <div className="mx-auto w-full max-w-3xl">
          <FormPreview form={form} />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <FieldTypePalette
              onAdd={(type) => {
                addField(type);
                setSelectedFieldId(null);
              }}
            />
          </aside>

          <section className="grid gap-3">
            {form.fields.length === 0 ? (
              <EmptyState
                icon={<Send size={22} />}
                title="Build your form"
                description="Add fields from the palette, then configure validation, defaults, and conditional rules."
              />
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={form.fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid gap-3">
                    {form.fields.map((field) => (
                      <SortableFieldCard
                        key={field.id}
                        field={field}
                        fields={form.fields}
                        selected={selectedField?.id === field.id}
                        onSelect={() => setSelectedFieldId(field.id)}
                        onChange={(patch) => updateField(field.id, patch)}
                        onRemove={() => {
                          removeField(field.id);
                          setSelectedFieldId(null);
                        }}
                        onDuplicate={() => duplicateField(field.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </section>
        </div>
      )}

      {form._id ? (
        <div className="flex justify-end">
          <Link
            to={`/forms/${form._id}/responses`}
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-paper"
          >
            View responses
          </Link>
        </div>
      ) : null}
    </div>
  );
}

