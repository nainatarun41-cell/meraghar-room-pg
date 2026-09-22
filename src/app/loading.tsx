import { Container } from "@/components/ui";

export default function Loading() {
  return (
    <Container className="flex min-h-[50vh] items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        <p className="text-sm">Loading…</p>
      </div>
    </Container>
  );
}