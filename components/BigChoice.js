"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import classNames from "classnames";

/**
 * Props:
 *  - prompt: string
 *  - onPick: async (true|false) => { result payload }
 *  - disabled: boolean
 *  - currentStreak: number
 */
export default function BigChoice({ prompt, onPick, disabled=false, currentStreak=0 }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [suspense, setSuspense] = useState(false);

  async function handle(choice) {
    if (disabled || loading) return;
    setLoading(true);
    setSuspense(true);
    // A touch of drama
    await new Promise(r => setTimeout(r, 900));
    const res = await onPick(choice);
    // Another heartbeat before reveal
    await new Promise(r => setTimeout(r, 700));
    setResult(res);
    setLoading(false);
    setSuspense(false);
  }

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="text-center mt-6 mb-4">
        <div className="text-sm opacity-70">Current streak: <span className="font-semibold">{currentStreak ?? 0}</span></div>
        <h1 className="text-3xl md:text-5xl font-semibold mt-2 leading-tight">
          {prompt || "Loading today’s question…"}
        </h1>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-h-[50vh]">
        <HoverButton
          label="Yes"
          color="yes"
          onClick={() => handle(true)}
          disabled={disabled || loading || !!result}
        />
        <HoverButton
          label="No"
          color="no"
          onClick={() => handle(false)}
          disabled={disabled || loading || !!result}
        />
      </div>

      {/* Suspense overlay */}
      <AnimatePresence>
        {(suspense || result) && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center backdrop-fade"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {suspense && (
              <motion.div
                initial={{ scale: .9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass p-8 max-w-lg w-[90%] text-center"
              >
                <div className="text-2xl font-semibold mb-2">Locking in your answer…</div>
                <div className="opacity-80">No take-backs. Breathe.</div>
              </motion.div>
            )}

            {result && (
              <ResultCard result={result} onClose={() => setResult(null)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HoverButton({ label, color, onClick, disabled }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = `${e.clientX - rect.left}px`;
    const my = `${e.clientY - rect.top}px`;
    el.style.setProperty("--mx", mx);
    el.style.setProperty("--my", my);
  };

  const classes = classNames(
    "button-glow button-press rounded-2xl md:rounded-3xl",
    "h-[38vh] md:h-[50vh] w-full",
    "flex items-center justify-center",
    "text-4xl md:text-6xl font-extrabold tracking-wide select-none",
    "transition-all duration-200",
    "shadow-btn border",
    disabled ? "opacity-60 pointer-events-none" : "cursor-pointer"
  );

  const bg = color === "yes"
    ? "bg-yes border-emerald-400 hover:brightness-110"
    : "bg-no  border-red-400 hover:brightness-110";


  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onClick={onClick}
      className={`${classes} ${bg}`}
      role="button"
      aria-label={label}
    >
      <span className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">{label}</span>
    </div>
  );
}

function ResultCard({ result, onClose }) {
  const correct = !!result?.correct;
  return (
    <motion.div
      initial={{ scale: .9, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="glass max-w-2xl w-[92%] p-6 md:p-8 relative"
    >
      <div className="text-sm opacity-70 mb-2">{correct ? "You chose wisely." : "Not this time."}</div>
      <h3 className="text-2xl md:text-3xl font-semibold">
        {correct ? result.success_message : result.failure_message}
      </h3>

      {result.evidence_image_url && (
        <div className="mt-4">
          <img src={result.evidence_image_url} alt={result.evidence_caption || "evidence"} className="rounded-lg w-full object-cover" />
          {result.evidence_caption && <div className="text-sm opacity-80 mt-2">{result.evidence_caption}</div>}
        </div>
      )}

      {result.explanation && (
        <p className="mt-4 opacity-90 leading-relaxed">{result.explanation}</p>
      )}

      {result.citation_url && (
        <a className="mt-3 inline-block underline hover:opacity-80" href={result.citation_url} target="_blank" rel="noreferrer">
          Source
        </a>
      )}

      <div className="mt-6 text-right">
        <button onClick={onClose} className="px-4 py-2 rounded bg-white/10 border border-white/20 hover:bg-white/20">
          Close
        </button>
      </div>
    </motion.div>
  );
}
