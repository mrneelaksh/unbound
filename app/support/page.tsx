'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PhoneCall, ShieldAlert, HeartHandshake, UserCheck, Globe,
  ExternalLink, LifeBuoy, AlertTriangle, Mail, MessageSquare, ArrowUpRight
} from 'lucide-react'

interface ProfessionalResource {
  id: string
  name: string
  category: 'Psychologist' | 'Psychiatrist' | 'Sexual-Health' | 'Counsellor'
  focus: string
  availability: string
  link: string
}

const DIRECTORY: ProfessionalResource[] = [
  {
    id: '1',
    name: 'Society for the Advancement of Sexual Health (SASH)',
    category: 'Sexual-Health',
    focus: 'Certified clinicians specializing in CSBD and problematic impulse control.',
    availability: 'Global Provider Directory',
    link: 'https://www.sash.net',
  },
  {
    id: '2',
    name: 'Association for Behavioral and Cognitive Therapies (ABCT)',
    category: 'Psychologist',
    focus: 'Evidence-based cognitive-behavioral therapists targeting habit interruption.',
    availability: 'North America / Remote',
    link: 'https://www.abct.org',
  },
  {
    id: '3',
    name: 'International Society for Sexual Medicine (ISSM)',
    category: 'Sexual-Health',
    focus: 'Multidisciplinary clinical sexual health and psychological wellbeing.',
    availability: 'International Clinicians',
    link: 'https://www.issm.info',
  },
  {
    id: '4',
    name: 'NIMHANS Digital Psychology Clinic',
    category: 'Psychiatrist',
    focus: 'Specialized clinical assessment for technology, screen, and behavioral dependencies.',
    availability: 'India & South Asia',
    link: 'https://nimhans.ac.in',
  },
]

const CRISIS_LINES = [
  { country: 'United States & Canada', service: 'Suicide & Crisis Lifeline', number: '988', text: 'Call or text 988 (24/7, Free)' },
  { country: 'United Kingdom', service: 'NHS 111 & Samaritans', number: '111 / 116 123', text: 'Call 116 123 (Samaritans 24/7)' },
  { country: 'India', service: 'Tele-MANAS & Vandrevala Foundation', number: '14416 / +91 9999 666 555', text: '24/7 National Mental Health Helpline' },
  { country: 'Australia', service: 'Lifeline Australia', number: '13 11 14', text: '24/7 Crisis Support' },
  { country: 'International', service: 'Befrienders Worldwide', number: 'Online', text: 'Confidential emotional support worldwide' },
]

export default function SupportPage() {
  const [filter, setFilter] = useState<string>('All')

  const filtered = filter === 'All' ? DIRECTORY : DIRECTORY.filter((d) => d.category === filter)

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      {/* Official UNBOUND Product Support */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
        <div>
          <span className="font-mono text-[10px] text-subtle uppercase tracking-widest">PRODUCT HELP &amp; FEEDBACK</span>
          <h2 className="font-display text-lg font-bold text-text mt-0.5">CONTACT UNBOUND TEAM</h2>
          <p className="font-mono text-xs text-muted">
            Have product questions, technical feedback, or subscription inquiries? Reach our team directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <a
            href="mailto:genyoa.digital@gmail.com"
            className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Mail size={16} className="text-white" />
              <ArrowUpRight size={12} className="text-subtle group-hover:text-text transition-colors" />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-text">Email Support</div>
              <div className="font-mono text-[11px] text-muted truncate">genyoa.digital@gmail.com</div>
            </div>
          </a>

          <a
            href="https://www.instagram.com/genyoa.digital/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <MessageSquare size={16} className="text-white" />
              <ArrowUpRight size={12} className="text-subtle group-hover:text-text transition-colors" />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-text">Instagram</div>
              <div className="font-mono text-[11px] text-muted">@genyoa.digital</div>
            </div>
          </a>

          {process.env.NEXT_PUBLIC_X_URL && (
            <a
              href={process.env.NEXT_PUBLIC_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <Globe size={16} className="text-white" />
                <ArrowUpRight size={12} className="text-subtle group-hover:text-text transition-colors" />
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-text">Official X</div>
                <div className="font-mono text-[11px] text-muted">Follow updates</div>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Emergency Immediate Help Banner */}
      <div className="p-6 rounded-2xl bg-elevated border border-white/15 space-y-4">
        <div className="flex items-center gap-3 text-text">
          <ShieldAlert size={22} className="text-text" />
          <h2 className="font-display text-lg font-bold tracking-tight">CRISIS & IMMEDIATE SUPPORT</h2>
        </div>
        <p className="font-sans text-xs text-muted leading-relaxed">
          If you are in acute distress, experiencing overwhelming anxiety, or having thoughts of self-harm, please reach out to immediate local crisis professionals. Free, confidential support is available 24/7.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {CRISIS_LINES.map((line, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
              <div className="font-mono text-xs font-bold text-text">{line.country}</div>
              <div className="font-mono text-[11px] text-muted">{line.service}: <span className="text-white font-bold">{line.number}</span></div>
              <div className="font-mono text-[10px] text-subtle">{line.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake size={22} className="text-text" />
            <h1 className="font-display text-2xl font-bold text-text">QUALIFIED PROFESSIONAL CARE</h1>
          </div>
          <p className="font-mono text-xs text-muted mt-1">
            Access vetted clinicians, sex therapists, and behavioral health psychologists.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'Psychologist', 'Psychiatrist', 'Sexual-Health'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`font-mono text-xs px-3 py-1.5 rounded-lg transition-all ${
                filter === cat
                  ? 'bg-white text-black font-bold border border-white'
                  : 'text-subtle hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-card border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-text border border-white/10 uppercase">
                  {item.category}
                </span>
                <span className="font-mono text-[10px] text-subtle">{item.availability}</span>
              </div>
              <h3 className="font-display text-base font-bold text-text">{item.name}</h3>
              <p className="font-sans text-xs text-muted leading-relaxed">{item.focus}</p>
            </div>

            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between pt-3 border-t border-white/5 font-mono text-xs text-text hover:underline group"
            >
              <span>Explore Clinician Registry</span>
              <ExternalLink size={13} className="text-subtle group-hover:text-text transition-colors" />
            </a>
          </div>
        ))}
      </div>

      {/* Clinical Disclaimer */}
      <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-center">
        <p className="font-mono text-[10px] text-subtle leading-relaxed">
          EDUCATIONAL DISCLAIMER: UNBOUND provides self-development frameworks, habit tracking, and cognitive reflection tools. It is not an accredited medical institution and does not provide diagnostic evaluations, psychotherapy, or medical treatments.
        </p>
      </div>
    </div>
  )
}
