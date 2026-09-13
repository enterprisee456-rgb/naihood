"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

type Listing = { id: string; title: string; description: string; type: "RENT" | "SALE"; propertyType: string; priceKes: number; bedrooms: number | null; bathrooms: number | null; imageUrl: string; location: { town: string; estate: string } };
const money = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

export default function ListingsExplorer() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"" | "RENT" | "SALE">("");
  const [estate, setEstate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (type) params.set("type", type);
    if (estate) params.set("estate", estate);
    fetch(`/api/listings?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error("We could not load listings right now."); return response.json() as Promise<{ data: Listing[] }>; })
      .then((payload) => setListings(payload.data))
      .catch((reason: unknown) => { if (reason instanceof DOMException && reason.name === "AbortError") return; setError(reason instanceof Error ? reason.message : "Something went wrong."); })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [query, type, estate]);

  const changeType = (value: "" | "RENT" | "SALE") => { setIsLoading(true); setError(""); startTransition(() => setType(value)); };
  const estates = Array.from(new Set(listings.map((listing) => listing.location.estate))).sort();
  return <section className="explorer" aria-label="Kitale property listings">
    <div className="search-panel"><label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setIsLoading(true); setQuery(event.target.value); }} placeholder="Search homes, estates..." aria-label="Search listings" /></label><select value={estate} onChange={(event) => { setIsLoading(true); setEstate(event.target.value); }} aria-label="Filter by estate"><option value="">All estates</option>{estates.map((name) => <option value={name} key={name}>{name}</option>)}</select></div>
    <div className="filter-row" role="group" aria-label="Listing type">{[{ value: "", label: "All homes" }, { value: "RENT", label: "For rent" }, { value: "SALE", label: "For sale" }].map((option) => <button key={option.value} className={type === option.value ? "filter active" : "filter"} onClick={() => changeType(option.value as "" | "RENT" | "SALE")} type="button">{option.label}</button>)}<span className="result-note">{isPending ? "Updating..." : `${listings.length} homes in Kitale`}</span></div>
    {isLoading ? <div className="listing-grid" aria-label="Loading listings">{[1, 2, 3].map((item) => <div className="listing-skeleton" key={item} />)}</div> : error ? <div className="state-card error-state"><strong>Listings are taking a moment.</strong><span>{error}</span><button type="button" onClick={() => window.location.reload()}>Try again</button></div> : listings.length === 0 ? <div className="state-card"><strong>No homes match those filters.</strong><span>Try another estate or search term.</span></div> : <div className="listing-grid">{listings.map((listing) => <Link className="listing-card" href={`/listings/${listing.id}`} key={listing.id}><div className="listing-image" style={{ backgroundImage: `url(${listing.imageUrl})` }}><span>{listing.type === "RENT" ? "For rent" : "For sale"}</span><span className="arrow">↗</span></div><div className="listing-content"><div className="listing-topline"><span className="listing-type">{listing.type === "RENT" ? "FOR RENT" : "FOR SALE"}</span><span className="listing-location">{listing.location.estate}, {listing.location.town}</span></div><h2>{listing.title}</h2><p>{listing.description}</p><div className="listing-meta"><span>{listing.bedrooms ?? "-"} beds</span><span>{listing.bathrooms ?? "-"} baths</span><span>{listing.propertyType.replaceAll("_", " ").toLowerCase()}</span></div><div className="listing-footer"><strong>KES {money.format(listing.priceKes)}{listing.type === "RENT" && <small> / month</small>}</strong><span className="view-link">View home ↗</span></div></div></Link>)}</div>}
  </section>;
}
