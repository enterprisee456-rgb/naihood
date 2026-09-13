import { notFound, redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import EditListingForm from "@/components/dashboard/EditListingForm";
import { getSessionUser, isProvider } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session || !isProvider(session.role)) redirect("/login");
  const { id } = await params;
  const listing = await prisma.listing.findFirst({ where: { id, ownerId: session.sub }, select: { id: true, title: true, description: true, priceKes: true, status: true } });
  if (!listing) notFound();
  return <main><SiteHeader backHref="/dashboard" backLabel="Dashboard" /><section className="post-shell shell"><div className="post-intro"><p className="eyebrow">Manage your listing</p><h1>Keep it<br /><i>current.</i></h1><p>Fresh details help the right people find your property.</p></div><EditListingForm listing={listing} /></section></main>;
}
