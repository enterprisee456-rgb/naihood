import Link from "next/link";
import ListingsExplorer from "@/components/listings/ListingsExplorer";
import SiteHeader from "@/components/SiteHeader";

export default function SearchPage() {
  return <main><SiteHeader /><section className="search-page shell"><div className="search-page-heading"><p className="eyebrow">Naihood search</p><h1>Find the right<br /><i>place for you.</i></h1><p>Search active homes by location, price, type, bedrooms and bathrooms.</p></div><ListingsExplorer dedicated /><Link className="search-back" href="/#homes">← Back to home</Link></section></main>;
}
