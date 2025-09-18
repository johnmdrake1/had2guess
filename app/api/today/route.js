import { supabaseServer, supabaseService } from "@/lib/supabaseServer";
import { todayChicagoISO } from "@/lib/time";

export async function GET() {
  const today = todayChicagoISO();

  // Public view for question meta (no correct_answer)
  const svc = supabaseService();
  const { data: q } = await svc
    .from("public_questions")
    .select("*")
    .eq("publish_date", today)
    .maybeSingle();

  // Check if user has already guessed
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  let alreadyPlayed = false;
  let currentStreak = 0;
  if (user && q?.id) {
    const { data: g } = await svc
      .from("guesses")
      .select("id")
      .eq("user_id", user.id)
      .eq("question_id", q.id)
      .maybeSingle();
    alreadyPlayed = !!g;

    const { data: s } = await svc
      .from("streaks")
      .select("current_streak")
      .eq("user_id", user.id)
      .maybeSingle();
    currentStreak = s?.current_streak || 0;
  }

  return new Response(JSON.stringify({
    question: q || null,
    alreadyPlayed,
    currentStreak
  }), { headers: { "Content-Type": "application/json" }});
}
