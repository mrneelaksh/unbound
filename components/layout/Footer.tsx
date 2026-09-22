'use client'

import Link from 'next/link'
import { Mail, ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export default function Footer() {
  const xUrl = process.env.NEXT_PUBLIC_X_URL

  return (
    <footer className="py-14 border-t border-white/5 px-6 font-mono text-xs text-subtle bg-bg">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div className="space-y-2">
            <Logo size="sm" showWordmark={true} asLink href="/" />
            <p className="text-muted text-xs font-sans">
              Break the loop. Build yourself.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
            <Link href="/dashboard" className="text-muted hover:text-text transition-colors">
              Dashboard
            </Link>
            <Link href="/activity" className="text-muted hover:text-text transition-colors">
              Activity
            </Link>
            <Link href="/pricing" className="text-muted hover:text-text transition-colors">
              Membership
            </Link>
            <Link href="/support" className="text-muted hover:text-text transition-colors">
              Support & Crisis
            </Link>
            <Link href="/settings" className="text-muted hover:text-text transition-colors">
              Privacy & Data
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-4">
            <a
              href="mailto:genyoa.digital@gmail.com"
              className="flex items-center gap-1.5 text-muted hover:text-text transition-colors"
            >
              <Mail size={13} />
              <span>genyoa.digital@gmail.com</span>
            </a>

            <a
              href="https://www.instagram.com/genyoa.digital/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted hover:text-text transition-colors"
            >
              <span>Instagram @genyoa.digital</span>
              <ArrowUpRight size={11} />
            </a>

            {xUrl && (
              <a
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-muted hover:text-text transition-colors"
              >
                <span>X</span>
                <ArrowUpRight size={11} />
              </a>
            )}
          </div>

          <div className="text-subtle font-mono text-[10px]">
            © {new Date().getFullYear()} UNBOUND. Local-first personal recovery operating system.
          </div>
        </div>
      </div>
    </footer>
  )
}
