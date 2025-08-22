"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function Account() {
  const sb = supabaseBrowser();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState({ username: "", display_name: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await sb.auth.getUser();
      const u = data?.user;
      if (!u) { setLoading(false); return; }
      setUserId(u.id);
      const { data: p } = await sb.from("profiles").select("username, display_name").eq("id", u.id).maybeSingle();
      setValues({ username: p?.username || "", display_name: p?.display_name || "" });
      setLoading(false);
    })();
  }, []);

  async function save(e) {
    e.preventDefault();
    setMessage("");
    if (!userId) { setMessage("Sign in first."); return; }
    const { error } = await sb.from("profiles").update({
      username: values.username || null,
      display_name: values.display_name || null
    }).eq("id", userId);
    setMessage(error ? error.message : "Saved!");
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-3xl font-semibold mb-4">Account</h1>
        <form onSubmit={save} className="glass p-6 grid gap-3">
          {loading ? <div>Loading…</div> : (
            <>
              <label className="grid gap-1">
                <span className="opacity-80">Username (unique, shown on leaderboard)</span>
                <input
                  className="px-3 py-2 rounded bg-white/10 border border-white/20"
                  value={values.username}
                  onChange={e=>setValues(v=>({ ...v, username: e.target.value.trim() }))}
                  placeholder="e.g. brickhouse"
                />
              </label>
              <label className="grid gap-1">
                <span className="opacity-80">Display name (optional)</span>
                <input
                  className="px-3 py-2 rounded bg-white/10 border border-white/20"
                  value={values.display_name}
                  onChange={e=>setValues(v=>({ ...v, display_name: e.target.value }))}
                  placeholder="e.g. Brick House"
                />
              </label>
              <div className="text-right">
                <button className="px-4 py-2 rounded bg-white/10 border border-white/20 hover:bg-white/20">
                  Save
                </button>
              </div>
              {message && <div className="text-sm opacity-90">{message}</div>}
            </>
          )}
        </form>
      </main>
    </>
  );
}
