import Header from "@/components/Header";
import { supabaseService } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function Leaderboard() {
  const svc = supabaseService();
  const { data } = await svc
    .from("public_streaks")
    .select("*")
    .order("current_streak", { ascending: false })
    .order("max_streak", { ascending: false })
    .limit(100);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">Leaderboard</h1>
        <div className="glass overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Username</th>
                <th className="text-right p-3">Current</th>
                <th className="text-right p-3">Max</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map((row, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="p-3">{i+1}</td>
                  <td className="p-3">{row.username}</td>
                  <td className="p-3 text-right">{row.current_streak}</td>
                  <td className="p-3 text-right">{row.max_streak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
