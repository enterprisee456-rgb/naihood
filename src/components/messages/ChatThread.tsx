"use client";

import { FormEvent, useEffect, useState } from "react";

type Message = { id: string; body: string; createdAt: string; readAt: string | null; sender: { id: string; name: string } };
type Conversation = { id: string; listing: { id: string; title: string }; seeker: { id: string; name: string }; owner: { id: string; name: string }; messages: Message[] };
export default function ChatThread({ conversationId, userId }: { conversationId: string; userId: string }) {
  const [conversation, setConversation] = useState<Conversation | null>(null); const [body, setBody] = useState(""); const [error, setError] = useState("");
  async function load() { const response = await fetch(`/api/conversations/${conversationId}`); if (response.ok) setConversation((await response.json() as { data: Conversation }).data); }
  useEffect(() => { const refresh = () => { void fetch(`/api/conversations/${conversationId}`).then(async (response) => { if (response.ok) setConversation((await response.json() as { data: Conversation }).data); }); }; const initial = window.setTimeout(refresh, 0); const timer = window.setInterval(refresh, 5000); return () => { window.clearTimeout(initial); window.clearInterval(timer); }; }, [conversationId]);
  async function send(event: FormEvent) { event.preventDefault(); if (!body.trim()) return; const response = await fetch(`/api/conversations/${conversationId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) }); if (!response.ok) { setError("Message could not be sent."); return; } setBody(""); setError(""); await load(); }
  if (!conversation) return <div className="state-card"><strong>Loading conversation...</strong></div>;
  const other = conversation.seeker.id === userId ? conversation.owner.name : conversation.seeker.name;
  return <section className="chat-thread"><div className="chat-heading"><div><p className="eyebrow">{conversation.listing.title}</p><h2>{other}</h2></div><span>Refreshes every 5 seconds</span></div><div className="chat-messages">{conversation.messages.map((message) => <div className={message.sender.id === userId ? "chat-bubble mine" : "chat-bubble"} key={message.id}><p>{message.body}</p><small>{new Date(message.createdAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}{message.sender.id === userId && message.readAt ? " · Seen" : ""}</small></div>)}</div><form className="chat-compose" onSubmit={send}><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message..." rows={2} aria-label="Message" /><button className="publish-button" type="submit">Send ↗</button>{error && <small className="form-error">{error}</small>}</form></section>;
}
