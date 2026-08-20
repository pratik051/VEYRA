export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Contact VEYRA</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form className="grid gap-3 rounded-2xl border border-neutral-200 p-5">
          <input placeholder="Name" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <input placeholder="Email" type="email" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <input placeholder="Phone" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <input placeholder="Subject" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <textarea placeholder="Message" className="min-h-28 rounded-lg border border-neutral-300 px-3 py-2" />
          <button className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white">Send Message</button>
        </form>
        <div className="rounded-2xl border border-neutral-200 p-5 text-sm">
          <p><strong>Business Email:</strong> hello@veyra.com.np</p>
          <p className="mt-2"><strong>Location:</strong> Kathmandu, Nepal</p>
          <p className="mt-2"><strong>Business Hours:</strong> Sun-Fri, 10:00 AM - 7:00 PM</p>
          <p className="mt-2"><strong>WhatsApp:</strong> Configurable in admin settings</p>
          <p className="mt-2"><strong>Social:</strong> Instagram | Facebook | TikTok</p>
        </div>
      </div>
    </div>
  );
}
