# UNBOUND
> **Break the loop. Build yourself.**  
> *A privacy-first personal recovery and behavioral operating system.*

---

## Project Overview

UNBOUND is an evidence-based behavioral operating system designed to help individuals understand their problematic habit loops, identify situational and emotional triggers, interrupt acute impulses in real time, channel dopamine into healthy replacement routines, and achieve long-term autonomy and focus.

### Core Pillars
- **Real-Time Interventions**: 5-minute guided Urge Mode featuring 4-2-6 rhythmic breath pacers, 60-second movement resets, sensory grounding, and urge surfing protocols.
- **Pattern Awareness**: 15-question non-diagnostic onboarding providing multi-axis pattern assessments and temporal risk heatmaps without clinical labeling or shame.
- **Dopamine Restitution**: Focus quests, milestone progression across 10 levels, Recovery XP rewards, and physical activity logging.
- **Whole-Person Wellbeing**: Evidence-grounded nutrition check-ins, hydration tracking, sleep hygiene, and circadian habit guides.
- **Zero-Knowledge Privacy**: Local-first architecture; personal triggers, reflections, and logs remain strictly confidential on the user's device.

---

## Tech Stack

- **Framework**: [Next.js 16 (App Router + Turbopack)](https://nextjs.org/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Motion & Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with persistent storage
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, SSR cookies)
- **Deployment**: [Vercel](https://vercel.com/)

---

## Local Development Instructions

### 1. Prerequisites
- **Node.js**: `v18.18+` or `v20+` / `v24+`
- **npm**: `v9+` or `v10+`

### 2. Clone the Repository
```bash
git clone https://github.com/mrneelaksh/unbound.git
cd unbound
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your keys (see [Environment Variables Setup](#environment-variables-setup)).

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables Setup

Create a `.env.local` file with the following variables:

```env
# ============================================================
# UNBOUND — Environment Variables Configuration
# ============================================================

# Supabase Public Configuration (Client & SSR)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Supabase Server Admin (Server-Only, never exposed to client)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Accountability Coach Engine (Server-Only)
AI_API_KEY=your-ai-api-key

# Official Brand Socials (Optional)
NEXT_PUBLIC_X_URL=

# Subscription & Payment Gateway (Server-Only)
PAYMENT_SECRET=your-payment-secret-key
PAYMENT_WEBHOOK_SECRET=your-payment-webhook-secret
```

> **Security Warning**: Never commit `.env`, `.env.local`, or any actual secret keys to version control. The repository's `.gitignore` automatically blocks all `.env*` files except `.env.example`.

---

## Supabase Database Setup

1. Create a new project on [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** in the Supabase Dashboard.
3. Execute the SQL schema script located at `supabase/schema.sql`.
   - Provisions user profiles, urge logs, activity tracking, quest completions, and streak records.
   - Enforces **Row Level Security (RLS)** ensuring users can only read and write their own data.
   - Sets up anonymous leaderboard views where only aliases and XP are visible.
4. In **Authentication > URL Configuration**:
   - Set **Site URL** to your production domain: `https://your-domain.vercel.app`
   - Add redirect URLs:
     - `http://localhost:3000/**` (for local development)
     - `https://your-domain.vercel.app/**` (for production)

---

## AI Coach Configuration

The AI Coach operates via server-side API endpoints (`/api/coach`) with strict guardrails:
- Does not diagnose medical or psychiatric conditions.
- Uses empathetic, non-judgmental, habit-rebuilding dialogue.
- Operates gracefully offline with built-in emergency response chips and grounding exercises if the AI API is unavailable.

---

## Subscription & Payment Configuration

UNBOUND uses an ethical INR-denominated membership architecture:
- **Free**: Core Urge Mode, basic streak tracking, starter quests, crisis resources.
- **Pro** (`₹1,000/mo`): Full AI Accountability Coach, Night Shield temporal barrier, 10-lesson curriculum, community challenges, 8-week trend analytics.
- **Max** (`₹5,000/mo`): Advanced long-term pattern modeling, predictive risk alerts, priority concierge support.

Client-side plan spoofing is disallowed. All entitlements are verified server-side through `lib/entitlements.ts`.

---

## Production Build & Start Commands

```bash
# Build the production application
npm run build

# Start the production server locally
npm start
```

---

## Production Deployment to Vercel

1. Push your repository to GitHub:
   ```bash
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Select **Import Git Repository** and choose `mrneelaksh/unbound`.
4. Vercel will automatically detect **Next.js**.
5. Under **Environment Variables**, add the variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `AI_API_KEY` (if using external AI)
   - `NEXT_PUBLIC_X_URL` (optional)
6. Click **Deploy**.

---

## Privacy & Security Standards

- **Zero Shame Protocol**: No streak-shaming, no humiliating countdowns, no derogatory notifications.
- **Local-First & Ephemeral**: Reflection notes, mood states, and urge triggers are kept private.
- **Discreet Notifications**: Push notifications display neutral text ("UNBOUND: your next step is ready") to safeguard lockscreen privacy.
- **Full GDPR Compliance**: One-click complete account deletion and unencrypted JSON data export available in Settings.

---

## Clinical & Ethical Disclaimer

UNBOUND provides educational habit-restructuring tools and self-directed behavioral frameworks. It is **not** a healthcare provider, and nothing in the app constitutes medical advice, clinical diagnosis, or psychotherapy. If you or someone you know is in crisis, please consult licensed medical professionals or contact your local helpline:
- **India**: Tele-MANAS (14416 / 1800-891-4416) or Vandrevala Foundation (+91 9999 666 555)
- **United States**: 988 Suicide & Crisis Lifeline (call/text 988)
- **United Kingdom**: Samaritans (116 123)
- **International**: Find resources at [befrienders.org](https://www.befrienders.org/)
