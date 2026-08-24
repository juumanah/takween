export default function SkillBadge({
  name,
  tone = "neutral",
}: {
  name: string;
  tone?: "neutral" | "spark";
}) {
  const toneClasses =
    tone === "spark"
      ? "bg-spark-50 text-spark-700 border-spark-100"
      : "bg-ink-50 text-ink-600 border-ink-100";

  return (
    <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses}`}>
      {name}
    </span>
  );
}
