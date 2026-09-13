import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import ChatThread from "@/components/messages/ChatThread";
import { getCurrentUser } from "@/lib/auth";

export default async function MessageThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const { id } = await params;
  return <main><SiteHeader backHref="/messages" backLabel="Messages" /><section className="messages-page shell"><ChatThread conversationId={id} userId={user.id} /></section></main>;
}
