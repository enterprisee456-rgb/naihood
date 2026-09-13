import Link from "next/link";
import ListingsExplorer from "@/components/listings/ListingsExplorer";

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="nav"><Link className="logo" href="/">nai<span>hood</span></Link><div className="nav-location">⌖ Kitale HQ</div><div className="nav-actions"><a href="#how-it-works">How it works</a><a className="nav-button" href="#list-property">List a property</a><button className="profile-button" type="button" aria-label="Open account">◎</button></div></nav>
      <section className="hero">
        <div className="hero-copy"><span className="kicker">KENYA&apos;S PROPERTY NETWORK</span><h1>Find a place<br />to call <em>home.</em></h1><p>Real homes. Verified local agents. A simpler way to find your next chapter in Kitale.</p><div className="hero-chips"><span>✓ Verified listings</span><span>↗ WhatsApp-friendly</span></div></div>
        <div className="hero-card"><div className="hero-card-top"><span>Looking around?</span><span className="live-dot">● LIVE</span></div><strong>Kitale has<br /><em>options.</em></strong><p>From a quiet bedsitter in Township to your forever home in Milimani.</p><a href="#listings">Explore homes <span>↘</span></a></div>
      </section>
      <section className="location-strip"><div><span className="strip-label">EXPLORE BY PLACE</span><strong>Kitale, Trans-Nzoia</strong></div><div className="place-links"><span>Milimani</span><span>Township</span><span>Matisi</span><span>+ more</span></div></section>
      <section className="listings-section" id="listings"><div className="section-intro"><div><span className="kicker">LIVE INVENTORY</span><h2>Homes worth<br /><em>coming home to.</em></h2></div><p>Browse current homes from people who know Kitale best.</p></div><ListingsExplorer /></section>
      <footer id="how-it-works"><span className="logo">nai<span>hood</span></span><span>Built for better moves in Kenya.</span></footer>
    </main>
  );
}
