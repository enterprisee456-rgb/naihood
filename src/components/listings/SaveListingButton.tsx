"use client";

import { useState } from "react";

export default function SaveListingButton({ listingId, initialSaved = false }: { listingId: string; initialSaved?: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState("");
  async function toggle() { setError(""); const response = await fetch(`/api/saved-listings/${listingId}`, { method: saved ? "DELETE" : "POST" }); if (response.status === 401) { setError("Log in to save this home."); return; } if (!response.ok) { setError("Could not update your shortlist."); return; } setSaved(!saved); }
  return <span className="save-control"><button type="button" className={saved ? "save-button saved" : "save-button"} aria-label={saved ? "Remove from saved homes" : "Save this home"} aria-pressed={saved} onClick={toggle}>{saved ? "♥" : "♡"}</button>{error && <small>{error}</small>}</span>;
}
