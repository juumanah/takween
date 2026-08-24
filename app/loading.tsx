export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded-lg bg-ink-100" />
        <div className="grid gap-5 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-ink-50" />
          ))}
        </div>
      </div>
    </div>
  );
}
