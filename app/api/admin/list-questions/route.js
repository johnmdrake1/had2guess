import { supabaseServer, supabaseService } from "@/lib/supabaseServer";
import { todayChicagoISO } from "@/lib/time";

export async function GET(req) {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return j({ ok:false, error:"Not signed in." }, 401);

  const svc = supabaseService();
  const { data: prof } = await svc.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!prof?.is_admin) return j({ ok:false, error:"Not admin." }, 403);

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || "upcoming"; // "upcoming" | "recent"
  const limit = Math.min(parseInt(searchParams.get("limit")||"30", 10), 100);
  const today = todayChicagoISO();

  let q = svc.from("questions").select("*");
  if (scope === "recent") {
    q = q.lte("publish_date", today).order("publish_date", { ascending: false }).limit(limit);
  } else {
    q = q.gte("publish_date", today).order("publish_date", { ascending: true }).limit(limit);
  }

  const { data, error } = await q;
  if (error) return j({ ok:false, error: error.message }, 400);
  return j({ ok:true, items: data });
}

function j(data, status=200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type":"application/json" } });
}
