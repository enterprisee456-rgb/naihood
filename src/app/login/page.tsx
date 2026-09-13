import AuthForm from "@/components/auth/AuthForm";
import SiteHeader from "@/components/SiteHeader";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return <main><SiteHeader /><section className="auth-shell shell"><AuthForm mode="login" nextPath={params.next?.startsWith("/") ? params.next : "/"} /></section></main>;
}
