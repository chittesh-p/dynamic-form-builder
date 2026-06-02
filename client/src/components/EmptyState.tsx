import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-md bg-paper text-ocean">{icon}</div>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-neutral-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

