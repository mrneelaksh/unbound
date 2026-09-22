# UNBOUND — Build Task List

## PHASE 1 — Scaffold + Design System
- [x] Scaffold Next.js 15 project with TypeScript + Tailwind
- [x] Install all dependencies (Framer Motion, Recharts, Zustand, idb, Supabase, lucide-react)
- [x] Configure Tailwind CSS v4 with full UNBOUND design tokens
- [x] Set up global CSS (tokens, fonts, resets, scrollbar)
- [x] Configure next/font (Syne, Inter, Space Grotesk, DM Mono)
- [x] Build UI primitives: Button, GlassCard, ProgressRing, Badge, AnimatedCounter
- [x] Build layout components: Sidebar, BottomNav, PageWrapper
- [x] Build MetricCard, QuestCard, HabitCard, ChartCard
- [x] Set up Zustand store (auth, onboarding, urge, dashboard)
- [x] Set up .env.local template

## PHASE 2 — Auth + Supabase
- [x] Set up Supabase client (server + client)
- [x] Write full database schema SQL (20+ tables)
- [x] Write RLS policies for all private tables
- [x] Build sign-up page
- [x] Build sign-in page
- [x] Build auth middleware (protected routes)

## PHASE 3 — Onboarding (Q1–Q15)
- [x] Build OnboardingShell (step controller + directional transitions)
- [x] Build StepWrapper + progress bar
- [x] Build Q1: Age range picker
- [x] Build Q2: First exposure
- [x] Build Q3: Frequency selector
- [x] Build Q4: Control slider
- [x] Build Q5: Attempts selector
- [x] Build Q6: Post-use feelings (multi-select)
- [x] Build Q7: Trigger selector (emoji multi-select)
- [x] Build Q8: High-risk time
- [x] Build Q9: Life impact (multi-select)
- [x] Build Q10: Urge resistance slider (1–10)
- [x] Build Q11: Motivation (multi-select)
- [x] Build Q12: Replacement habits (multi-select)
- [x] Build Q13: Previous strategies
- [x] Build Q14: Support preference
- [x] Build Q15: Personal goal (free text)

## PHASE 4 — Pattern Report
- [x] Build scoring algorithm (6 dimensions)
- [x] Build PatternReport screen with animated bars
- [x] Build "What we noticed" contextual copy
- [x] Build distress detection + professional support nudge

## PHASE 5 — Dashboard
- [x] Build sidebar layout (desktop) + bottom nav (mobile)
- [x] Build Overview card (streak, level, XP)
- [x] Build WeeklyUrgeChart (AreaChart)
- [x] Build MonthProgressRing (RadialBarChart)
- [x] Build TriggerDonutChart (PieChart)
- [x] Build TodaysGoals checklist
- [x] Build UrgeJourneyChart (8-week AreaChart)
- [x] Build ControlGauge (custom SVG arc)
- [x] Build HabitHeatmap (contribution grid)
- [x] Build RecoveryRadar (RadarChart)
- [x] Build daily stats bars (Focus, Sleep, Habits, Consistency)
- [x] Build persistent Urge button (floating)

## PHASE 6 — Urge Mode
- [x] Build UrgeModeShell (full-screen cinematic overlay)
- [x] Build Step 1: intensity arc slider
- [x] Build Step 2: trigger chips
- [x] Build Step 3: BreathingPacer (4-2-6 morphing circle)
- [x] Build Step 3: ExerciseTimer
- [x] Build Step 3: UrgeSurfing (animated wave)
- [x] Build Step 4: outcome check
- [x] Build Step 5: replacement habit picker + XP animation

## PHASE 7 — Habit + Quest Engine
- [x] Build habit CRUD
- [x] Build quest system
- [x] Build completion tracking
- [x] Build replacement habit recommendations

## PHASE 8 — XP + Levels + Badges
- [x] Build XP transaction system
- [x] Build level calculation (10 levels)
- [x] Build level-up animation
- [x] Build badge unlock logic
- [x] Build achievement gallery

## PHASE 9 — Progress Analytics
- [x] Build 8-week / 12-week / lifetime trend views
- [x] Build personal bests
- [x] Build weekly report generation

## PHASE 10 — Global Competition
- [x] Build anonymous leaderboard
- [x] Build opt-in/opt-out privacy controls

## PHASE 11 — AI Coach
- [x] Build server-side AI integration (env var abstracted)
- [x] Build chat UI
- [x] Build context injection (user patterns)
- [x] Build fallback when AI unavailable

## PHASE 12 — Night Shield
- [x] Build time window settings
- [x] Build night mode UI transformation
- [x] Build in-app focus protection

## PHASE 14 — Professional Support
- [x] Build support directory
- [x] Build crisis resources (country-aware)

## PHASE 15 — Pricing
- [x] Build pricing page with 3 tiers
- [x] Build subscription architecture
- [x] Build entitlement system (canUseAI(), etc.)
- [x] Build monthly/yearly toggle

## PHASE 16 — Landing Page
- [x] Build Hero section
- [x] Build Problem section
- [x] Build How It Works section
- [x] Build Feature sections (Urge Mode, AI Coach, Habits, XP)
- [x] Build Pricing section
- [x] Build FAQ
- [x] Build Final CTA + Footer

## PHASE 17 — Security & Verification
- [x] Audit RLS policies in schema.sql
- [x] Secure all API routes
- [x] No API keys in frontend
- [x] TypeScript strict typecheck (0 errors)
- [x] Production build validation (`next build` 18/18 routes passed)
