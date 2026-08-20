export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-rise px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-1/3 rounded bg-neutral-200" />
        <div className="h-56 rounded-3xl bg-neutral-200" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-100 p-2">
              <div className="h-36 rounded-xl bg-neutral-200" />
              <div className="mt-3 h-4 w-3/4 rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200" />
              <div className="mt-3 h-9 rounded-xl bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
