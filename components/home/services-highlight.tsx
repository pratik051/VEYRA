"use client";

function DeliveryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v10.875" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  );
}

function GuaranteeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function SourcingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  );
}

export function ServicesHighlight() {
  const services = [
    {
      title: "FREE & FAST DELIVERY",
      desc: "Free express shipping for orders over Rs. 3,000 across Nepal",
      color: "bg-blue-50 text-blue-600",
      icon: <DeliveryIcon />
    },
    {
      title: "24/7 CUSTOMER CARE",
      desc: "Dedicated support team on WhatsApp & live assistance",
      color: "bg-emerald-50 text-emerald-600",
      icon: <SupportIcon />
    },
    {
      title: "MONEY BACK GUARANTEE",
      desc: "7-day easy returns and verified buyer protection",
      color: "bg-amber-50 text-amber-600",
      icon: <GuaranteeIcon />
    },
    {
      title: "INDIA DIRECT SOURCING",
      desc: "Amazon, Flipkart, Myntra & Ajio concierge to Nepal",
      color: "bg-rose-50 text-rose-600",
      icon: <SourcingIcon />
    }
  ];

  return (
    <section className="py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {services.map((service) => (
          <div
            key={service.title}
            className="flex flex-col items-center text-center p-6 rounded-3xl bg-neutral-50/80 border border-neutral-100/90 transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1 group"
          >
            <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${service.color} transition-transform duration-300 group-hover:scale-110 shadow-2xs`}>
              {service.icon}
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-xs font-black text-neutral-900 tracking-wider">
                {service.title}
              </h3>
              <p className="text-xs text-neutral-500 max-w-[200px] mx-auto leading-relaxed">
                {service.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
