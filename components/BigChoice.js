"use client";
import { useRef, useState, useEffect } from "react";
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
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  const isLongPrompt = prompt && prompt.length > 100;

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
    <div className="h-screen flex flex-col">
      {/* Header section - compact on mobile */}
      <div className="pt-3 pb-2 md:pt-6 md:pb-4">
        <div className="mx-auto max-w-7xl px-4 w-full">
          <div className="text-center">
            <div className="text-xs md:text-sm opacity-70">Current streak: <span className="font-semibold">{currentStreak ?? 0}</span></div>
            <div className="mt-1 md:mt-2">
              <h1 className="text-lg md:text-3xl lg:text-4xl font-semibold leading-tight px-2">
                {prompt || "Loading today's question…"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Button section - fills remaining space */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
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
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameId = useRef(null);
  const ripples = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ripples.current.forEach((ripple, index) => {
        ripple.radius += 2;
        ripple.opacity -= 0.015;
        if (ripple.opacity <= 0) {
          ripples.current.splice(index, 1);
        } else {
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2, false);
          ctx.fillStyle = `rgba(255, 255, 255, ${ripple.opacity})`;
          ctx.fill();
        }
      });
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const onMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    ripples.current.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      radius: 0,
      opacity: 0.3,
    });
  };

  const classes = classNames(
    "button-press",
    "h-full w-full",
    "flex items-center justify-center",
    "text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-wide select-none",
    "transition-all duration-200",
    "relative overflow-hidden",
    disabled ? "opacity-60 pointer-events-none" : "cursor-pointer"
  );

  const bg = color === "yes" ? "bg-yes" : "bg-no";

  return (
    <div
      ref={containerRef}
      onMouseMove={onMove}
      onClick={onClick}
      className={`${classes} ${bg}`}
      role="button"
      aria-label={label}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
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
