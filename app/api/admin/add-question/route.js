import { supabaseServer, supabaseService } from "@/lib/supabaseServer";

export async function POST(req) {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return j({ ok:false, error:"Not signed in." }, 401);

  // Check admin
  const svc = supabaseService();
  const { data: prof } = await svc.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!prof?.is_admin) return j({ ok:false, error:"Not admin." }, 403);

  const body = await req.json();
  if (!body.publish_date || !body.prompt || typeof body.correct_answer !== 'boolean' ||
      !body.success_message || !body.failure_message) {
    return j({ ok:false, error:"Missing required fields." }, 400);
  }

  const insert = {
    publish_date: body.publish_date,
    prompt: body.prompt,
    correct_answer: body.correct_answer,
    success_message: body.success_message,
    failure_message: body.failure_message,
    explanation: body.explanation || null,
    evidence_image_url: body.evidence_image_url || null,
    evidence_caption: body.evidence_caption || null,
    citation_url: body.citation_url || null,
    status: body.status || 'live',
    created_by: user.id
  };

  const { error } = await svc.from("questions").insert(insert);
  if (error) return j({ ok:false, error: error.message }, 400);

  return j({ ok:true });
}

function j(data, status=200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type":"application/json" } });
}
