"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import HowToPlay from "./HowToPlay";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [openHow, setOpenHow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const NavLinks = ({ onClick }) => (
    <>
      <button onClick={() => { setOpenHow(true); onClick?.(); }} className="hover:opacity-80">How to Play</button>
      <Link href="/archive" onClick={onClick} className="hover:opacity-80">Archive</Link>
      <Link href="/leaderboard" onClick={onClick} className="hover:opacity-80">Leaderboard</Link>
      <Link href="/about" onClick={onClick} className="hover:opacity-80">About</Link>
      <Link href="/account" onClick={onClick} className="hover:opacity-80">Account</Link>
      {session ? <AuthButton onClick={onClick} /> : <SignInButton onDone={onClick} /> }
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-30 bg-transparent/40 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl md:text-3xl font-semibold tracking-tight whitespace-nowrap">
            had<span className="text-green-400">2</span>guess
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <NavLinks />
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded border border-white/20 px-3 py-2 bg-white/10 hover:bg-white/20"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            Player Menu
          </button>
        </div>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="md:hidden border-t border-white/10 bg-black/50 backdrop-blur-md"
            >
              <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col gap-3 text-sm">
                <NavLinks onClick={() => setMenuOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <HowToPlay open={openHow} onClose={() => setOpenHow(false)} />
    </>
  );
}

function SignInButton({ onDone }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = supabaseBrowser();

  async function sendLink(e) {
    e.preventDefault();
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined }
    });
    if (!error) setSent(true);
    onDone?.();
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

function AuthButton({ onClick }) {
  const supabase = supabaseBrowser();
  async function signOut() {
    await supabase.auth.signOut();
    onClick?.();
  }
  return (
    <button onClick={signOut} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20">
      Sign out
    </button>
  );
}
