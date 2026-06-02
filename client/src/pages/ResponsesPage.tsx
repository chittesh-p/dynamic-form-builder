import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { Download, Inbox } from "lucide-react";
import { AnalyticsPanel } from "../components/AnalyticsPanel";
import { EmptyState } from "../components/EmptyState";
import { ResponseTable } from "../components/ResponseTable";
import { api, API_URL, TOKEN_KEY } from "../lib/api";
import type { AnalyticsPayload, FormDefinition, SavedResponse } from "../types/form";

export function ResponsesPage() {
  const { id } = useParams();
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [responses, setResponses] = useState<SavedResponse[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      const [formData, responseData, analyticsData] = await Promise.all([
        api<FormDefinition>(`/forms/${id}`),
        api<SavedResponse[]>(`/responses/${id}`),
        api<AnalyticsPayload>(`/analytics/${id}`)
      ]);
      setForm(formData);
      setResponses(responseData);
      setAnalytics(analyticsData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load responses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [id]);

  const deleteResponse = async (responseId: string) => {
    if (!id || !window.confirm("Delete this response?")) {
      return;
    }

    try {
      await api(`/responses/${id}/${responseId}`, { method: "DELETE" });
      await loadData();
      toast.success("Response deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete response");
    }
  };

  const exportCsv = async () => {
    if (!id) {
      return;
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_URL}/responses/${id}/export.csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error("Unable to export CSV");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${form?.slug || "form"}-responses.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to export CSV");
    }
  };

  if (loading || !form || !analytics) {
    return (
      <div className="rounded-md border border-neutral-200 bg-white p-8 text-center text-neutral-500 shadow-soft">
        Loading responses...
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link to={`/forms/${form._id}`} className="text-sm font-semibold text-ocean hover:underline">
            Back to builder
          </Link>
          <h1 className="mt-1 text-3xl font-semibold text-ink">{form.title}</h1>
          <p className="mt-2 text-neutral-500">Submission analytics and response management.</p>
        </div>
        <button
          onClick={exportCsv}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-ocean px-4 py-3 text-sm font-semibold text-white hover:bg-ocean/90"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <AnalyticsPanel analytics={analytics} />

      {responses.length === 0 ? (
        <EmptyState
          icon={<Inbox size={22} />}
          title="No responses yet"
          description="Once the public form receives submissions, they will appear here with analytics."
        />
      ) : (
        <ResponseTable
          form={form}
          responses={responses}
          filter={filter}
          onFilter={setFilter}
          onDelete={deleteResponse}
        />
      )}
    </div>
  );
}

