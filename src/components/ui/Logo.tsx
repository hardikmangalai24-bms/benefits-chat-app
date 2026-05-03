"use client";

import { motion } from "framer-motion";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20 relative overflow-hidden group ${className}`}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 translate-x-[-150%] skew-x-[-45deg] group-hover:translate-x-[150%] transition-transform duration-700 ease-out" />
      
      {/* Inner Glow */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />

      {/* SVG Icon - Lens/Iris motif */}
      <svg
        className="w-6 h-6 text-white relative z-10 drop-shadow-md"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <motion.path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          animate={{ x: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
