"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import HowToPlay from "./HowToPlay";

export default function Header({ username }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-transparent/40 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl md:text-3xl font-semibold tracking-tight">
            how<span className="text-green-400">2</span>guess
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <button onClick={() => setOpen(true)} className="hover:opacity-80">How to Play</button>
            <Link href="/archive" className="hover:opacity-80">Archive</Link>
            <Link href="/leaderboard" className="hover:opacity-80">Leaderboard</Link>
            <Link href="/about" className="hover:opacity-80">About</Link>
            {session ? <AuthButton /> : <SignInButton />}
          </nav>
        </div>
      </header>
      <HowToPlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function SignInButton() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = supabaseBrowser();

  async function sendLink(e) {
    e.preventDefault();
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
    });
    if (!error) setSent(true);
  }

  return sent ? (
    <span className="opacity-80">Check your email</span>
  ) : (
    <form onSubmit={sendLink} className="flex items-center gap-2">
      <input
        className="px-2 py-1 rounded bg-white/10 border border-white/20 placeholder-white/40 focus:outline-none"
        placeholder="email to save streaks"
        value={email} onChange={e=>setEmail(e.target.value)}
      />
      <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20">
        Sign in
      </button>
    </form>
  );
}

function AuthButton() {
  const supabase = supabaseBrowser();
  async function signOut() {
    await supabase.auth.signOut();
  }
  return (
    <button onClick={signOut} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20">
      Sign out
    </button>
  );
}
