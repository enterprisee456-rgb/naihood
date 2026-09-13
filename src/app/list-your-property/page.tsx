import ListingForm from "@/components/listings/ListingForm";
import SiteHeader from "@/components/SiteHeader";
import { getSessionUser, isProvider } from "@/lib/auth";
import Link from "next/link";

export default async function ListYourProperty() {
  const session = await getSessionUser();
  const canPost = isProvider(session?.role);
  return <main><SiteHeader backHref="/#homes" />{canPost ? <section className="post-shell shell"><div className="post-intro"><p className="eyebrow">For owners and local agents</p><h1>Put your place<br /><i>on the map.</i></h1><p>Share the details people need to make a confident first move. Your listing goes live as soon as you publish it.</p><div className="post-steps"><span><b>01</b> Add the essentials</span><span><b>02</b> Get discovered</span><span><b>03</b> Start a conversation</span></div></div><ListingForm /></section> : <section className="auth-shell shell"><div className="auth-card"><div className="auth-card-heading"><p className="eyebrow">Provider access</p><h1>Ready to put your place<br /><i>on the map?</i></h1><p>Create an owner or agent account to publish listings and manage inquiries.</p></div><Link className="publish-button auth-cta" href={session ? "/signup" : "/signup?next=/list-your-property"}>{session ? "Create a provider account ↗" : "Create an account ↗"}</Link>{session && <p className="auth-switch">You are currently signed in as a home seeker.</p>}</div></section>}</main>;
}
