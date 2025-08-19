"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function HowToPlay({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass max-w-lg w-[92%] p-6 relative"
          >
            <h2 className="text-xl font-semibold mb-3">How to Play</h2>
            <p className="opacity-90 leading-relaxed">
              Each day, you’ll see one question that’s <em>not</em> common knowledge.
              Pick <strong>Yes</strong> or <strong>No</strong>. After locking in,
              we reveal the answer with evidence. You get one shot per day.
            </p>
            <ul className="mt-4 space-y-2 list-disc list-inside opacity-90">
              <li>Streaks: keep answering correctly to grow your streak.</li>
              <li>Playtime: the game resets at midnight America/Chicago.</li>
              <li>Sign in with email to save streaks across devices.</li>
            </ul>
            <div className="mt-5 text-right">
              <button onClick={onClose} className="px-4 py-2 rounded bg-white/10 border border-white/20 hover:bg-white/20">
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
