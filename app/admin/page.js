"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function Admin() {
  const sb = supabaseBrowser();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    publish_date: "",
    prompt: "",
    correct_answer: "yes",
    success_message: "",
    failure_message: "",
    explanation: "",
    evidence_image_url: "",
    evidence_caption: "",
    citation_url: "",
    status: "live"
  });
  const [list, setList] = useState([]);

  useEffect(() => {
    sb.auth.getUser().then(async ({ data }) => {
      const user = data?.user;
      if (!user) return;
      const { data: p } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(p);
    });
    load();
  }, []);

  async function load() {
    const { data } = await sb.from("public_questions").select("*").order("publish_date", { ascending: true }).limit(30);
    setList(data || []);
  }

  async function onUploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const filename = `${Date.now()}_${file.name.replace(/\s+/g,'_')}`;
    const { data, error } = await sb.storage.from("evidence").upload(filename, file, { upsert: false });
    if (!error) {
      const { data: pub } = sb.storage.from("evidence").getPublicUrl(data.path);
      setForm(f => ({ ...f, evidence_image_url: pub.publicUrl }));
    }
  }

  async function submit(e) {
    e.preventDefault();
    // server will use service role in API routes normally,
    // but here we rely on RLS: admins should be set manually in DB (profiles.is_admin=true)
    if (!profile?.is_admin) { alert("Not admin"); return; }

    // call a server API that uses service key (safer):
    const res = await fetch("/api/admin/add-question", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        ...form,
        correct_answer: form.correct_answer === "yes"
      })
    });
    const data = await res.json();
    if (data?.ok) {
      alert("Added!");
      setForm({
        publish_date: "",
        prompt: "",
        correct_answer: "yes",
        success_message: "",
        failure_message: "",
        explanation: "",
        evidence_image_url: "",
        evidence_caption: "",
        citation_url: "",
        status: "live"
      });
      load();
    } else {
      alert(data?.error || "Error");
    }
  }

  if (!profile) {
    return <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="glass p-6">Sign in as admin to manage questions.</div>
      </main>
    </>;
  }

  if (!profile.is_admin) {
    return <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="glass p-6">You are signed in but not an admin.</div>
      </main>
    </>;
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-semibold mb-4">Admin</h1>

        <form onSubmit={submit} className="glass p-6 grid gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="opacity-80">Publish date (YYYY-MM-DD)</span>
              <input value={form.publish_date} onChange={e=>setForm({...form, publish_date:e.target.value})}
                className="px-3 py-2 rounded bg-white/10 border border-white/20" placeholder="2025-08-15" required />
            </label>
            <label className="grid gap-1">
              <span className="opacity-80">Correct answer</span>
              <select value={form.correct_answer} onChange={e=>setForm({...form, correct_answer:e.target.value})}
                className="px-3 py-2 rounded bg-white/10 border border-white/20">
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          </div>

          <label className="grid gap-1">
            <span className="opacity-80">Prompt</span>
            <textarea value={form.prompt} onChange={e=>setForm({...form, prompt:e.target.value})}
              className="px-3 py-2 rounded bg-white/10 border border-white/20" rows={3} required />
          </label>

          <div className="grid md:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="opacity-80">Success message</span>
              <input value={form.success_message} onChange={e=>setForm({...form, success_message:e.target.value})}
                className="px-3 py-2 rounded bg-white/10 border border-white/20" required />
            </label>
            <label className="grid gap-1">
              <span className="opacity-80">Failure message</span>
              <input value={form.failure_message} onChange={e=>setForm({...form, failure_message:e.target.value})}
                className="px-3 py-2 rounded bg-white/10 border border-white/20" required />
            </label>
          </div>

          <label className="grid gap-1">
            <span className="opacity-80">Explanation</span>
            <textarea value={form.explanation} onChange={e=>setForm({...form, explanation:e.target.value})}
              className="px-3 py-2 rounded bg-white/10 border border-white/20" rows={4} />
          </label>

          <div className="grid md:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="opacity-80">Evidence image</span>
              <input type="file" accept="image/*" onChange={onUploadFile} className="block" />
              {form.evidence_image_url && <img src={form.evidence_image_url} alt="evidence" className="rounded mt-2 max-h-40" />}
            </label>
            <div className="grid gap-3">
              <label className="grid gap-1">
                <span className="opacity-80">Evidence caption</span>
                <input value={form.evidence_caption} onChange={e=>setForm({...form, evidence_caption:e.target.value})}
                  className="px-3 py-2 rounded bg-white/10 border border-white/20" />
              </label>
              <label className="grid gap-1">
                <span className="opacity-80">Citation URL</span>
                <input value={form.citation_url} onChange={e=>setForm({...form, citation_url:e.target.value})}
                  className="px-3 py-2 rounded bg-white/10 border border-white/20" />
              </label>
              <label className="grid gap-1">
                <span className="opacity-80">Status</span>
                <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})}
                  className="px-3 py-2 rounded bg-white/10 border border-white/20">
                  <option>live</option>
                  <option>scheduled</option>
                  <option>archived</option>
                </select>
              </label>
            </div>
          </div>

          <div className="text-right">
            <button className="px-4 py-2 rounded bg-white/10 border border-white/20 hover:bg-white/20">Add Question</button>
          </div>
        </form>

        <h2 className="text-xl font-semibold mt-8 mb-3">Upcoming / Recent</h2>
        <div className="grid gap-3">
          {list.map(q => (
            <div key={q.id} className="glass p-3">
              <div className="text-sm opacity-70">{q.publish_date} • {q.status}</div>
              <div className="font-semibold">{q.prompt}</div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
