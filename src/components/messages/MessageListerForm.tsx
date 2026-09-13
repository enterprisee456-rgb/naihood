"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function MessageListerForm({ listingId }: { listingId: string }) {
  const router = useRouter(); const [body, setBody] = useState(""); const [error, setError] = useState(""); const [sending, setSending] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setSending(true); setError(""); const response = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId, body }) }); if (response.status === 401) { router.push(`/login?next=/listings/${listingId}`); return; } if (!response.ok) { setError("Message could not be sent."); setSending(false); return; } const result = await response.json() as { data: { conversationId: string } }; router.push(`/messages/${result.data.conversationId}`); }
  return <form className="message-lister-form" onSubmit={submit}><h3>Message the lister</h3><textarea required minLength={2} rows={3} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Ask about viewing times or availability..." /><button className="publish-button" type="submit" disabled={sending}>{sending ? "Sending..." : "Send message ↗"}</button>{error && <small className="form-error">{error}</small>}</form>;
}
