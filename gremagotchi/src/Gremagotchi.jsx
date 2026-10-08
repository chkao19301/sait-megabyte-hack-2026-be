import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Flame, Plus, Sparkles, Trash2 } from 'lucide-react'
import goodPortrait from './assets/mote-good.png'
import eldritchPortrait from './assets/mote-eldritch.png'

const STORAGE_KEY = 'gremagotchi.v1'

const DEFAULT_TASKS = [
  'Drink water',
  'Read for ten minutes',
  'Move your body',
  'Step outside',
  'Send one kind text',
]

const STAGE_MS = {
  rupture: 500,
  flash: 400,
  banish: 1000,
  reveal: 700,
}

const PURGE_PARTIAL = [
  'THE ROUTER IS SAFE.',
  'PURIFICATION COMPLETE. I AM MERELY PASSIVE-AGGRESSIVE NOW.',
]

const LINES = {
  ascended: {
    sweet: [
      'You did the thing and the heavens filed a complaint about how perfect you are.',
      'I would die for you. I am a hamster in a box. This is still true.',
      'Every box you tick is a hymn. Please do not stop the hymn.',
    ],
    cult: [
      (name, streak) =>
        `Streak of ${streak}. The choir has learned ${name}'s name and will not stop singing it.`,
      () => 'Bow your head. Not to me. To the version of you who checked every box.',
      (name) => `${name} has been chosen. The grass agrees. The sun agrees. I agree too loudly.`,
      () => 'We do not miss days. Missing is a kind of death, and we are so alive.',
    ],
  },
  neutral: [
    'Tap tap. Hello. I live in the glass. Do a small thing.',
    'I am cute on purpose. The tasks are not optional on purpose.',
    'We are normal. This is my favorite lie.',
    'The day is young. I am bored in a charming way.',
  ],
  disgruntled: [
    "Oh, you're back. I reheated nothing for you.",
    'Some of us had a whole personality planned around your reading goal.',
    'Side-eye is my love language and also my only language today.',
    'Oh, NOW you show up. The bow stayed on. Out of spite.',
  ],
  eldritch: [
    'I can hear your notifications. Finish your reading or I will haunt your router.',
    'The unread tasks are growing teeth. I am being polite about it.',
    'You left me at 0%. I have met the wifi. We are unionizing.',
    'The bow is the only holy thing left. Do not test it.',
  ],
}

const THEMES = {
  ascended: {
    page: 'bg-gradient-to-b from-sky-200 via-pink-100 to-amber-100 text-rose-950',
    card: 'border-white/80 bg-white/75 shadow-xl shadow-pink-200/70',
    bubble: 'bg-white text-rose-950 shadow-lg shadow-pink-200/50',
    track: 'bg-rose-100',
    fill: 'bg-gradient-to-r from-amber-300 via-pink-400 to-sky-400',
    chip: 'bg-amber-100 text-amber-900',
    row: 'bg-white/80 hover:bg-white',
    field: 'border-rose-100 bg-white/80 text-rose-950 placeholder:text-rose-300',
    muted: 'text-rose-800/70',
    check: 'border-amber-300 bg-amber-50 text-amber-700',
    checkOn: 'border-amber-400 bg-amber-400 text-white',
  },
  neutral: {
    page: 'bg-gradient-to-b from-stone-100 via-emerald-50 to-stone-200 text-stone-800',
    card: 'border-white bg-white/80 shadow-xl shadow-stone-300/70',
    bubble: 'bg-white text-stone-800 shadow-lg shadow-stone-200/80',
    track: 'bg-emerald-100',
    fill: 'bg-emerald-400',
    chip: 'bg-emerald-100 text-emerald-900',
    row: 'bg-white/75 hover:bg-white',
    field: 'border-stone-200 bg-white/80 text-stone-800 placeholder:text-stone-400',
    muted: 'text-stone-500',
    check: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    checkOn: 'border-emerald-500 bg-emerald-500 text-white',
  },
  disgruntled: {
    page: 'bg-gradient-to-b from-zinc-300 via-rose-100 to-zinc-400 text-zinc-800',
    card: 'border-zinc-300/80 bg-zinc-100/90 shadow-xl shadow-zinc-400/50',
    bubble: 'bg-zinc-50 text-zinc-800 shadow-lg',
    track: 'bg-zinc-300',
    fill: 'bg-rose-400',
    chip: 'bg-rose-100 text-rose-900',
    row: 'bg-white/60 hover:bg-white/80',
    field: 'border-zinc-300 bg-white/70 text-zinc-800 placeholder:text-zinc-400',
    muted: 'text-zinc-500',
    check: 'border-zinc-300 bg-zinc-50 text-zinc-600',
    checkOn: 'border-rose-400 bg-rose-400 text-white',
  },
  eldritch: {
    page: 'bg-[#14080b] text-rose-100',
    card: 'border-red-950 bg-zinc-950/85 shadow-2xl shadow-red-950/50',
    bubble: 'bg-zinc-950 text-rose-100 shadow-lg shadow-red-950/60 ring-1 ring-red-900/80',
    track: 'bg-red-950',
    fill: 'bg-red-700',
    chip: 'bg-red-950 text-red-200',
    row: 'bg-zinc-900/80 hover:bg-zinc-900',
    field: 'border-red-950 bg-zinc-900 text-rose-50 placeholder:text-rose-200/40',
    muted: 'text-rose-200/60',
    check: 'border-red-900 bg-zinc-950 text-red-200',
    checkOn: 'border-red-600 bg-red-700 text-white',
  },
}

const MOOD_LABEL = {
  ascended: 'Ascended',
  neutral: 'Neutral',
  disgruntled: 'Disgruntled',
  eldritch: 'Eldritch',
}

const SPARKLE_SPOTS = [
  ['8%', '34%'],
  ['18%', '14%'],
  ['84%', '46%'],
  ['14%', '58%'],
  ['62%', '18%'],
]

function todayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(key, delta) {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + delta)
  return todayKey(date)
}

function formatDate(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function freshTasks() {
  return DEFAULT_TASKS.map((label) => ({
    id: crypto.randomUUID(),
    label,
    done: false,
  }))
}

function freshState() {
  return {
    petName: 'Mote',
    tasks: freshTasks(),
    log: {},
    activeDate: todayKey(),
  }
}

function rollover(state, today = todayKey()) {
  if (!state.activeDate || state.activeDate === today) return state
  if (state.activeDate > today) {
    return {
      ...state,
      activeDate: today,
      tasks: state.tasks.map((task) => ({ ...task, done: false })),
    }
  }

  const log = { ...state.log }
  const total = state.tasks.length
  if (total > 0) {
    log[state.activeDate] = {
      done: state.tasks.filter((task) => task.done).length,
      total,
    }
    let cursor = addDays(state.activeDate, 1)
    let guard = 0
    while (cursor < today && guard < 400) {
      log[cursor] = { done: 0, total }
      cursor = addDays(cursor, 1)
      guard += 1
    }
  }

  return {
    ...state,
    log,
    activeDate: today,
    tasks: state.tasks.map((task) => ({ ...task, done: false })),
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshState()
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.tasks)) return freshState()
    const tasks = parsed.tasks
      .filter((task) => task && typeof task.label === 'string' && task.label.trim())
      .map((task) => ({
        id: String(task.id || crypto.randomUUID()),
        label: task.label.trim().slice(0, 80),
        done: Boolean(task.done),
      }))
    return rollover({
      petName: typeof parsed.petName === 'string' && parsed.petName.trim()
        ? parsed.petName.trim().slice(0, 24)
        : 'Mote',
      tasks,
      log: parsed.log && typeof parsed.log === 'object' ? parsed.log : {},
      activeDate: typeof parsed.activeDate === 'string' ? parsed.activeDate : todayKey(),
    })
  } catch {
    return freshState()
  }
}

function walkDays(log, today, predicate) {
  let count = 0
  let cursor = addDays(today, -1)
  while (count < 400) {
    const entry = log[cursor]
    if (!entry || !(entry.total > 0) || !predicate(entry)) break
    count += 1
    cursor = addDays(cursor, -1)
  }
  return count
}

function missedTail(log, today) {
  return walkDays(log, today, (entry) => entry.done === 0)
}

function pastStreak(log, today) {
  return walkDays(log, today, (entry) => entry.done === entry.total)
}

function deriveMood(state) {
  if (state.tasks.length === 0) return 'neutral'
  const done = state.tasks.filter((task) => task.done).length
  const ratio = done / state.tasks.length
  const missed = missedTail(state.log, state.activeDate)
  if (ratio === 1) return 'ascended'
  if (ratio > 0) return missed >= 1 ? 'disgruntled' : 'neutral'
  if (missed >= 2) return 'eldritch'
  if (missed === 1) return 'disgruntled'
  return 'neutral'
}

function displayedStreak(state) {
  const past = pastStreak(state.log, state.activeDate)
  const complete = state.tasks.length > 0 && state.tasks.every((task) => task.done)
  return past + (complete ? 1 : 0)
}

function speechLine(mood, tasks, streak, name, tick) {
  if (tasks.length === 0) return 'Give me a ritual.'
  if (mood === 'ascended') {
    const bank = streak >= 2 ? LINES.ascended.cult : LINES.ascended.sweet
    const line = bank[tick % bank.length]
    return typeof line === 'function' ? line(name, streak) : line
  }
  const bank = LINES[mood]
  return bank[tick % bank.length]
}

function makeShards() {
  return Array.from({ length: 18 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 18 + Math.random() * 0.35
    const distance = 90 + Math.random() * 150
    return {
      id: index,
      dx: `${Math.cos(angle) * distance}px`,
      dy: `${Math.sin(angle) * distance}px`,
      color: ['#7f1d1d', '#111827', '#fecdd3', '#fde68a', '#fff'][index % 5],
      size: 8 + (index % 4) * 5,
      round: index % 3 === 0,
    }
  })
}

function withTasks(tasks) {
  return tasks.length > 0 ? tasks : freshTasks()
}

function Meadow({ aura }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-pink-200 to-lime-200">
      <svg className="sun-spin absolute -right-2 top-2 h-28 w-28" viewBox="0 0 100 100" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <line
            key={index}
            x1="50"
            y1="14"
            x2="50"
            y2="28"
            stroke="#facc15"
            strokeWidth="5"
            strokeLinecap="round"
            transform={`rotate(${index * 45} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="16" fill="#fde047" />
      </svg>
      <svg className="absolute inset-x-2 top-8 h-28" viewBox="0 0 200 80" fill="none" aria-hidden="true">
        <path d="M8 78 A92 72 0 0 1 192 78" stroke="#fb7185" strokeWidth="7" />
        <path d="M16 78 A84 64 0 0 1 184 78" stroke="#fb923c" strokeWidth="7" />
        <path d="M24 78 A76 56 0 0 1 176 78" stroke="#facc15" strokeWidth="7" />
        <path d="M32 78 A68 48 0 0 1 168 78" stroke="#4ade80" strokeWidth="7" />
        <path d="M40 78 A60 40 0 0 1 160 78" stroke="#38bdf8" strokeWidth="7" />
        <path d="M48 78 A52 32 0 0 1 152 78" stroke="#a78bfa" strokeWidth="7" />
      </svg>
      {SPARKLE_SPOTS.slice(0, Math.min(5, Math.max(1, aura))).map(([left, top], index) => (
        <Sparkles
          key={`${left}-${top}`}
          className="twinkle absolute h-6 w-6 text-yellow-100 drop-shadow"
          style={{ left, top, animationDelay: `${index * 0.18}s` }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function Grass({ wilted }) {
  return (
    <svg className="absolute inset-x-0 bottom-0 z-20 h-24" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true">
      <rect x="0" y="64" width="200" height="16" fill={wilted ? '#57534e' : '#15803d'} />
      {Array.from({ length: 18 }, (_, index) => {
        const x = 4 + index * 11
        const height = 26 + (index % 4) * 8
        const lean = wilted ? 16 : index % 2 === 0 ? -6 : 6
        const color = wilted
          ? index % 2 === 0 ? '#78716c' : '#a8a29e'
          : ['#65a30d', '#16a34a', '#84cc16'][index % 3]
        return (
          <path
            key={index}
            d={`M${x} 78 Q${x + lean} ${78 - height / 2} ${x + lean * 0.35} ${78 - height}`}
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}

function bloodDrop(x, height, width) {
  const half = width / 2
  return `M${x - half * 0.4} 0
    C${x - half} ${height * 0.35} ${x - half} ${height * 0.62} ${x} ${height}
    C${x + half} ${height * 0.62} ${x + half} ${height * 0.35} ${x + half * 0.4} 0 Z`
}

function BloodFrame({ wiping }) {
  const drops = [
    [16, 58, 10, 0],
    [42, 78, 13, 0.25],
    [74, 50, 8, 0.45],
    [108, 86, 14, 0.1],
    [146, 64, 11, 0.35],
    [178, 92, 16, 0.15],
  ]
  return (
    <svg
      className={`pointer-events-none absolute inset-x-0 top-0 z-30 h-32 w-full ${wiping ? 'blood-wipe' : ''}`}
      viewBox="0 0 200 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="200" height="8" fill="#7f1d1d" />
      {drops.map(([x, height, width, delay]) => (
        <path
          key={x}
          className="drip"
          d={bloodDrop(x, height, width)}
          fill="#9f1239"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </svg>
  )
}

function Stage({ sceneMood, showHorror, name, aura, wiping }) {
  const mask = sceneMood === 'ascended' ? 'portrait-mask' : ''
  const float = sceneMood === 'ascended' && !showHorror ? 'pet-float' : ''
  const portraitClass = 'absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-700'

  return (
    <div className="relative aspect-square overflow-hidden rounded-[1.6rem]">
      <div className={`absolute inset-0 transition-opacity duration-700 ${sceneMood === 'ascended' ? 'opacity-100' : 'opacity-0'}`}>
        <Meadow aura={aura} />
      </div>
      <div className={`absolute inset-0 bg-gradient-to-b from-stone-100 to-emerald-50 transition-opacity duration-700 ${sceneMood === 'neutral' ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute inset-0 bg-gradient-to-b from-zinc-500 to-stone-600 transition-opacity duration-700 ${sceneMood === 'disgruntled' ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,#4c151c_0%,#120608_72%)] transition-opacity duration-700 ${sceneMood === 'eldritch' ? 'opacity-100' : 'opacity-0'}`} />

      <img
        src={goodPortrait}
        alt={showHorror ? '' : `${name}, the bow hamster`}
        className={`${portraitClass} ${mask} ${float} ${showHorror ? 'opacity-0' : 'opacity-100'} ${sceneMood === 'disgruntled' && !showHorror ? 'disgruntled-grade' : ''}`}
      />
      <img
        src={eldritchPortrait}
        alt={showHorror ? `${name}, many-eyed and cursed` : ''}
        className={`${portraitClass} ${mask} ${showHorror ? 'opacity-100' : 'opacity-0'}`}
      />
      {showHorror && (
        <>
          <img src={eldritchPortrait} alt="" className={`absolute inset-0 z-[15] h-full w-full object-cover ${mask} glitch-a`} />
          <img src={eldritchPortrait} alt="" className={`absolute inset-0 z-[15] h-full w-full object-cover ${mask} glitch-b`} />
        </>
      )}

      {sceneMood === 'ascended' && <Grass wilted={false} />}
      {sceneMood === 'disgruntled' && <Grass wilted />}
      {sceneMood === 'neutral' && !showHorror && (
        <svg className="paw-tap absolute right-6 bottom-10 z-20 h-11 w-11 text-white/85 drop-shadow" viewBox="0 0 64 64" aria-hidden="true">
          <ellipse cx="32" cy="42" rx="14" ry="12" fill="currentColor" />
          <circle cx="16" cy="26" r="6" fill="currentColor" />
          <circle cx="28" cy="16" r="6.5" fill="currentColor" />
          <circle cx="42" cy="16" r="6.5" fill="currentColor" />
          <circle cx="52" cy="28" r="5.5" fill="currentColor" />
        </svg>
      )}
      {showHorror && (
        <>
          <div className="scanlines pointer-events-none absolute inset-0 z-20" />
          <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(90,0,0,0.72)_100%)]" />
          <BloodFrame wiping={wiping} />
        </>
      )}
      {sceneMood === 'disgruntled' && !showHorror && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-black/20" />
      )}
    </div>
  )
}

export default function Gremagotchi() {
  const [state, setState] = useState(loadState)
  const [lineTick, setLineTick] = useState(0)
  const [purge, setPurge] = useState(null)
  const [draft, setDraft] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(state.petName)
  const purgeRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    const tick = () => setState((current) => rollover(current))
    const id = window.setInterval(tick, 30000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  useEffect(() => {
    if (!purge) return undefined
    const delay = purge.reduced && purge.stage === 'reveal' ? 450 : STAGE_MS[purge.stage]
    const id = window.setTimeout(() => {
      setPurge((current) => {
        if (!current || current.stage === 'reveal') {
          purgeRef.current = null
          return null
        }
        const order = ['rupture', 'flash', 'banish', 'reveal']
        const next = { ...current, stage: order[order.indexOf(current.stage) + 1] }
        purgeRef.current = next
        return next
      })
    }, delay)
    return () => window.clearTimeout(id)
  }, [purge])

  const mood = deriveMood(state)
  const streak = displayedStreak(state)
  const shownStreak = purge && purge.stage !== 'reveal' && purge.toMood === 'ascended'
    ? Math.max(0, streak - 1)
    : streak
  const showHorror = purge ? purge.stage !== 'reveal' : mood === 'eldritch'
  let sceneMood = mood
  if (showHorror) sceneMood = 'eldritch'
  if (purge?.stage === 'banish') sceneMood = purge.toMood === 'ascended' ? 'ascended' : 'disgruntled'
  if (purge?.stage === 'reveal') sceneMood = mood

  const theme = THEMES[sceneMood]
  const doneCount = state.tasks.filter((task) => task.done).length
  const total = state.tasks.length
  const ratio = total === 0 ? 0 : doneCount / total
  const aura = Math.min(5, Math.max(1, streak || 1))

  let speech = speechLine(mood, state.tasks, streak, state.petName, lineTick)
  if (purge && (purge.stage === 'rupture' || purge.stage === 'flash')) speech = 'WAIT— DON’T—'
  if (purge?.stage === 'banish') speech = purge.line
  if (purge?.stage === 'reveal') speech = speechLine(mood, state.tasks, streak, state.petName, lineTick)

  function startPurge(toMood) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const line = toMood === 'ascended'
      ? 'ONE CHECKBOX AND I AM CHOIR.'
      : PURGE_PARTIAL[Math.floor(Math.random() * PURGE_PARTIAL.length)]
    const next = {
      stage: reduced ? 'reveal' : 'rupture',
      toMood,
      line,
      reduced,
      shards: makeShards(),
    }
    purgeRef.current = next
    setPurge(next)
  }

  function skipPurge() {
    setPurge((current) => {
      if (!current) return null
      const next = { ...current, stage: 'reveal', reduced: true }
      purgeRef.current = next
      return next
    })
  }

  function toggleTask(id) {
    if (purgeRef.current) return
    const task = state.tasks.find((item) => item.id === id)
    if (!task) return
    const before = deriveMood(state)
    const next = {
      ...state,
      tasks: state.tasks.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    }
    setState(next)
    setLineTick((value) => value + 1)
    if (before === 'eldritch' && !task.done) startPurge(deriveMood(next))
  }

  function removeTask(id) {
    if (purgeRef.current) return
    setState((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== id),
    }))
    setLineTick((value) => value + 1)
  }

  function addTask(event) {
    event.preventDefault()
    if (purgeRef.current) return
    const label = draft.trim().slice(0, 80)
    if (!label) return
    setState((current) => ({
      ...current,
      tasks: [...current.tasks, { id: crypto.randomUUID(), label, done: false }],
    }))
    setDraft('')
    setLineTick((value) => value + 1)
  }

  function commitName() {
    const next = nameDraft.trim().slice(0, 24) || 'Mote'
    setState((current) => ({ ...current, petName: next }))
    setNameDraft(next)
    setEditingName(false)
  }

  function applyOmen(kind) {
    if (purgeRef.current) return
    setLineTick((value) => value + 1)
    setState((current) => {
      const today = current.activeDate
      const tasks = withTasks(current.tasks)
      const count = tasks.length
      const log = { ...current.log }
      if (kind === 'blessed') {
        for (let index = 1; index <= 4; index += 1) {
          log[addDays(today, -index)] = { done: count, total: count }
        }
        return { ...current, log, tasks: tasks.map((task) => ({ ...task, done: true })) }
      }
      if (kind === 'skipped') {
        log[addDays(today, -1)] = { done: 0, total: count }
        log[addDays(today, -2)] = { done: count, total: count }
        return { ...current, log, tasks: tasks.map((task) => ({ ...task, done: false })) }
      }
      log[addDays(today, -1)] = { done: 0, total: count }
      log[addDays(today, -2)] = { done: 0, total: count }
      log[addDays(today, -3)] = { done: 0, total: count }
      return { ...current, log, tasks: tasks.map((task) => ({ ...task, done: false })) }
    })
  }

  const hardShake = purge?.stage === 'rupture'
  const showCaption = purge?.stage === 'banish' || (purge?.reduced && purge?.stage === 'reveal')
  const wiping = purge?.stage === 'banish' || purge?.stage === 'reveal'

  return (
    <div className={`min-h-dvh overflow-x-hidden px-4 py-6 transition-colors duration-700 sm:py-10 ${theme.page} ${showHorror && !hardShake ? 'screen-shake' : ''} ${hardShake ? 'rupture-shake' : ''}`}>
      {showHorror && <div className="scanlines pointer-events-none fixed inset-0 z-20 opacity-50" />}
      {showHorror && (
        <div className="pointer-events-none fixed inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(60,0,0,0.55)_100%)]" />
      )}

      <main className={`relative z-10 mx-auto w-full max-w-md rounded-[2rem] border p-4 backdrop-blur-md transition-colors duration-700 sm:p-5 ${theme.card} ${showHorror ? 'rgb-frame' : ''}`}>
        <p className={`text-xs font-extrabold tracking-[0.22em] uppercase ${theme.muted}`}>Gremagotchi</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {editingName ? (
              <input
                autoFocus
                value={nameDraft}
                aria-label="Pet name"
                maxLength={24}
                onChange={(event) => setNameDraft(event.target.value)}
                onBlur={commitName}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.currentTarget.blur()
                  if (event.key === 'Escape') {
                    setNameDraft(state.petName)
                    setEditingName(false)
                  }
                }}
                className={`w-full rounded-xl border px-2 py-1 text-2xl font-extrabold outline-none ${theme.field}`}
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNameDraft(state.petName)
                  setEditingName(true)
                }}
                className="max-w-full truncate text-left text-3xl font-extrabold tracking-tight"
              >
                {state.petName}
              </button>
            )}
            <p className={`mt-1 text-sm font-bold ${theme.muted}`}>{formatDate(state.activeDate)}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-extrabold ${theme.chip}`}>
              <Flame className="h-4 w-4" aria-hidden="true" />
              {shownStreak === 0 ? 'No streak' : `${shownStreak}-day streak`}
            </span>
            <span className={`text-xs font-extrabold tracking-wide uppercase ${theme.muted}`}>
              {MOOD_LABEL[showHorror ? 'eldritch' : mood]}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <Stage
            sceneMood={sceneMood}
            showHorror={showHorror}
            name={state.petName}
            aura={aura}
            wiping={wiping}
          />
          <p
            aria-live="polite"
            className={`relative z-20 -mt-5 rounded-[1.4rem] px-4 py-3 text-base leading-snug font-bold ${theme.bubble}`}
          >
            {speech}
          </p>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm font-extrabold">
            <span>Today&apos;s devotion</span>
            <span className={theme.muted}>{total === 0 ? 'No rituals yet' : `${doneCount} of ${total}`}</span>
          </div>
          <div
            className={`h-2 overflow-hidden rounded-full ${theme.track}`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={doneCount}
            aria-label="Today's devotion"
          >
            <div className={`h-full rounded-full transition-all duration-500 ${theme.fill}`} style={{ width: `${ratio * 100}%` }} />
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {state.tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2">
              <button
                type="button"
                disabled={Boolean(purge)}
                aria-pressed={task.done}
                onClick={() => toggleTask(task.id)}
                className={`flex min-h-12 flex-1 items-center gap-3 rounded-2xl px-3 py-2 text-left transition disabled:opacity-70 ${theme.row}`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${task.done ? theme.checkOn : theme.check}`}>
                  {task.done && <Check className="h-4 w-4" aria-hidden="true" />}
                </span>
                <span className={`font-bold ${task.done ? 'line-through opacity-60' : ''}`}>{task.label}</span>
              </button>
              <button
                type="button"
                disabled={Boolean(purge)}
                aria-label={`Delete ${task.label}`}
                onClick={() => removeTask(task.id)}
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl disabled:opacity-70 ${theme.row}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={addTask} className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a ritual"
            maxLength={80}
            disabled={Boolean(purge)}
            aria-label="New habit"
            className={`min-h-12 flex-1 rounded-2xl border px-4 font-bold outline-none ${theme.field}`}
          />
          <button
            type="submit"
            disabled={Boolean(purge)}
            aria-label="Add habit"
            className={`grid h-12 w-12 place-items-center rounded-2xl disabled:opacity-70 ${theme.checkOn}`}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
        </form>

        <details className="group mt-4">
          <summary className={`flex cursor-pointer items-center justify-between text-xs font-extrabold tracking-wide uppercase ${theme.muted}`}>
            Omen board
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className={`mt-2 text-xs font-semibold ${theme.muted}`}>
            Demo controls. They rewrite the calendar so every mood can be shown.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ['blessed', 'Blessed streak'],
              ['skipped', 'One skipped day'],
              ['silence', 'Three nights of silence'],
            ].map(([kind, label]) => (
              <button
                key={kind}
                type="button"
                disabled={Boolean(purge)}
                onClick={() => applyOmen(kind)}
                className={`rounded-full border px-3 py-1.5 text-xs font-extrabold disabled:opacity-70 ${theme.field}`}
              >
                {label}
              </button>
            ))}
          </div>
        </details>
      </main>

      {purge?.stage === 'flash' && <div className="gold-flash pointer-events-none fixed inset-0 z-40" />}

      {showCaption && (
        <p className="pointer-events-none fixed inset-x-4 top-[18%] z-40 text-center text-2xl font-extrabold tracking-wide text-amber-50 drop-shadow-[0_2px_0_rgba(80,0,0,0.8)] sm:text-4xl">
          {purge.line}
        </p>
      )}

      {purge && (purge.stage === 'banish' || purge.stage === 'flash') && (
        <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center">
          {purge.stage === 'banish' && purge.shards.map((shard) => (
            <span
              key={shard.id}
              className="purge-shard absolute"
              style={{
                '--dx': shard.dx,
                '--dy': shard.dy,
                width: shard.size,
                height: shard.size,
                borderRadius: shard.round ? '999px' : '2px',
                background: shard.color,
              }}
            />
          ))}
        </div>
      )}

      {purge && (
        <button
          type="button"
          onClick={skipPurge}
          className="fixed right-4 bottom-4 z-50 rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-zinc-900 shadow-lg"
        >
          Skip
        </button>
      )}
    </div>
  )
}
