import Link from "next/link";
import ListingsExplorer from "@/components/listings/ListingsExplorer";
import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const featured = await prisma.listing.findFirst({ where: { status: "ACTIVE" }, include: { location: true }, orderBy: { createdAt: "desc" } });
  const placeName = featured ? `${featured.location.estate}, ${featured.location.town}` : "Your next neighbourhood";
  return (
    <main>
      <SiteHeader />
      <section className={`hero shell${featured ? "" : " hero-empty"}`}><div className="hero-copy"><p className="eyebrow">A better way to move in Kenya</p><h1>Find your next<br /><i>good place.</i></h1><p className="hero-lede">Thoughtfully listed homes, apartments and land from people who know their neighbourhoods.</p><div className="hero-proof"><span>01</span><span className="proof-line" /><span>Local listings</span><span>02</span><span className="proof-line" /><span>Real conversations</span></div></div>{featured && <div className="hero-scene" style={{ backgroundImage: `linear-gradient(145deg, rgba(23,77,67,.2), transparent 40%), url("${featured.imageUrl}")` }} aria-label={featured.title}><div className="scene-label"><span>Featured neighbourhood</span><strong>{placeName}</strong></div><div className="scene-note">A place with<br /><i>room to breathe.</i></div></div>}</section>
      <section className="search-band shell" id="homes"><div className="search-heading"><span className="eyebrow">THE NAIHOOD EDIT</span><h2>Start with a feeling,<br /><i>then find the address.</i></h2></div><ListingsExplorer /></section>
      <section className="neighbourhood-band"><div className="shell neighbourhood-content"><div><p className="eyebrow">Good places, close by</p><h2>{featured ? featured.location.town : "Your next town"} is<br /><i>open for you.</i></h2></div><div className="neighbourhood-copy"><p>Explore current homes from people who know their neighbourhoods best.</p><Link href="/#homes">Explore homes <span>↗</span></Link></div></div></section>
      <footer className="footer shell"><Link className="wordmark" href="/">nai<span>hood</span></Link><span>Built for better moves in Kenya.</span><Link href="/list-your-property">List your property <span>↗</span></Link></footer>
    </main>
  );
}
