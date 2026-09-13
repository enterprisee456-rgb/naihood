"use client";

import { useState } from "react";

export default function ListingStatusButton({ listingId, status }: { listingId: string; status: string }) {
  const [current, setCurrent] = useState(status);
  const next = current === "ACTIVE" ? "PAUSED" : "ACTIVE";
  async function changeStatus() { const response = await fetch(`/api/listings/${listingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) }); if (response.ok) setCurrent(next); }
  return <button type="button" onClick={changeStatus}>{current === "ACTIVE" ? "Pause" : "Activate"}</button>;
}
