import type { ReviewStatus } from "@/lib/review";

const statusClasses: Record<ReviewStatus, string> = {
  suggested: "bg-amber-500/15 text-amber-200 border-amber-500/40",
  approved: "bg-emerald-500/15 text-emerald-200 border-emerald-500/40",
  rejected: "bg-rose-500/15 text-rose-200 border-rose-500/40",
  posted: "bg-cyan-500/15 text-cyan-200 border-cyan-500/40",
};

export default function StatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}
