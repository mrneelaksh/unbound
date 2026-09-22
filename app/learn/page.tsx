'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, CheckCircle2, Lock, X, ChevronRight, Clock,
  Lightbulb, ExternalLink, Sparkles, ArrowLeft, ArrowRight
} from 'lucide-react'
import { useUserStore } from '@/lib/store'
import { hasFeature } from '@/lib/entitlements'
import Link from 'next/link'

// ============================================================
// Lesson Data
// ============================================================
interface Lesson {
  id: string
  number: number
  title: string
  subtitle: string
  duration: string
  category: string
  freeAccess: boolean
  body: string[]
  keyTakeaway: string
  reflectionQuestion: string
  source: string
  xpReward: number
}

const LESSONS: Lesson[] = [
  {
    id: 'l01',
    number: 1,
    title: 'Understanding Triggers',
    subtitle: 'Why certain moments lead to certain behaviors',
    duration: '3 min',
    category: 'Foundations',
    freeAccess: true,
    body: [
      'A trigger is any internal or external cue that activates a habitual response. Triggers can be emotional states (boredom, loneliness, stress), environmental contexts (being alone at night), or even physical sensations.',
      'Neuroscience research suggests that our brains form strong associations between contexts and behaviors over repeated exposure. Once an association is formed, simply encountering the trigger can initiate a craving — before conscious thought intervenes.',
      'The first step in changing a habit is identifying your personal triggers with specificity. "Boredom" is broad. "Boredom at 10 PM when I have finished studying but haven\'t yet started my wind-down routine" is actionable.',
      'Keeping a trigger log — noting the time, place, emotional state, and preceding activity — for even 7 days can reveal patterns you were previously unaware of. This awareness alone reduces the automatic quality of the habit loop.',
    ],
    keyTakeaway: 'Triggers are predictable. Once mapped, they become manageable.',
    reflectionQuestion: 'What is one situation in the past week where you noticed a habitual urge — and what was happening just before it?',
    source: 'Habit research: Wood & Neal (2007), American Psychologist; Duhigg (2012), The Power of Habit.',
    xpReward: 20,
  },
  {
    id: 'l02',
    number: 2,
    title: 'Why Habits Become Automatic',
    subtitle: 'The neuroscience of the habit loop',
    duration: '4 min',
    category: 'Neuroscience',
    freeAccess: true,
    body: [
      'Habits are stored in a region of the brain called the basal ganglia — a structure involved in pattern recognition, procedural learning, and reward processing. This is separate from the prefrontal cortex, where conscious decision-making occurs.',
      'When a behavior is repeated in a consistent context, the brain begins to "chunk" it — compressing the sequence into a single automated routine that requires less cognitive effort. This is efficient for most tasks but can make unwanted behaviors feel involuntary.',
      'The classic habit loop consists of three elements: Cue → Routine → Reward. The reward is key — it encodes the behavior as worth repeating. Over time, the cue alone triggers dopamine anticipation before the reward even arrives.',
      'This is why willpower alone is often insufficient. Willpower operates in the prefrontal cortex, which becomes fatigued, while the basal ganglia habit loop operates automatically. The most effective strategy is to redesign the environment and the routine — not just try harder.',
      'The good news: the same neuroplastic processes that created the habit can be used to reshape it. New routines, practiced consistently in the same contexts, eventually overwrite the old loop.',
    ],
    keyTakeaway: 'Habits are not character flaws. They are efficient neural patterns. They can be updated.',
    reflectionQuestion: 'In the habit loop of your behavior, what is the "reward" you are actually seeking? (Stress relief? Stimulation? Escape?)',
    source: 'Graybiel (2008), Habits, rituals, and the evaluative brain, Annual Review of Neuroscience.',
    xpReward: 20,
  },
  {
    id: 'l03',
    number: 3,
    title: 'Urges vs Actions',
    subtitle: 'The 90-second window that changes everything',
    duration: '3 min',
    category: 'Foundations',
    freeAccess: true,
    body: [
      'An urge is not an action. An urge is a neurochemical signal — a wave of dopamine anticipation that arises, peaks, and subsides. Research suggests that the physiological component of an emotion lasts approximately 90 seconds if you do not feed it with further thought.',
      'The moment an urge arises, you have a choice: engage with it (which extends and amplifies it) or observe it and allow it to pass. Mindfulness traditions call this "urge surfing" — treating the urge like a wave, watching it rise and fall without acting on it.',
      'Each time you successfully allow an urge to pass without acting, you are weakening the automatic quality of that habit loop. Neuroscientifically, you are failing to reinforce the cue-routine-reward sequence, which gradually reduces its activation strength.',
      'The key distinction: having an urge is not a failure, and it is not a sign that you will inevitably act. Many people who have changed long-standing habits report that the urges do not fully disappear — they simply become shorter, less intense, and easier to observe without acting.',
    ],
    keyTakeaway: 'An urge is information, not an instruction. You can notice it without obeying it.',
    reflectionQuestion: 'The next time you feel an urge, can you set a 90-second timer and simply observe the sensation without acting? What happens?',
    source: 'Jill Bolte Taylor (2006), My Stroke of Insight; Bowen & Marlatt (2009), Urge Surfing.',
    xpReward: 20,
  },
  {
    id: 'l04',
    number: 4,
    title: 'Digital Habits & Dopamine',
    subtitle: 'How modern technology interacts with reward circuits',
    duration: '5 min',
    category: 'Digital Wellbeing',
    freeAccess: false,
    body: [
      'The dopamine system evolved to signal the anticipation of reward — not the reward itself. This is why the most compelling digital experiences are designed around variable reward schedules: you never know exactly when something interesting will appear, which keeps the reward circuit highly active.',
      'Social media feeds, recommendation engines, and certain content platforms use algorithmic systems that continuously optimize for engagement. This optimization often exploits the same neural circuitry involved in compulsive behaviors.',
      'Research by Tristen Harris and colleagues documents how many technology products are deliberately designed to maximize time-on-platform by exploiting psychological vulnerabilities — including social reciprocity, fear of missing out, and intermittent reinforcement.',
      'This does not mean technology is inherently harmful. It means that using technology intentionally — with defined purposes, time limits, and awareness of when it has stopped serving you — is a practical skill in the modern environment.',
      'Digital habits that displace sleep, physical activity, face-to-face relationships, or productive work tend to erode wellbeing over time. The relationship between digital consumption and wellbeing is primarily mediated by what it displaces, not the consumption itself.',
      'Practical leverage: audit your screen time by category. What does your phone time displace? This single question generates more behavior change than most other interventions.',
    ],
    keyTakeaway: 'Awareness of the design intent behind addictive technology is the first step in using it on your own terms.',
    reflectionQuestion: 'What activity does your highest-consumption app regularly displace in your daily life?',
    source: 'Harris (2017), How Technology is Hijacking Your Mind; Twenge et al. (2018), Journal of Abnormal Psychology.',
    xpReward: 20,
  },
  {
    id: 'l05',
    number: 5,
    title: 'Sleep & Circadian Routines',
    subtitle: 'Why sleep is the most underrated performance tool',
    duration: '4 min',
    category: 'Recovery',
    freeAccess: false,
    body: [
      'Sleep is the primary mechanism by which the brain consolidates learning, clears metabolic waste (via the glymphatic system), and regulates emotional reactivity. Chronic sleep restriction — even mild — impairs prefrontal cortex function, which is precisely the region needed for impulse control and habit change.',
      'The circadian rhythm is driven by light exposure, meal timing, and activity timing. The single most powerful anchor for a healthy circadian rhythm is a consistent wake time — even on weekends. This is more effective than bedtime, because the sleep drive builds from wake time.',
      'Blue light from screens suppresses melatonin production, delaying sleep onset. This effect is particularly pronounced in adolescents, whose melatonin secretion begins later in the evening. A 30-60 minute screen-free wind-down period meaningfully improves sleep onset time.',
      'Caffeine has a half-life of approximately 5-7 hours in most adults. A coffee consumed at 3 PM still has 50% of its stimulant effect at 8-10 PM. This is a common, correctable contributor to poor sleep onset.',
      'REM sleep, which predominates in the later hours of the night, is particularly important for emotional processing and impulse regulation. Cutting sleep short — even by 60-90 minutes — disproportionately reduces REM.',
    ],
    keyTakeaway: 'Sleep is not passive recovery. It is when your brain performs its most important maintenance work.',
    reflectionQuestion: 'What is your current wake time consistency like? Does it vary by more than 90 minutes across a typical week?',
    source: 'Walker (2017), Why We Sleep; Irwin (2019), Sleep and Inflammation, Nature Reviews Immunology.',
    xpReward: 20,
  },
  {
    id: 'l06',
    number: 6,
    title: 'Stress & Habit Loops',
    subtitle: 'Why stress makes automatic behaviors stronger',
    duration: '3 min',
    category: 'Neuroscience',
    freeAccess: false,
    body: [
      'Stress does not simply make people more likely to engage in habitual behaviors — it specifically shifts control from the prefrontal cortex (goal-directed behavior) to the striatum and amygdala (habit and threat response). Under high stress, behavior becomes more automatic, less deliberate.',
      'This means that during periods of high stress, existing habit loops — including unwanted ones — are more likely to activate. This is not a character failure. It is a predictable consequence of how stress hormones affect neural circuitry.',
      'Physiologically, stress is driven by the HPA axis releasing cortisol and the sympathetic nervous system releasing adrenaline. These systems evolved for short-term physical threats. Chronic psychological stress — work deadlines, social anxiety, financial pressure — keeps these systems activated without a natural resolution.',
      'Effective stress modulation strategies that have research support include: slow exhalation breathing (activates parasympathetic response), physical activity (metabolizes stress hormones), cold water face immersion (triggers dive reflex), and social connection.',
      'The key insight for habit change: high-stress periods are not the time to attempt major behavior change. Instead, focus on maintaining existing positive routines and reducing harm. Reserve ambitious new habit formation for periods of lower baseline stress.',
    ],
    keyTakeaway: 'Stress shifts your brain from deliberate to automatic. Building resilience means having strong routines for high-stress moments.',
    reflectionQuestion: 'What is your current go-to stress response? Is it serving you?',
    source: 'Schwabe & Wolf (2009), Stress prompts habit behavior in humans, Journal of Neuroscience.',
    xpReward: 20,
  },
  {
    id: 'l07',
    number: 7,
    title: 'Building Replacement Habits',
    subtitle: 'The substitution principle in behavior change',
    duration: '4 min',
    category: 'Strategy',
    freeAccess: false,
    body: [
      'Habits are difficult to simply remove — the cue-routine-reward loop remains encoded. The most effective approach is substitution: keeping the cue and the reward, but inserting a new routine in between.',
      'To identify a good replacement habit, you first need to identify what reward the current habit is actually providing. Common rewards include: stress relief, stimulation, social connection, escape from discomfort, or a sense of control.',
      'A replacement habit that provides the same reward in a healthier way will be dramatically more successful than one that simply suppresses the behavior without addressing the underlying need.',
      'Examples by reward type: If the reward is stress relief → try physical exercise, slow breathing, or a short walk. If the reward is stimulation → try a challenging game, creative work, or exploration. If the reward is escape → try a compelling book, music, or a change of environment.',
      'Replacement habits work best when they are: immediately accessible (low friction), genuinely rewarding (not just "good for you"), and practiced in the same context as the original habit. Implementation intention research shows that writing "when X happens, I will do Y" doubles follow-through rates.',
      'Start small. A replacement habit does not need to be impressive — it needs to be reliably executable when the cue activates. Consistency builds automaticity.',
    ],
    keyTakeaway: 'Don\'t try to remove a habit. Replace the routine while keeping the cue and reward structure.',
    reflectionQuestion: 'What reward does your habit actually provide? What other activity could provide that same reward?',
    source: 'Duhigg (2012), The Power of Habit; Gollwitzer (1999), Implementation intentions, American Psychologist.',
    xpReward: 20,
  },
  {
    id: 'l08',
    number: 8,
    title: 'Setback Recovery',
    subtitle: 'The most underrated skill in long-term change',
    duration: '3 min',
    category: 'Resilience',
    freeAccess: false,
    body: [
      'Setbacks are statistically inevitable in any sustained behavior change effort. The research on relapse and recovery consistently shows that how a person responds to a setback matters far more than the setback itself.',
      'The "abstinence violation effect" describes a common, damaging response pattern: after a setback, a person concludes they have failed entirely, which produces shame, which increases negative emotional states, which increases the likelihood of further setbacks. This is sometimes called the "what the hell" effect.',
      'The antidote is not to minimize setbacks, but to have a pre-planned, compassionate response to them. Self-compassion research (Kristin Neff) consistently shows that self-compassionate responses to failure produce better long-term outcomes than self-critical responses.',
      'A practical setback protocol: (1) Acknowledge what happened without catastrophizing. (2) Identify what the triggering conditions were. (3) Consider what could be done differently next time. (4) Return to your routine at the next available opportunity — not after some arbitrary "restart" date.',
      'Streaks are motivating, but streak-focused thinking can backfire: a broken streak feels like total failure, which triggers the abstinence violation effect. Progress is non-linear. The trend matters more than any single data point.',
    ],
    keyTakeaway: 'A setback is data, not a verdict. The response to a setback determines whether it becomes a relapse or a learning event.',
    reflectionQuestion: 'How do you typically respond to a setback? What would a more compassionate, strategic response look like?',
    source: 'Neff (2011), Self-Compassion; Marlatt & Gordon (1985), Relapse Prevention.',
    xpReward: 20,
  },
  {
    id: 'l09',
    number: 9,
    title: 'Cognitive Focus & Attention',
    subtitle: 'How deliberate attention practice reshapes the brain',
    duration: '5 min',
    category: 'Performance',
    freeAccess: false,
    body: [
      'Attention is a trainable skill. The ability to direct and sustain focus — and to redirect it when distracted — is mediated by neural circuits in the prefrontal cortex that can be strengthened through practice.',
      'Research by Michael Merzenich and others on neuroplasticity demonstrates that deliberate, focused practice physically changes the brain — increasing grey matter density and synaptic efficiency in the circuits being exercised.',
      'Distraction is the default mode. The default mode network (DMN), which activates during mind-wandering, is associated with rumination, anxiety, and craving. Focused attention practice suppresses DMN activity and strengthens task-positive networks.',
      'The most evidence-based attention training practices include: mindfulness meditation (even 10-20 minutes daily produces measurable effects after 8 weeks), deliberate single-tasking (one screen, one task, defined time blocks), and physical exercise (shown to improve executive function and attention).',
      'The "flow state" (Csikszentmihalyi) — optimal engagement with a challenging task — represents the highest expression of focused attention. Flow requires: clear goals, immediate feedback, and a challenge level slightly above current ability. Designing for flow in study or work tasks produces meaningful improvements in both output quality and subjective satisfaction.',
      'Chronic digital distraction — constant context-switching, notification-driven attention — has been associated with reduced deep work capacity, higher baseline anxiety, and weaker working memory. The recovery is gradual but real: weeks of intentional focus practice meaningfully rebuilds capacity.',
    ],
    keyTakeaway: 'Attention is a skill that atrophies with distraction and strengthens with deliberate practice.',
    reflectionQuestion: 'When was the last time you spent 25+ uninterrupted minutes on a single demanding task? How did it feel?',
    source: 'Merzenich (2013), Soft-Wired; Csikszentmihalyi (1990), Flow; Tang et al. (2015), Nature Reviews Neuroscience.',
    xpReward: 20,
  },
  {
    id: 'l10',
    number: 10,
    title: 'Long-Term Consistency',
    subtitle: 'The architecture of lasting change',
    duration: '4 min',
    category: 'Strategy',
    freeAccess: false,
    body: [
      'Behavior change research distinguishes between initiation (starting a new behavior) and maintenance (continuing it over time). These are driven by different mechanisms. Most interventions are better at initiation than maintenance.',
      'Identity-based habits (James Clear) tend to be more durable than outcome-based habits. The question is not "I want to quit X" but "What kind of person do I want to be?" — and then making choices consistent with that identity. This shifts the locus of motivation from external (avoiding consequences) to internal (acting consistently with self-concept).',
      'Environmental design is the most powerful, least effortful lever for long-term consistency. Make desired behaviors easy and automatic (reduce friction). Make undesired behaviors difficult or impossible (increase friction). This works with — not against — the automatic nature of habit loops.',
      'Social environment is a strong predictor of behavior. Research consistently shows that the habits of close social contacts influence individual behavior, independent of intention. When possible, spending time with people who embody the behaviors you want to build is one of the highest-leverage moves available.',
      'Review and adjustment cycles — weekly or monthly check-ins where you assess what is working and what is not — dramatically improve long-term outcomes compared to "set it and forget it" approaches. Habits that work for you at one life stage may need adjustment at another.',
      'Finally: progress is rarely linear. Expect plateaus, expect setbacks, and build a system that can absorb them. The goal is not perfection. The goal is a trajectory that trends in the right direction over months and years.',
    ],
    keyTakeaway: 'Long-term consistency is a system design problem, not a willpower problem.',
    reflectionQuestion: 'What is one environmental change you could make this week that would make your desired behavior slightly easier and your unwanted behavior slightly harder?',
    source: 'Clear (2018), Atomic Habits; Christakis & Fowler (2009), Connected; Prochaska & DiClemente (1983), Stages of Change.',
    xpReward: 20,
  },
]

// ============================================================
// Lesson Card
// ============================================================
function LessonCard({
  lesson,
  isCompleted,
  onOpen,
  locked,
}: {
  lesson: Lesson
  isCompleted: boolean
  onOpen: () => void
  locked: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: locked ? 1 : 0.98 }}
      onClick={locked ? undefined : onOpen}
      className={`w-full text-left p-5 rounded-2xl border transition-all ${isCompleted
        ? 'bg-[#C7FF72]/8 border-[#C7FF72]/25'
        : locked
          ? 'bg-white/[0.01] border-white/6 opacity-60 cursor-not-allowed'
          : 'bg-[#0B0B0B]/80 border-white/8 hover:border-white/15'
        }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-numbers text-sm font-bold ${isCompleted ? 'bg-[#C7FF72] text-[#050505]' : locked ? 'bg-white/5 text-white/30' : 'bg-white/[0.06] text-white'}`}>
          {isCompleted ? <CheckCircle2 size={18} /> : locked ? <Lock size={16} /> : lesson.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-subtle">{lesson.category}</span>
            <span className="font-mono text-[9px] text-white/20">·</span>
            <span className="font-mono text-[9px] text-subtle flex items-center gap-1">
              <Clock size={9} /> {lesson.duration}
            </span>
            {isCompleted && (
              <span className="ml-auto font-mono text-[9px] text-[#C7FF72]">+{lesson.xpReward} XP earned</span>
            )}
            {!isCompleted && !locked && (
              <span className="ml-auto font-mono text-[9px] text-subtle">+{lesson.xpReward} XP</span>
            )}
          </div>
          <div className="font-display text-sm font-bold text-white">{lesson.title}</div>
          <div className="font-sans text-[11px] text-muted mt-0.5">{lesson.subtitle}</div>
        </div>
      </div>
    </motion.button>
  )
}

// ============================================================
// Lesson Reader Modal
// ============================================================
function LessonModal({ lesson, onClose, onComplete, isCompleted }: {
  lesson: Lesson
  onClose: () => void
  onComplete: () => void
  isCompleted: boolean
}) {
  const [step, setStep] = useState(0)
  const totalSteps = lesson.body.length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <BookOpen size={16} className="text-[#C7FF72]" />
          <div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-subtle">{lesson.category} · {lesson.duration}</div>
            <div className="font-display text-sm font-bold text-white">{lesson.title}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg border border-white/10 text-muted hover:text-text transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5">
        <motion.div
          className="h-full bg-[#C7FF72]"
          animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {step < totalSteps ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="font-mono text-[10px] text-subtle">
                  {step + 1} of {totalSteps}
                </div>
                <p className="font-sans text-base text-text leading-relaxed">{lesson.body[step]}</p>
              </motion.div>
            ) : (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Key Takeaway */}
                <div className="p-5 rounded-2xl bg-[#C7FF72]/8 border border-[#C7FF72]/25 space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={14} className="text-[#C7FF72]" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#C7FF72]">Key Takeaway</span>
                  </div>
                  <p className="font-sans text-sm text-white leading-relaxed">{lesson.keyTakeaway}</p>
                </div>

                {/* Reflection */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-subtle">Reflection Question</div>
                  <p className="font-sans text-sm text-text leading-relaxed italic">{lesson.reflectionQuestion}</p>
                </div>

                {/* Source */}
                <div className="flex items-start gap-2">
                  <ExternalLink size={11} className="text-subtle shrink-0 mt-0.5" />
                  <p className="font-mono text-[10px] text-subtle leading-relaxed">{lesson.source}</p>
                </div>

                {/* XP */}
                {!isCompleted && (
                  <div className="text-center py-4">
                    <div className="font-numbers text-4xl font-bold text-[#C7FF72]">+{lesson.xpReward} XP</div>
                    <div className="font-mono text-xs text-muted mt-1">for completing this lesson</div>
                  </div>
                )}
                {isCompleted && (
                  <div className="p-4 rounded-xl bg-[#C7FF72]/8 border border-[#C7FF72]/20 text-center font-mono text-[11px] text-[#C7FF72]">
                    Lesson already completed. XP already earned.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-5 py-4 border-t border-white/8 flex items-center justify-between gap-3">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="p-2.5 rounded-xl border border-white/10 text-muted hover:text-text transition-colors disabled:opacity-30"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-[#C7FF72]' : 'bg-white/15'}`} />
          ))}
        </div>

        {step < totalSteps - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors"
          >
            Next <ArrowRight size={13} />
          </button>
        ) : step === totalSteps - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors"
          >
            Finish <ChevronRight size={13} />
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={isCompleted}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompleted ? 'Completed' : 'Mark Complete'} {!isCompleted && <Sparkles size={13} />}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function LearnPage() {
  const { plan, completedLessonIds, completeLesson } = useUserStore()
  const [openLesson, setOpenLesson] = useState<Lesson | null>(null)
  const [justCompleted, setJustCompleted] = useState<string | null>(null)

  const hasPremium = hasFeature('premium_education', plan)
  const completedCount = completedLessonIds.length

  const handleComplete = (lesson: Lesson) => {
    completeLesson(lesson.id, lesson.xpReward)
    setJustCompleted(lesson.id)
    setOpenLesson(null)
    setTimeout(() => setJustCompleted(null), 3000)
  }

  const COURSE_BONUS_XP = 100
  const courseComplete = LESSONS.every(l => completedLessonIds.includes(l.id))

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 pb-28 md:pb-12">

      {/* Toast */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 right-4 z-50 px-4 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#C7FF72]/40 text-white font-mono text-xs shadow-2xl flex items-center gap-2"
          >
            <Sparkles size={13} className="text-[#C7FF72]" />
            <span>Lesson complete! +20 XP earned.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="pb-6 border-b border-white/8">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#C7FF72] uppercase">Education</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">UNBOUND LEARN</h1>
        <p className="font-sans text-sm text-muted max-w-xl mt-2 leading-relaxed">
          10 bite-sized lessons on the psychology and neuroscience of habit change.
          Evidence-based. No jargon. Designed to give you genuine leverage over your own behavior.
        </p>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#0B0B0B] border border-white/8 space-y-1">
          <div className="font-mono text-[10px] text-subtle uppercase">Completed</div>
          <div className="font-numbers text-2xl font-bold text-[#C7FF72]">{completedCount}</div>
          <div className="font-mono text-[10px] text-muted">of 10 lessons</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B0B0B] border border-white/8 space-y-1">
          <div className="font-mono text-[10px] text-subtle uppercase">XP Earned</div>
          <div className="font-numbers text-2xl font-bold text-white">{completedCount * 20}</div>
          <div className="font-mono text-[10px] text-muted">of {LESSONS.length * 20} XP</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B0B0B] border border-white/8 space-y-1">
          <div className="font-mono text-[10px] text-subtle uppercase">Completion</div>
          <div className="font-numbers text-2xl font-bold text-white">
            {Math.round((completedCount / LESSONS.length) * 100)}%
          </div>
          <div className="font-mono text-[10px] text-muted">course progress</div>
        </div>
      </div>

      {/* Course Completion Banner */}
      {courseComplete && (
        <div className="p-5 rounded-2xl bg-[#C7FF72]/10 border border-[#C7FF72]/30 flex items-center gap-4">
          <Sparkles size={24} className="text-[#C7FF72] flex-shrink-0" />
          <div>
            <div className="font-display text-base font-bold text-[#C7FF72]">COURSE COMPLETE</div>
            <div className="font-sans text-sm text-[#C7FF72]/70 mt-0.5">+{COURSE_BONUS_XP} XP course bonus awarded. You have completed all 10 lessons.</div>
          </div>
        </div>
      )}

      {/* Paywall notice for free users */}
      {!hasPremium && (
        <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-white/8 flex items-start gap-4">
          <Lock size={18} className="text-subtle shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-display text-sm font-bold text-white mb-1">LESSONS 4-10 REQUIRE PRO</div>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Lessons 1-3 are free. Upgrade to Pro to unlock all 10 lessons, +{LESSONS.length * 20} XP, and the course completion bonus.
            </p>
            <Link href="/pricing">
              <button className="mt-3 px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors">
                UPGRADE TO PRO
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Lesson List */}
      <div className="space-y-2">
        {LESSONS.map(lesson => {
          const isCompleted = completedLessonIds.includes(lesson.id)
          const locked = !lesson.freeAccess && !hasPremium
          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isCompleted={isCompleted}
              locked={locked}
              onOpen={() => setOpenLesson(lesson)}
            />
          )
        })}
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/6 flex items-start gap-3">
        <BookOpen size={13} className="text-subtle shrink-0 mt-0.5" />
        <p className="font-sans text-[11px] text-subtle leading-relaxed">
          UNBOUND Learn provides educational content for informational purposes. Content is not a substitute
          for professional medical, psychological, or therapeutic advice. Sources cited are for reference; consult
          primary literature and qualified professionals for individualized guidance.
        </p>
      </div>

      {/* Lesson Modal */}
      <AnimatePresence>
        {openLesson && (
          <LessonModal
            lesson={openLesson}
            isCompleted={completedLessonIds.includes(openLesson.id)}
            onClose={() => setOpenLesson(null)}
            onComplete={() => handleComplete(openLesson)}
          />
        )}
      </AnimatePresence>

    </div>
  )
}
