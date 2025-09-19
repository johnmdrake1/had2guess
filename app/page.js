"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BigChoice from "@/components/BigChoice";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function Home() {
  const [question, setQuestion] = useState(null);
  const [streak, setStreak] = useState(0);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

  async function load() {
    const res = await fetch("/api/today", { cache: "no-store" });
    const data = await res.json();
    setQuestion(data?.question || null);
    setAlreadyPlayed(!!data?.alreadyPlayed);
    setStreak(data?.currentStreak || 0);
  }

  useEffect(() => { load(); }, []);

  async function handlePick(guessBool) {
    const r = await fetch("/api/guess", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ guess: guessBool })
    });
    const data = await r.json();
    if (data?.ok) {
      // update streak shown
      setStreak(data.nextStreak ?? streak);
      setAlreadyPlayed(true);
      return {
        correct: data.correct,
        success_message: data.payload?.success_message,
        failure_message: data.payload?.failure_message,
        explanation: data.payload?.explanation,
        evidence_image_url: data.payload?.evidence_image_url,
        evidence_caption: data.payload?.evidence_caption,
        citation_url: data.payload?.citation_url
      };
    } else {
      return { correct: false, failure_message: data?.error || "Something went wrong." };
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="grow">
        <BigChoice
          prompt={question?.prompt}
          onPick={handlePick}
          disabled={!question || alreadyPlayed}
          currentStreak={streak}
        />
        {alreadyPlayed && (
          <p className="text-center mt-4 opacity-80">You’ve already played today. Come back tomorrow!</p>
        )}
      </main>
    </div>
  );
}
