"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Notification = { id: string; title: string; body: string; href: string | null; readAt: string | null };
export default function NotificationsBell() {
  const [items, setItems] = useState<Notification[]>([]); const [open, setOpen] = useState(false);
  useEffect(() => { const load = async () => { const response = await fetch("/api/notifications"); if (response.ok) setItems((await response.json() as { data: Notification[] }).data); }; const initial = window.setTimeout(() => void load(), 0); const timer = window.setInterval(() => void load(), 10000); return () => { window.clearTimeout(initial); window.clearInterval(timer); }; }, []);
  async function openBell() { const nextOpen = !open; setOpen(nextOpen); if (nextOpen && items.some((item) => !item.readAt)) { await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" }); setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() }))); } }
  const unread = items.filter((item) => !item.readAt).length;
  return <div className="notifications"><button className="notification-button" type="button" aria-label="Notifications" onClick={openBell}>♧{unread > 0 && <b>{unread}</b>}</button>{open && <div className="notification-menu"><div className="notification-menu-head"><span>Notifications</span>{unread > 0 && <small>{unread} new</small>}</div>{items.length ? items.slice(0, 5).map((item) => item.href ? <Link href={item.href} key={item.id} onClick={() => setOpen(false)}><strong>{item.title}</strong><span>{item.body}</span></Link> : <div key={item.id}><strong>{item.title}</strong><span>{item.body}</span></div>) : <p>Nothing new yet.</p>}</div>}</div>;
}
