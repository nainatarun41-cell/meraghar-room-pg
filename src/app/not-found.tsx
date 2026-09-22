import Link from "next/link";
import { Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-6xl font-black text-teal-600">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        The page you are looking for does not exist or has been removed.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
      >
        Back to home
      </Link>
    </Container>
  );
}