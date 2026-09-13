import { notFound } from "next/navigation";
import InquiryForm from "@/components/listings/InquiryForm";
import SiteHeader from "@/components/SiteHeader";
import SaveListingButton from "@/components/listings/SaveListingButton";
import { getSessionUser } from "@/lib/auth";
import MessageListerForm from "@/components/messages/MessageListerForm";
import { prisma } from "@/lib/prisma";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, include: { location: true, owner: { select: { name: true, role: true } } } });
  if (!listing || listing.status !== "ACTIVE") notFound();
  const session = await getSessionUser();
  const saved = session ? Boolean(await prisma.savedListing.findUnique({ where: { userId_listingId: { userId: session.sub, listingId: id } }, select: { id: true } })) : false;
  const money = new Intl.NumberFormat("en-KE");
  return <main><SiteHeader backHref="/#homes" /><div className="detail-shell shell"><div className="detail-image" style={{ backgroundImage: `url(${listing.imageUrl})` }}><span>{listing.type === "RENT" ? "For rent" : "For sale"}</span></div><div className="detail-grid"><article className="detail-copy"><p className="eyebrow">{listing.location.estate}, {listing.location.town} · {listing.location.county}</p><div className="detail-title-row"><h1>{listing.title}</h1><SaveListingButton listingId={listing.id} initialSaved={saved} /></div><div className="detail-price">KES {money.format(listing.priceKes)}{listing.type === "RENT" && <small> / month</small>}</div><div className="detail-stats"><span><strong>{listing.bedrooms ?? "-"}</strong> beds</span><span><strong>{listing.bathrooms ?? "-"}</strong> baths</span><span><strong>{listing.propertyType.replaceAll("_", " ").toLowerCase()}</strong></span></div><p className="detail-description">{listing.description}</p><h2>About this place</h2><div className="amenities">{listing.amenities.split(",").filter(Boolean).map((amenity) => <span key={amenity}>{amenity}</span>)}</div><div className="location-cue"><span>⌖</span><div><strong>{listing.location.estate}</strong><small>{listing.location.town}, {listing.location.county}</small></div></div></article><aside><div className="owner-card"><p className="eyebrow">Listed by</p><strong>{listing.owner.name}</strong><span>{listing.owner.role === "AGENT" ? "Local property agent" : "Property owner"}</span><MessageListerForm listingId={listing.id} /><InquiryForm listingId={listing.id} /></div></aside></div></div></main>;
}
