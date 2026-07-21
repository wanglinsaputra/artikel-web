import { AdminListSkeleton } from "@/components/admin-list-controls";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-surface" />
      <div className="h-40 animate-pulse rounded-2xl border border-border bg-surface" />
      <AdminListSkeleton rows={5} />
    </div>
  );
}
