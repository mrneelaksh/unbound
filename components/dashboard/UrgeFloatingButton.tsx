'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export default function UrgeFloatingButton() {
  return (
    <Link href="/urge" className="md:hidden">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full
          bg-[#161616] border border-white/20 shadow-glow-medium backdrop-blur-xl"
        aria-label="I'm having an urge"
      >
        <Zap size={13} className="text-text fill-text" />
        <span className="font-mono text-[10px] text-text tracking-widest font-semibold">URGE</span>
      </motion.div>
    </Link>
  )
}
