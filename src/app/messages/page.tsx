import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MessagesPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login?next=/messages");
  const conversations = await prisma.conversation.findMany({ where: { OR: [{ seekerId: user.id }, { ownerId: user.id }] }, include: { listing: { select: { title: true } }, seeker: { select: { id: true, name: true } }, owner: { select: { id: true, name: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } });
  return <main><SiteHeader /><section className="messages-page shell"><div className="search-page-heading"><p className="eyebrow">Your conversations</p><h1>Keep the<br /><i>conversation going.</i></h1></div>{conversations.length ? <div className="conversation-list">{conversations.map((conversation) => { const other = conversation.seeker.id === user.id ? conversation.owner.name : conversation.seeker.name; const last = conversation.messages[0]; return <Link className="conversation-item" href={`/messages/${conversation.id}`} key={conversation.id}><div className="conversation-avatar">{other.slice(0, 1).toUpperCase()}</div><div><strong>{other}</strong><span>{conversation.listing.title}</span><p>{last?.body ?? "Start the conversation"}</p></div><time>{last ? new Date(last.createdAt).toLocaleDateString("en-KE") : ""}</time></Link>; })}</div> : <div className="state-card"><strong>No conversations yet.</strong><span>Message a listing owner to start a real conversation.</span><Link href="/search">Find a home ↗</Link></div>}</section></main>;
}
