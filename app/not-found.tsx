import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-neutral-600">The page you are looking for is unavailable.</p>
      <Link href="/" className="mt-5 inline-block rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">
        Back to Home
      </Link>
    </div>
  );
}
