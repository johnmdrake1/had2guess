"use client";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div>
      <div className="text-center mt-6 mb-4">
        <div className="text-sm opacity-70">Current streak: <span className="font-semibold">{currentStreak ?? 0}</span></div>
        <h1 className="text-3xl md:text-4xl font-semibold mt-2 leading-tight">
          {prompt || "Loading today's question…"}
        </h1>
      </div>

      <div className="mt-8 grid grid-cols-2" style={{ height: 'calc(100vh - 240px)' }}>
        <CanvasButton
          label="Yes"
          color="yes"
          onClick={() => handle(true)}
          disabled={disabled || loading || !!result}
        />
        <CanvasButton
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

function CanvasButton({ label, color, onClick, disabled }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const ripplesRef = useRef([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Initialize canvas and set up drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawCanvas();
    };

    const drawCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      const bgColor = color === "yes" ? "#19c37d" : "#ef4444";
      const hoverColor = color === "yes" ? "#22d484" : "#f87171";
      const currentColor = isHovered ? hoverColor : bgColor;
      
      ctx.fillStyle = currentColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw subtle glow effect when hovered
      if (isHovered) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw ripples
      ripplesRef.current.forEach((ripple, index) => {
        const progress = (Date.now() - ripple.startTime) / ripple.duration;
        if (progress >= 1) {
          ripplesRef.current.splice(index, 1);
          return;
        }
        
        const alpha = 1 - progress;
        const scale = progress * 2;
        const radius = ripple.radius * scale;
        
        ctx.save();
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const animate = () => {
      drawCanvas();
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color, isHovered, ripplesRef.current]);

  const handleMouseMove = (e) => {
    if (disabled) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add new ripple
    ripplesRef.current.push({
      x,
      y,
      radius: 50,
      startTime: Date.now(),
      duration: 1000
    });
    
    // Limit number of ripples
    if (ripplesRef.current.length > 10) {
      ripplesRef.current.shift();
    }
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseDown = () => {
    if (disabled) return;
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (disabled) return;
    onClick();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${disabled ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      role="button"
      aria-label={label}
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${isPressed ? 'scale-[0.995]' : 'scale-100'} transition-transform duration-150`}
        style={{ transform: isPressed ? 'translateY(1px)' : 'translateY(0)' }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-4xl md:text-6xl font-extrabold tracking-wide select-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] text-white">
          {label}
        </span>
      </div>
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
