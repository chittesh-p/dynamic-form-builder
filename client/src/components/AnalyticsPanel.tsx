import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { AnalyticsPayload } from "../types/form";

type AnalyticsPanelProps = {
  analytics: AnalyticsPayload;
};

const colors = ["#256f87", "#d96c58", "#4f6f52", "#f3c969", "#7c5a9d", "#343434"];

export function AnalyticsPanel({ analytics }: AnalyticsPanelProps) {
  const [selectedField, setSelectedField] = useState(analytics.optionCounts[0]?.fieldId || "");
  const selected = useMemo(
    () => analytics.optionCounts.find((item) => item.fieldId === selectedField) || analytics.optionCounts[0],
    [analytics.optionCounts, selectedField]
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-neutral-500">Total submissions</p>
            <p className="text-3xl font-semibold text-ink">{analytics.totalSubmissions}</p>
          </div>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#256f87" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Selected options</h2>
            <p className="text-sm text-neutral-500">Most chosen answers by field</p>
          </div>
        </div>

        {analytics.optionCounts.length > 0 ? (
          <>
            <select
              className="focus-ring mt-3 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              value={selected?.fieldId || ""}
              onChange={(event) => setSelectedField(event.target.value)}
            >
              {analytics.optionCounts.map((field) => (
                <option key={field.fieldId} value={field.fieldId}>
                  {field.label}
                </option>
              ))}
            </select>
            <div className="mt-4 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={selected?.options || []} dataKey="count" nameKey="name" outerRadius={80} label>
                    {(selected?.options || []).map((item, index) => (
                      <Cell key={item.name} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selected?.options || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#d96c58" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
            Add dropdown, radio, or checkbox fields to see option analytics.
          </div>
        )}
      </section>
    </div>
  );
}

