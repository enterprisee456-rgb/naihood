"use client";

import { FormEvent, useState } from "react";

export default function InquiryForm({ listingId }: { listingId: string }) {
  const [form, setForm] = useState({ name: "", phone: "", message: "I am interested in viewing this property." });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function submit(event: FormEvent) { event.preventDefault(); setStatus("sending"); try { const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId, ...form }) }); if (!response.ok) throw new Error(); setStatus("sent"); } catch { setStatus("error"); } }
  if (status === "sent") return <div className="form-success"><strong>Your message is on its way.</strong><span>The listing contact will reach you on your phone.</span></div>;
  return <form className="inquiry-form" onSubmit={submit}><h2>Ask about this place</h2><label>Your name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Phone number<input required type="tel" placeholder="07XX XXX XXX" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label>Message<textarea required rows={3} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label>{status === "error" && <p className="form-error">We could not send that. Please try again.</p>}<button type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending..." : "Send inquiry ↗"}</button><small>We only share your details with this listing contact.</small></form>;
}
