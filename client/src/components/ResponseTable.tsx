import { Trash2 } from "lucide-react";
import type { FormDefinition, SavedResponse } from "../types/form";

type ResponseTableProps = {
  form: FormDefinition;
  responses: SavedResponse[];
  filter: string;
  onFilter: (value: string) => void;
  onDelete: (responseId: string) => void;
};

function displayValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value ?? "");
}

export function ResponseTable({ form, responses, filter, onFilter, onDelete }: ResponseTableProps) {
  const fields = [...form.fields].sort((a, b) => a.order - b.order);
  const normalizedFilter = filter.toLowerCase();
  const filtered = responses.filter((response) =>
    Object.values(response.answers).some((value) => displayValue(value).toLowerCase().includes(normalizedFilter))
  );

  return (
    <section className="rounded-md border border-neutral-200 bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Responses</h2>
          <p className="text-sm text-neutral-500">{filtered.length} visible responses</p>
        </div>
        <input
          className="focus-ring rounded-md border border-neutral-200 px-3 py-2 text-sm"
          placeholder="Filter responses"
          value={filter}
          onChange={(event) => onFilter(event.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-paper">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-neutral-600">Submitted</th>
              {fields.map((field) => (
                <th key={field.id} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-neutral-600">
                  {field.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((response) => (
              <tr key={response._id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-neutral-600">
                  {new Date(response.submittedAt).toLocaleString()}
                </td>
                {fields.map((field) => (
                  <td key={field.id} className="min-w-40 px-4 py-3 text-neutral-700">
                    {displayValue(response.answers[field.id])}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(response._id)}
                    className="focus-ring rounded-md p-2 text-neutral-500 hover:bg-coral/10 hover:text-coral"
                    title="Delete response"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

