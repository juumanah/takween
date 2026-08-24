export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 px-6 py-14 text-center">
      <p className="font-display text-lg font-bold text-ink">{title}</p>
      {description && <p className="mt-2 text-sm text-ink-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
