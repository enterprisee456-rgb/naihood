"use client";

import { useEffect, useState, useTransition } from "react";

type Listing = {
  id: string;
  title: string;
  description: string;
  type: "RENT" | "SALE";
  propertyType: string;
  priceKes: number;
  bedrooms: number | null;
  bathrooms: number | null;
  imageUrl: string;
  location: { county: string; town: string; estate: string };
  owner: { name: string; role: string };
};

const money = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

export default function ListingsExplorer() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"" | "RENT" | "SALE">("");
  const [estate, setEstate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ town: "Kitale" });
    if (query.trim()) params.set("q", query.trim());
    if (type) params.set("type", type);
    if (estate) params.set("estate", estate);

    fetch(`/api/listings?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("We could not load listings right now.");
        return (await response.json()) as { data: Listing[] };
      })
      .then((payload) => setListings(payload.data))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Something went wrong.");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [query, type, estate, requestKey]);

  const beginFilterChange = () => {
    setIsLoading(true);
    setError("");
  };

  const updateType = (value: "" | "RENT" | "SALE") => {
    beginFilterChange();
    startTransition(() => setType(value));
  };

  return (
    <section className="explorer" aria-label="Kitale property listings">
      <div className="search-panel">
        <div className="search-field">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => { beginFilterChange(); setQuery(event.target.value); }} placeholder="Search Kitale homes, estates..." aria-label="Search listings" />
        </div>
        <select value={estate} onChange={(event) => { beginFilterChange(); setEstate(event.target.value); }} aria-label="Filter by estate">
          <option value="">All estates</option>
          <option value="Milimani">Milimani</option>
          <option value="Township">Township</option>
          <option value="Matisi">Matisi</option>
        </select>
      </div>
      <div className="filter-row" role="group" aria-label="Listing type">
        {[{ value: "", label: "All homes" }, { value: "RENT", label: "For rent" }, { value: "SALE", label: "For sale" }].map((option) => (
          <button key={option.value} className={type === option.value ? "filter active" : "filter"} onClick={() => updateType(option.value as "" | "RENT" | "SALE")} type="button">
            {option.label}
          </button>
        ))}
        <span className="result-note">{isPending ? "Updating..." : `${listings.length} homes in Kitale`}</span>
      </div>
      {isLoading ? <div className="listing-grid" aria-label="Loading listings">{[1, 2, 3].map((item) => <div className="listing-skeleton" key={item} />)}</div> : error ? <div className="state-card error-state"><strong>Listings are taking a moment.</strong><span>{error}</span><button type="button" onClick={() => { setIsLoading(true); setError(""); setRequestKey((current) => current + 1); }}>Try again</button></div> : listings.length === 0 ? <div className="state-card"><strong>No homes match those filters.</strong><span>Try another estate or search term.</span></div> : <div className="listing-grid">{listings.map((listing) => <article className="listing-card" key={listing.id}><img src={listing.imageUrl} alt="" loading="lazy" /><div className="listing-content"><div className="listing-topline"><span className="listing-type">{listing.type === "RENT" ? "FOR RENT" : "FOR SALE"}</span><span className="listing-location">{listing.location.estate}, {listing.location.town}</span></div><h2>{listing.title}</h2><p>{listing.description}</p><div className="listing-meta"><span>{listing.bedrooms ?? "-"} beds</span><span>{listing.bathrooms ?? "-"} baths</span><span>{listing.propertyType.replaceAll("_", " ").toLowerCase()}</span></div><div className="listing-footer"><strong>KES {money.format(listing.priceKes)}{listing.type === "RENT" && <small> / month</small>}</strong><button type="button">View home</button></div></div></article>)}</div>}
    </section>
  );
}
