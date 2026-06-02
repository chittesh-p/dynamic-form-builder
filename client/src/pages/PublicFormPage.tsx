import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, FileQuestion } from "lucide-react";
import { FormPreview } from "../components/FormPreview";
import { api } from "../lib/api";
import type { AnswerMap } from "../lib/conditional";
import type { FormDefinition } from "../types/form";

export function PublicFormPage() {
  const { slug } = useParams();
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!slug) {
      return;
    }

    api<FormDefinition>(`/public/forms/${slug}`, { auth: false })
      .then(setForm)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load form"))
      .finally(() => setLoading(false));
  }, [slug]);

  const submitResponse = async (answers: AnswerMap) => {
    if (!form?._id) {
      return;
    }

    setServerErrors({});
    try {
      await api(`/submit/${form._id}`, {
        method: "POST",
        body: JSON.stringify({ answers }),
        auth: false
      });
      setSubmitted(true);
      toast.success("Response submitted");
    } catch (error) {
      const apiError = error as Error & { errors?: Record<string, string> };
      setServerErrors(apiError.errors || {});
      toast.error(apiError.message || "Unable to submit response");
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-4">
        <p className="text-neutral-500">Loading form...</p>
      </main>
    );
  }

  if (!form) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-4">
        <section className="max-w-md rounded-md border border-neutral-200 bg-white p-6 text-center shadow-soft">
          <FileQuestion className="mx-auto text-coral" size={36} />
          <h1 className="mt-4 text-xl font-semibold text-ink">Form not available</h1>
          <p className="mt-2 text-sm text-neutral-500">This public link is either unpublished or incorrect.</p>
        </section>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-4">
        <section className="max-w-md rounded-md border border-neutral-200 bg-white p-6 text-center shadow-soft">
          <CheckCircle2 className="mx-auto text-moss" size={42} />
          <h1 className="mt-4 text-xl font-semibold text-ink">Response submitted</h1>
          <p className="mt-2 text-sm text-neutral-500">Thank you. Your answers have been recorded.</p>
          <Link to={`/form/${form.slug}`} className="mt-5 inline-flex text-sm font-semibold text-ocean hover:underline">
            Submit another response
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <FormPreview
          form={form}
          submitLabel="Submit response"
          onSubmit={submitResponse}
          serverErrors={serverErrors}
        />
      </div>
    </main>
  );
}

