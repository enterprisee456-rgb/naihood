"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileNav({ isProvider, isLoggedIn }: { isProvider: boolean; isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="mobile-menu-button" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen((current) => !current)}><span /><span /><span /></button>
    {open && <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile navigation"><div className="mobile-drawer-head"><span className="eyebrow">Navigate</span><button className="mobile-close" type="button" aria-label="Close navigation" onClick={() => setOpen(false)}>×</button></div><nav className="mobile-links" aria-label="Mobile navigation links"><Link href="/#homes" onClick={() => setOpen(false)}>Browse homes <span>↗</span></Link>{isProvider && <Link href="/list-your-property" onClick={() => setOpen(false)}>List a property <span>+</span></Link>}{isLoggedIn ? <form action="/api/auth/logout" method="post"><button type="submit">Log out <span>↗</span></button></form> : <><Link href="/login" onClick={() => setOpen(false)}>Log in <span>↗</span></Link><Link href="/signup" onClick={() => setOpen(false)}>Get started <span>+</span></Link></>}</nav><p className="mobile-drawer-foot">Thoughtfully listed homes across Kenya.</p></div>}
  </>;
}
