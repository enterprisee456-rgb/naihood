export const prerender=false;
export async function GET({locals,url}:any){
  const db=(locals as any).runtime?.env?.DB;
  if(!db) return new Response(JSON.stringify([]),{headers:{"Content-Type":"application/json"}});
  const hood=url.searchParams.get('hood');
  const r=hood&&hood!=='all'?await db.prepare("SELECT * FROM posts WHERE hood=?1 ORDER BY created_at DESC LIMIT 50").bind(hood).all():await db.prepare("SELECT * FROM posts ORDER BY created_at DESC LIMIT 50").all();
  return new Response(JSON.stringify(r.results||[]),{headers:{"Content-Type":"application/json"}});
}
export async function POST({request,locals}:any){
  const {username,hood,text}=await request.json(); const db=(locals as any).runtime?.env?.DB;
  const id=Date.now().toString(36)+Math.random().toString(36).slice(2,4);
  if(db) await db.prepare("INSERT INTO posts (id,username,hood,text,likes) VALUES (?1,?2,?3,?4,0)").bind(id,username,hood,text).run();
  return new Response(JSON.stringify({id,username,hood,text,likes:0,created_at:new Date().toISOString()}),{headers:{"Content-Type":"application/json"}});
}
