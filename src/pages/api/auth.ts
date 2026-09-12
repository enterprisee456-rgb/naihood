export const prerender=false;
export async function POST({request,locals}:any){
  const {username,hood}=await request.json(); const db=(locals as any).runtime?.env?.DB;
  if(db){ await db.prepare("INSERT OR IGNORE INTO users (username,hood) VALUES (?1,?2)").bind(username,hood).run(); }
  return new Response(JSON.stringify({username,hood}),{headers:{"Content-Type":"application/json"}});
}
