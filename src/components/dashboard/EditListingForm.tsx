"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Props = { listing: { id: string; title: string; description: string; priceKes: number; status: string } };
export default function EditListingForm({ listing }: Props) {
  const [form, setForm] = useState({ title: listing.title, description: listing.description, priceKes: String(listing.priceKes), status: listing.status });
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); setMessage(""); const response = await fetch(`/api/listings/${listing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); setMessage(response.ok ? "Changes saved." : "We could not save those changes."); }
  return <form className="listing-form" onSubmit={submit}><div className="form-heading"><h2>Edit your property</h2><span>Update the details people see first</span></div><div className="form-section"><label>Listing title *<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label>Description *<textarea required rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label>Price in KES *<input required type="number" min="1" value={form.priceKes} onChange={(event) => setForm({ ...form, priceKes: event.target.value })} /></label><label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="ACTIVE">Active</option><option value="PAUSED">Paused</option><option value="RENTED">Rented</option><option value="SOLD">Sold</option></select></label></div>{message && <p className="form-success"><strong>{message}</strong></p>}<button className="publish-button" type="submit">Save changes ↗</button><Link className="search-back" href="/dashboard">← Back to dashboard</Link></form>;
}
