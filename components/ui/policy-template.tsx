export function PolicyTemplate({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-4 text-sm text-neutral-700">{body}</p>
      <p className="mt-3 text-sm text-neutral-700">This policy content is managed through the admin dashboard and should be updated to match your active business terms.</p>
    </div>
  );
}
