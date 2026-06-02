import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Copy, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import type { FormDefinition } from "../types/form";
import { EmptyState } from "../components/EmptyState";

export function DashboardPage() {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadForms = async () => {
    setLoading(true);
    try {
      setForms(await api<FormDefinition[]>("/forms"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadForms();
  }, []);

  const filteredForms = useMemo(() => {
    const query = search.toLowerCase();
    return forms.filter(
      (form) =>
        form.title.toLowerCase().includes(query) || form.description.toLowerCase().includes(query)
    );
  }, [forms, search]);

  const createForm = async () => {
    setCreating(true);
    try {
      const form = await api<FormDefinition>("/forms", {
        method: "POST",
        body: JSON.stringify({
          title: "Untitled form",
          description: "",
          fields: [],
          isPublished: false
        })
      });
      navigate(`/forms/${form._id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create form");
    } finally {
      setCreating(false);
    }
  };

  const deleteForm = async (form: FormDefinition) => {
    if (!form._id || !window.confirm(`Delete "${form.title}" and all responses?`)) {
      return;
    }

    try {
      await api(`/forms/${form._id}`, { method: "DELETE" });
      setForms((current) => current.filter((item) => item._id !== form._id));
      toast.success("Form deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete form");
    }
  };

  const duplicateForm = async (form: FormDefinition) => {
    if (!form._id) {
      return;
    }

    try {
      const duplicate = await api<FormDefinition>(`/forms/${form._id}/duplicate`, { method: "POST" });
      setForms((current) => [duplicate, ...current]);
      toast.success("Form duplicated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to duplicate form");
    }
  };

  const copyPublicLink = async (form: FormDefinition) => {
    if (!form.slug) {
      return;
    }

    await navigator.clipboard.writeText(`${window.location.origin}/form/${form.slug}`);
    toast.success("Public link copied");
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">Your forms</h1>
          <p className="mt-2 text-neutral-500">Create, publish, duplicate, and inspect form performance.</p>
        </div>
        <button
          onClick={createForm}
          disabled={creating}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-coral px-4 py-3 text-sm font-semibold text-white hover:bg-coral/90 disabled:opacity-60"
        >
          <Plus size={18} />
          {creating ? "Creating..." : "New form"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-neutral-500">Forms</p>
          <p className="mt-1 text-3xl font-semibold text-ink">{forms.length}</p>
        </div>
        <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-neutral-500">Published</p>
          <p className="mt-1 text-3xl font-semibold text-ink">
            {forms.filter((form) => form.isPublished).length}
          </p>
        </div>
        <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-neutral-500">Submissions</p>
          <p className="mt-1 text-3xl font-semibold text-ink">
            {forms.reduce((total, form) => total + (form.responseCount || 0), 0)}
          </p>
        </div>
      </div>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
        <input
          className="focus-ring w-full rounded-md border border-neutral-200 bg-white py-3 pl-10 pr-3 shadow-soft"
          placeholder="Search forms"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      {loading ? (
        <div className="rounded-md border border-neutral-200 bg-white p-8 text-center text-neutral-500 shadow-soft">
          Loading forms...
        </div>
      ) : filteredForms.length === 0 ? (
        <EmptyState
          icon={<FileText size={22} />}
          title="No forms found"
          description="Create your first dynamic form and start collecting responses."
          action={
            <button
              onClick={createForm}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Create form
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredForms.map((form) => (
            <article key={form._id} className="rounded-md border border-neutral-200 bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/forms/${form._id}`} className="block truncate text-lg font-semibold text-ink hover:underline">
                    {form.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                    {form.description || "No description"}
                  </p>
                </div>
                <span
                  className={[
                    "shrink-0 rounded-md px-2 py-1 text-xs font-semibold",
                    form.isPublished ? "bg-moss/10 text-moss" : "bg-neutral-100 text-neutral-500"
                  ].join(" ")}
                >
                  {form.isPublished ? "Live" : "Draft"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-paper px-3 py-2">
                  <p className="text-neutral-500">Fields</p>
                  <p className="font-semibold text-ink">{form.fields.length}</p>
                </div>
                <div className="rounded-md bg-paper px-3 py-2">
                  <p className="text-neutral-500">Responses</p>
                  <p className="font-semibold text-ink">{form.responseCount || 0}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  to={`/forms/${form._id}`}
                  className="focus-ring inline-flex items-center gap-2 rounded-md bg-ocean px-3 py-2 text-sm font-semibold text-white hover:bg-ocean/90"
                >
                  <Pencil size={16} />
                  Edit
                </Link>
                <Link
                  to={`/forms/${form._id}/responses`}
                  className="focus-ring inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-ink hover:bg-paper"
                >
                  <BarChart3 size={16} />
                  Results
                </Link>
                <button
                  onClick={() => duplicateForm(form)}
                  className="focus-ring inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-ink hover:bg-paper"
                >
                  <Copy size={16} />
                  Copy
                </button>
                {form.isPublished ? (
                  <button
                    onClick={() => copyPublicLink(form)}
                    className="focus-ring rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-ocean hover:bg-ocean/5"
                  >
                    Public URL
                  </button>
                ) : null}
                <button
                  onClick={() => deleteForm(form)}
                  className="focus-ring ml-auto rounded-md p-2 text-neutral-500 hover:bg-coral/10 hover:text-coral"
                  title="Delete form"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
