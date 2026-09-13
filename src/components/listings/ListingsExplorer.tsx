"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Listing = { id: string; title: string; description: string; type: "RENT" | "SALE"; propertyType: string; priceKes: number; bedrooms: number | null; bathrooms: number | null; imageUrl: string; location: { town: string; estate: string; county?: string } };
type Location = { county: string; town: string; estate: string };
type SearchFilters = { q: string; county: string; town: string; estate: string; type: "" | "RENT" | "SALE"; propertyType: string; minPrice: string; maxPrice: string; minBedrooms: string; minBathrooms: string };

const money = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });
const blankFilters: SearchFilters = { q: "", county: "", town: "", estate: "", type: "", propertyType: "", minPrice: "", maxPrice: "", minBedrooms: "", minBathrooms: "" };

function readUrlFilters(): SearchFilters {
  if (typeof window === "undefined") return blankFilters;
  const params = new URLSearchParams(window.location.search);
  const next = { ...blankFilters };
  Object.keys(next).forEach((key) => { const value = params.get(key); if (value) next[key as keyof SearchFilters] = value as never; });
  return next;
}

export default function ListingsExplorer({ dedicated = false }: { dedicated?: boolean }) {
  const [filters, setFilters] = useState<SearchFilters>(readUrlFilters);
  const [applied, setApplied] = useState<SearchFilters>(readUrlFilters);
  const [listings, setListings] = useState<Listing[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetch("/api/locations").then((response) => response.json() as Promise<{ data: Location[] }>).then((payload) => setLocations(payload.data)).catch(() => setLocations([])); }, []);
  useEffect(() => { const timer = window.setTimeout(() => setApplied(filters), 320); return () => window.clearTimeout(timer); }, [filters]);
  useEffect(() => {
    const controller = new AbortController(); const params = new URLSearchParams(); Object.entries(applied).forEach(([key, value]) => { if (value) params.set(key, value); });
    if (dedicated) window.history.replaceState(null, "", `/search${params.toString() ? `?${params}` : ""}`);
    if (dedicated && Object.values(applied).some(Boolean)) void fetch("/api/recent-searches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...applied, label: [applied.town, applied.estate, applied.propertyType, applied.type].filter(Boolean).join(" · ") || applied.q }) });
    fetch(`/api/listings?${params}`, { signal: controller.signal }).then(async (response) => { if (!response.ok) throw new Error("We could not load listings right now."); return response.json() as Promise<{ data: Listing[] }>; }).then((payload) => setListings(payload.data)).catch((reason: unknown) => { if (reason instanceof DOMException && reason.name === "AbortError") return; setError(reason instanceof Error ? reason.message : "Something went wrong."); }).finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [applied, dedicated]);

  const update = (key: keyof SearchFilters, value: string) => { setIsLoading(true); setError(""); setFilters((current) => ({ ...current, [key]: value, ...(key === "county" ? { town: "", estate: "" } : {}), ...(key === "town" ? { estate: "" } : {}) })); };
  const clear = () => { setIsLoading(true); setError(""); setFilters(blankFilters); };
  const counties = Array.from(new Set(locations.map((location) => location.county))).sort();
  const towns = Array.from(new Set(locations.filter((location) => !filters.county || location.county === filters.county).map((location) => location.town))).sort();
  const estates = Array.from(new Set(locations.filter((location) => (!filters.county || location.county === filters.county) && (!filters.town || location.town === filters.town)).map((location) => location.estate))).sort();
  const hasFilters = Object.values(filters).some(Boolean);

  return <section className="explorer" aria-label="Property search"><div className="search-panel"><label className="search-field"><span aria-hidden="true">⌕</span><input value={filters.q} onChange={(event) => update("q", event.target.value)} placeholder="Search homes, towns, estates..." aria-label="Search listings" /></label><select value={filters.county} onChange={(event) => update("county", event.target.value)} aria-label="Filter by county"><option value="">All counties</option>{counties.map((name) => <option value={name} key={name}>{name}</option>)}</select><select value={filters.town} onChange={(event) => update("town", event.target.value)} aria-label="Filter by town"><option value="">All towns</option>{towns.map((name) => <option value={name} key={name}>{name}</option>)}</select><select value={filters.estate} onChange={(event) => update("estate", event.target.value)} aria-label="Filter by neighbourhood"><option value="">All neighbourhoods</option>{estates.map((name) => <option value={name} key={name}>{name}</option>)}</select></div><div className="advanced-search"><label>Property<select value={filters.propertyType} onChange={(event) => update("propertyType", event.target.value)}><option value="">Any type</option><option value="APARTMENT">Apartment</option><option value="HOUSE">House</option><option value="BED_SITTER">Bedsitter</option><option value="STUDIO">Studio</option><option value="LAND">Land</option><option value="COMMERCIAL">Commercial</option></select></label><label>Min price<input inputMode="numeric" type="number" min="0" placeholder="KES" value={filters.minPrice} onChange={(event) => update("minPrice", event.target.value)} /></label><label>Max price<input inputMode="numeric" type="number" min="0" placeholder="KES" value={filters.maxPrice} onChange={(event) => update("maxPrice", event.target.value)} /></label><label>Min beds<select value={filters.minBedrooms} onChange={(event) => update("minBedrooms", event.target.value)}><option value="">Any</option>{[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>{value}+</option>)}</select></label><label>Min baths<select value={filters.minBathrooms} onChange={(event) => update("minBathrooms", event.target.value)}><option value="">Any</option>{[1, 2, 3, 4].map((value) => <option value={value} key={value}>{value}+</option>)}</select></label></div><div className="filter-row" role="group" aria-label="Listing type">{[{ value: "", label: "All homes" }, { value: "RENT", label: "For rent" }, { value: "SALE", label: "For sale" }].map((option) => <button key={option.value} className={filters.type === option.value ? "filter active" : "filter"} onClick={() => update("type", option.value)} type="button">{option.label}</button>)}<span className="result-note">{isLoading ? "Searching..." : `${listings.length} homes listed`}</span>{hasFilters && <button className="clear-search" type="button" onClick={clear}>Clear filters</button>}</div>{isLoading ? <div className="listing-grid" aria-label="Loading listings">{[1, 2, 3].map((item) => <div className="listing-skeleton" key={item} />)}</div> : error ? <div className="state-card error-state"><strong>Search is taking a moment.</strong><span>{error}</span><button type="button" onClick={() => { setIsLoading(true); setApplied({ ...filters }); }}>Try again</button></div> : listings.length === 0 ? <div className="state-card"><strong>{hasFilters ? "No listings match these filters." : "No listings yet."}</strong><span>{hasFilters ? "Try widening your search or clearing a filter." : "New homes will appear here as landlords and agents publish them."}</span>{hasFilters && <button type="button" onClick={clear}>Clear filters</button>}</div> : <div className="listing-grid">{listings.map((listing) => <Link className="listing-card" href={`/listings/${listing.id}`} key={listing.id}><div className="listing-image" style={{ backgroundImage: `url(${listing.imageUrl})` }}><span>{listing.type === "RENT" ? "For rent" : "For sale"}</span><span className="arrow">↗</span></div><div className="listing-content"><div className="listing-topline"><span className="listing-type">{listing.type === "RENT" ? "FOR RENT" : "FOR SALE"}</span><span className="listing-location">⌖ {listing.location.estate}, {listing.location.town}</span></div><h2>{listing.title}</h2><p>{listing.description}</p><div className="listing-meta"><span>{listing.bedrooms ?? "-"} beds</span><span>{listing.bathrooms ?? "-"} baths</span><span>{listing.propertyType.replaceAll("_", " ").toLowerCase()}</span></div><div className="listing-footer"><strong>KES {money.format(listing.priceKes)}{listing.type === "RENT" && <small> / month</small>}</strong><span className="view-link">View home ↗</span></div></div></Link>)}</div>}</section>;
}
