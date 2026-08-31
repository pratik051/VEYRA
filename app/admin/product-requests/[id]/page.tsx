"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { validateAndBuildQuote } from "@/lib/admin/quote-utils";
import AdminCard from "../../components/AdminCard";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import Select from "../../components/Select";
import Button from "../../components/Button";

type ProductRequest = any;

type QuoteFields = {
  finalEstimatedPrice?: number;
  serviceFee?: number;
  shippingIndiaToNepal?: number;
  customsTaxes?: number;
  exchangeRate?: number;
  expectedDeliveryTime?: string;
  quoteExpiry?: string;
};

function numberOrUndefined(v: any) {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function updateNumericQuoteField(
  field: keyof Pick<QuoteFields, "finalEstimatedPrice" | "serviceFee" | "shippingIndiaToNepal" | "customsTaxes" | "exchangeRate">,
  value: string,
  setQuoteFields: React.Dispatch<React.SetStateAction<QuoteFields>>
) {
  setQuoteFields((s) => ({ ...s, [field]: numberOrUndefined(value) }));
}

export default function ProductRequestEditor({ params }: { params: { id: string } }) {
  const id = params.id;
  const [req, setReq] = useState<ProductRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [quoteFields, setQuoteFields] = useState<QuoteFields>({});
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/product-requests/${encodeURIComponent(id)}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        return res.json();
      })
      .then((data) => {
        const doc = data.request || data;
        setReq(doc);
        setStatus(doc?.status ?? "");
        setAdminNotes(doc?.adminNotes ?? "");
        setQuoteFields({
          finalEstimatedPrice: doc?.quote?.finalEstimatedPrice ?? doc?.quote?.finalEstimatedPrice ?? undefined,
          serviceFee: doc?.quote?.serviceFee ?? undefined,
          shippingIndiaToNepal: doc?.quote?.shippingIndiaToNepal ?? undefined,
          customsTaxes: doc?.quote?.customsTaxes ?? undefined,
          exchangeRate: doc?.quote?.exchangeRate ?? undefined,
          expectedDeliveryTime: doc?.quote?.expectedDeliveryTime ?? "",
          quoteExpiry: doc?.quote?.quoteExpiry ?? ""
        });
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // validate quote fields (client-side) using shared helper
    const { valid, errors, quote } = validateAndBuildQuote(quoteFields);
    if (!valid) {
      setError("Quote validation error: " + errors.join('; '));
      setLoading(false);
      return;
    }

    // Basic validation: finalEstimatedPrice must be present when setting status to quoted
    if (status === "quoted" && (quote.finalEstimatedPrice === undefined || !Number.isFinite(quote.finalEstimatedPrice))) {
      setError("finalEstimatedPrice is required and must be a number when status is quoted.");
      setLoading(false);
      return;
    }

    const payload: any = { status, adminNotes, quote };

    try {
      const res = await fetch(`/api/admin/product-requests/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const data = await res.json();
      setReq(data.request || data);
      setStatus(data.request?.status ?? data.status ?? status);
      router.refresh();
      alert("Saved");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading && !req) return <div style={{ padding: 20 }}>Loading…</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;
  if (!req) return <div style={{ padding: 20 }}>Not found.</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-2 text-veyra-text dark:text-slate-100">Request {req.requestId}</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        <strong>Customer:</strong> {req.fullName} — {req.phone} — {req.email}
      </p>
      <p className="text-sm mt-2 dark:text-slate-300">
        <strong>Product URL:</strong>{' '}
        <a href={req.productUrl} target="_blank" rel="noreferrer" className="text-sky-600 dark:text-sky-300 underline">Open product page</a>
      </p>

      <form onSubmit={handleSave} className="max-w-3xl mt-4">        <div className="mb-4">
          <label className="block text-sm font-medium">Status</label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-48">
            <option value="pending_review">pending_review</option>
            <option value="verifying">verifying</option>
            <option value="manual_required">manual_required</option>
            <option value="available">available</option>
            <option value="unavailable">unavailable</option>
            <option value="quoted">quoted</option>
            <option value="cancelled">cancelled</option>
          </Select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Admin notes</label>
          <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={4} />
        </div>

        <fieldset className="border border-black/[0.06] dark:border-white/[0.04] p-4 mb-4 rounded bg-white dark:bg-transparent">
          <legend className="px-2 text-veyra-text dark:text-slate-100">Quote (structured)</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <label className="block">
              <div className="text-sm">Final estimated price (INR)</div>
              <Input type="number" step="0.01" value={quoteFields.finalEstimatedPrice ?? ""} onChange={(e) => updateNumericQuoteField("finalEstimatedPrice", e.target.value, setQuoteFields)} />
            </label>

            <label className="block">
              <div className="text-sm">Service fee (INR)</div>
              <Input type="number" step="0.01" value={quoteFields.serviceFee ?? ""} onChange={(e) => updateNumericQuoteField("serviceFee", e.target.value, setQuoteFields)} />
            </label>

            <label className="block">
              <div className="text-sm">Shipping India → Nepal (INR)</div>
              <Input type="number" step="0.01" value={quoteFields.shippingIndiaToNepal ?? ""} onChange={(e) => updateNumericQuoteField("shippingIndiaToNepal", e.target.value, setQuoteFields)} />
            </label>

            <label className="block">
              <div className="text-sm">Customs & Taxes (INR)</div>
              <Input type="number" step="0.01" value={quoteFields.customsTaxes ?? ""} onChange={(e) => updateNumericQuoteField("customsTaxes", e.target.value, setQuoteFields)} />
            </label>

            <label className="block">
              <div className="text-sm">Exchange rate</div>
              <Input type="number" step="0.0001" value={quoteFields.exchangeRate ?? ""} onChange={(e) => updateNumericQuoteField("exchangeRate", e.target.value, setQuoteFields)} />
            </label>

            <label className="block">
              <div className="text-sm">Expected delivery time</div>
              <Input type="text" value={quoteFields.expectedDeliveryTime ?? ""} onChange={(e) => setQuoteFields((s) => ({ ...s, expectedDeliveryTime: e.target.value }))} />
            </label>

            <label className="block">
              <div className="text-sm">Quote expiry (ISO date)</div>
              <Input type="text" value={quoteFields.quoteExpiry ?? ""} onChange={(e) => setQuoteFields((s) => ({ ...s, quoteExpiry: e.target.value }))} />
            </label>
          </div>
        </fieldset>

        <div>
          <Button type="submit" disabled={loading}>Save</Button>
        </div>
      </form>

      <pre className="mt-6 bg-slate-100 dark:bg-[#071018] dark:text-slate-100 p-3 rounded">{JSON.stringify(req, null, 2)}</pre>
    </div>
  );
}
