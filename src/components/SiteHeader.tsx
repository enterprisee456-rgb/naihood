import Link from "next/link";
import { getSessionUser, isProvider } from "@/lib/auth";

export default async function SiteHeader({ backHref, backLabel }: { backHref?: string; backLabel?: string }) {
  const session = await getSessionUser();
  return <header className="topbar shell"><Link className="wordmark" href="/">nai<span>hood</span></Link>{backHref ? <Link className="back-link" href={backHref}>← {backLabel ?? "Browse homes"}</Link> : <div className="topbar-place"><span className="status-dot" /> Kenya property network</div>}<nav className="topnav" aria-label="Main navigation"><Link href="/#homes">Browse homes</Link>{session ? <><span className="session-name">{session.name}</span>{isProvider(session.role) && <Link className="outline-button" href="/list-your-property">List a property <span>+</span></Link>}<form action="/api/auth/logout" method="post"><button className="topbar-action" type="submit">Log out</button></form></> : <><Link className="auth-nav-link" href="/login">Log in</Link><Link className="outline-button" href="/signup">Get started <span>+</span></Link></>}</nav></header>;
}
