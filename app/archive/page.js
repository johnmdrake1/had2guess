import Header from "@/components/Header";
import { supabaseService } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function Archive() {
  const svc = supabaseService();
  const { data } = await svc
    .from("public_questions")
    .select("*")
    .order("publish_date", { ascending: false })
    .limit(60);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">Archive</h1>
        <div className="grid gap-4">
          {(data || []).map(q => (
            <article key={q.id} className="glass p-4">
              <div className="text-sm opacity-70">{q.publish_date}</div>
              <div className="font-semibold text-lg mt-1">{q.prompt}</div>
              {q.evidence_image_url && (
                <img src={q.evidence_image_url} alt={q.evidence_caption||"evidence"} className="rounded mt-3 max-h-64 object-cover w-full" />
              )}
              {q.explanation && <p className="mt-2 opacity-90">{q.explanation}</p>}
              {q.citation_url && <a className="underline mt-2 inline-block" href={q.citation_url} target="_blank">Source</a>}
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
