import { supabaseServer, supabaseService } from "@/lib/supabaseServer";
import { todayChicagoISO } from "@/lib/time";

export async function POST(req) {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return resp({ ok: false, error: "Sign in to play." }, 401);
  }

  const { guess } = await req.json();
  if (typeof guess !== "boolean") return resp({ ok:false, error:"Invalid guess" }, 400);

  const today = todayChicagoISO();
  const svc = supabaseService();

  // Get today's full question (with answer)
  const { data: q, error: qerr } = await svc
    .from("questions")
    .select("*")
    .eq("publish_date", today)
    .maybeSingle();

  if (qerr || !q) return resp({ ok:false, error:"No question today." }, 404);

  // Check if already played
  const { data: existing } = await svc
    .from("guesses")
    .select("id")
    .eq("user_id", user.id)
    .eq("question_id", q.id)
    .maybeSingle();
  if (existing) return resp({ ok:false, error:"Already played today." }, 400);

  const correct = guess === q.correct_answer;

  // Insert guess
  const { error: gerr } = await svc.from("guesses").insert({
    user_id: user.id,
    question_id: q.id,
    guess,
    is_correct: correct
  });
  if (gerr) return resp({ ok:false, error:"Could not record guess." }, 500);

  // Update streaks
  const todayDate = today; // 'YYYY-MM-DD'
  let nextStreak = 0;

  // Get current streak row
  const { data: srow } = await svc
    .from("streaks")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const lastPlayed = srow?.last_played_date; // as YYYY-MM-DD
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yyyy = yesterday.getFullYear();
  const mm = String(yesterday.getMonth()+1).padStart(2,'0');
  const dd = String(yesterday.getDate()).padStart(2,'0');
  const ystr = `${yyyy}-${mm}-${dd}`;

  let current = srow?.current_streak || 0;
  let maxs = srow?.max_streak || 0;

  if (correct) {
    if (lastPlayed === todayDate) {
      // already played today (shouldn't happen due to unique), keep
    } else if (lastPlayed === ystr) {
      current = current + 1;
    } else {
      current = 1;
    }
    if (current > maxs) maxs = current;
  } else {
    current = 0;
  }

  nextStreak = current;

  if (srow) {
    await svc.from("streaks").update({
      current_streak: current,
      max_streak: maxs,
      last_played_date: todayDate
    }).eq("user_id", user.id);
  } else {
    await svc.from("streaks").insert({
      user_id: user.id,
      current_streak: current,
      max_streak: maxs,
      last_played_date: todayDate
    });
  }

  // Build payload (never send correct_answer boolean directly)
  const payload = {
    success_message: q.success_message,
    failure_message: q.failure_message,
    explanation: q.explanation,
    evidence_image_url: q.evidence_image_url,
    evidence_caption: q.evidence_caption,
    citation_url: q.citation_url
  };

  return resp({ ok:true, correct, payload, nextStreak });
}

function resp(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
