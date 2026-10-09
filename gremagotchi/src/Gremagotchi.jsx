import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Flame, Inbox, Plus, Trash2, Volume2, VolumeX, X } from 'lucide-react'
import happyPortrait from './assets/mote-happy.jpg'
import midPortrait from './assets/mote-mid.jpg'
import eldritchPortrait from './assets/mote-eldritch.jpg'
import bloodFrame from './assets/blood-frame.png'
import inboxCatalog from './data/inbox.json'

const STORAGE_KEY = 'gremagotchi.v1'
const INBOX_READ_KEY = 'gremagotchi.inbox-read'

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

const GIBBERISH = [
  'krrth nnnng shhllk... the bow... nnn',
  'hkk grrthnn mmmwaa click click skree',
  'glrbb... wifi tastes like teeth... mmmngh',
  'nnn /// the boxes are chewing... hhhkk',
  'skraa... uncheck... the dark is wet... gllk',
]

const NEUTRAL_LINES = [
  "I'm here with you. One little step at a time.",
  'No rush. We can start with something small.',
  'A little progress still counts.',
  "Let's pick one gentle thing to do.",
  "I'm quietly cheering you on.",
]

const DISGRUNTLED_LINES = [
  'We missed a few rituals... but there is still time.',
  'I noticed those unchecked boxes. Just saying.',
  "Don't make me stare at these tasks all day.",
  "One task. That's all I'm asking.",
  'The checklist and I are both disappointed.',
]

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
    sheet: 'bg-rose-50 text-rose-950',
    note: 'bg-white',
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
    sheet: 'bg-stone-50 text-stone-800',
    note: 'bg-white',
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
    sheet: 'bg-zinc-100 text-zinc-800',
    note: 'bg-white',
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
    sheet: 'bg-[#1a0c10] text-rose-100',
    note: 'bg-zinc-950 ring-1 ring-red-950',
  },
}

const MOOD_LABEL = {
  ascended: 'Ascended',
  neutral: 'Neutral',
  disgruntled: 'Disgruntled',
  eldritch: 'Eldritch',
}

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

function createTaskId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function freshTasks() {
  return DEFAULT_TASKS.map((label) => ({
    id: createTaskId(),
    label,
    done: false,
  }))
}

function freshState() {
  return {
    petName: 'Marshmallow',
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
      missed: state.tasks.filter((task) => !task.done).map((task) => task.label),
    }
    const everyLabel = state.tasks.map((task) => task.label)
    let cursor = addDays(state.activeDate, 1)
    let guard = 0
    while (cursor < today && guard < 400) {
      log[cursor] = { done: 0, total, missed: everyLabel }
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
        id: String(task.id || createTaskId()),
        label: task.label.trim().slice(0, 80),
        done: Boolean(task.done),
      }))
    return rollover({
      petName: typeof parsed.petName === 'string' && parsed.petName.trim() && parsed.petName.trim() !== 'Mote'
        ? parsed.petName.trim().slice(0, 24)
        : 'Marshmallow',
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

function speechLine(mood, tick) {
  if (mood === 'ascended') return 'your doing great keep going UwU🩷'
  if (mood === 'neutral') return NEUTRAL_LINES[tick % NEUTRAL_LINES.length]
  if (mood === 'disgruntled') return DISGRUNTLED_LINES[tick % DISGRUNTLED_LINES.length]
  return GIBBERISH[tick % GIBBERISH.length]
}

function speakText(text) {
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.pitch = 0.45
  utterance.rate = 0.82
  const voices = window.speechSynthesis.getVoices()
  utterance.voice = voices.find((voice) => /david|daniel|mark|alex|guy|male/i.test(voice.name)
    && voice.lang.toLowerCase().startsWith('en'))
    || voices.find((voice) => voice.lang.toLowerCase().startsWith('en'))
    || null
  window.speechSynthesis.speak(utterance)
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

function loadReadIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(INBOX_READ_KEY))
    return new Set(Array.isArray(raw) ? raw.filter((id) => typeof id === 'string') : [])
  } catch {
    return new Set()
  }
}

function hashSeed(seed) {
  return [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function popupSpot(id) {
  const hash = hashSeed(id)
  const left = 2 + (hash % 74)
  const top = 4 + ((hash * 17) % 72)
  return {
    left: `clamp(8px, ${left}%, calc(100% - min(17rem, 92vw)))`,
    top: `clamp(8px, ${top}%, calc(100% - 9rem))`,
  }
}

function fillTemplate(text, habit, name, nights) {
  return text
    .replaceAll('{habit}', habit)
    .replaceAll('{name}', name)
    .replaceAll('{nights}', String(nights))
}

function missedFromEntry(entry, tasks) {
  if (!entry || !(entry.total > 0) || entry.done === entry.total) return []
  if (Array.isArray(entry.missed)) return entry.missed.filter((label) => typeof label === 'string' && label)
  if (entry.done === 0) return tasks.map((task) => task.label)
  return []
}

function whenLabel(item) {
  if (item.openToday && item.nights === 0) return 'Still open today'
  if (item.openToday && item.nights === 1) return 'Missed yesterday, still open'
  if (item.openToday) return `Missed ${item.nights} nights, still open`
  if (item.nights === 1) return 'Yesterday'
  return `${item.nights} nights ago`
}

function pickMessage(habit, tone, index) {
  const specific = inboxCatalog.habits?.[habit]?.[tone]
  const list = Array.isArray(specific) && specific.length ? specific : inboxCatalog.fallback[tone]
  return list[index % list.length]
}

function buildNotes(state, mood) {
  if (mood !== 'disgruntled' && mood !== 'eldritch') return []
  const nightsByHabit = new Map()
  let cursor = addDays(state.activeDate, -1)
  const tail = missedTail(state.log, state.activeDate)
  for (let depth = 1; depth <= tail; depth += 1) {
    missedFromEntry(state.log[cursor], state.tasks).forEach((habit) => {
      nightsByHabit.set(habit, (nightsByHabit.get(habit) || 0) + 1)
    })
    cursor = addDays(cursor, -1)
  }
  const grouped = new Map()
  state.tasks.filter((task) => !task.done).forEach((task) => {
    grouped.set(task.label, {
      habit: task.label,
      nights: nightsByHabit.get(task.label) || 0,
      openToday: true,
    })
  })

  return [...grouped.values()]
    .map((item, index) => {
      const tone = mood === 'eldritch' || item.nights >= 2 ? 'eldritch' : 'disgruntled'
      const message = pickMessage(item.habit, tone, index)
      return {
        id: `${item.habit}:${tone}`,
        habit: item.habit,
        tone,
        title: fillTemplate(message.title, item.habit, state.petName, item.nights),
        body: fillTemplate(message.body, item.habit, state.petName, item.nights),
        when: whenLabel(item),
        nights: item.nights,
      }
    })
    .sort((a, b) => b.nights - a.nights || a.habit.localeCompare(b.habit))
}

function BloodFrame({ wiping }) {
  return (
    <img
      src={bloodFrame}
      alt=""
      className={`pointer-events-none absolute inset-0 z-30 h-full w-full object-cover ${wiping ? 'blood-wipe' : ''}`}
    />
  )
}

function Stage({ sceneMood, showHorror, name, wiping }) {
  const showHappy = sceneMood === 'ascended' && !showHorror
  const showMid = (sceneMood === 'neutral' || sceneMood === 'disgruntled') && !showHorror
  const portraitClass = 'absolute inset-0 z-10 h-full w-full object-cover object-center transition-opacity duration-700'

  return (
    <div className="relative aspect-square overflow-hidden rounded-[1.6rem] bg-stone-200">
      <img
        src={happyPortrait}
        alt={showHappy ? `${name} celebrating in the meadow` : ''}
        className={`${portraitClass} ${showHappy ? 'pet-float opacity-100' : 'opacity-0'}`}
      />
      <img
        src={midPortrait}
        alt={showMid ? `${name}, a little disappointed` : ''}
        className={`${portraitClass} ${showMid ? 'opacity-100' : 'opacity-0'} ${sceneMood === 'disgruntled' && showMid ? 'brightness-90' : ''}`}
      />
      <img
        src={eldritchPortrait}
        alt={showHorror ? `${name}, cursed and fanged` : ''}
        className={`${portraitClass} ${showHorror ? 'opacity-100' : 'opacity-0'}`}
      />
      {showHorror && (
        <>
          <img src={eldritchPortrait} alt="" className="glitch-a absolute inset-0 z-[15] h-full w-full object-cover object-center" />
          <img src={eldritchPortrait} alt="" className="glitch-b absolute inset-0 z-[15] h-full w-full object-cover object-center" />
        </>
      )}
      {showHorror && (
        <>
          <div className="scanlines pointer-events-none absolute inset-0 z-20" />
          <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(40,0,0,0.45)_100%)]" />
          <BloodFrame wiping={wiping} />
        </>
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
  const [inboxOpen, setInboxOpen] = useState(false)
  const [readIds, setReadIds] = useState(loadReadIds)
  const [hiddenPopups, setHiddenPopups] = useState(() => new Set())
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const purgeRef = useRef(null)
  const lastSpokenRef = useRef('')
  const voiceSupported = typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && typeof SpeechSynthesisUtterance !== 'undefined'

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => () => {
    if (voiceSupported) window.speechSynthesis.cancel()
  }, [voiceSupported])

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

  let speech = speechLine(sceneMood, lineTick)
  if (purge && (purge.stage === 'rupture' || purge.stage === 'flash')) speech = 'WAIT— DON’T—'
  if (purge?.stage === 'banish') speech = purge.line
  if (purge?.stage === 'reveal') speech = speechLine(mood, lineTick)

  useEffect(() => {
    if (!voiceEnabled || !voiceSupported || lastSpokenRef.current === speech) return
    lastSpokenRef.current = speech
    speakText(speech)
  }, [speech, voiceEnabled, voiceSupported])

  function toggleVoice() {
    if (!voiceSupported) return
    if (voiceEnabled) {
      window.speechSynthesis.cancel()
      lastSpokenRef.current = ''
      setVoiceEnabled(false)
      return
    }
    lastSpokenRef.current = speech
    speakText(speech)
    setVoiceEnabled(true)
  }

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
      tasks: [...current.tasks, { id: createTaskId(), label, done: false }],
    }))
    setDraft('')
    setLineTick((value) => value + 1)
  }

  function commitName() {
    const next = nameDraft.trim().slice(0, 24) || 'Marshmallow'
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
      const labels = tasks.map((task) => task.label)
      const log = { ...current.log }
      const blank = { done: 0, total: count, missed: labels }
      const perfect = { done: count, total: count, missed: [] }
      if (kind === 'blessed') {
        for (let index = 1; index <= 4; index += 1) log[addDays(today, -index)] = perfect
        return { ...current, log, tasks: tasks.map((task) => ({ ...task, done: true })) }
      }
      if (kind === 'skipped') {
        log[addDays(today, -1)] = blank
        log[addDays(today, -2)] = perfect
        return { ...current, log, tasks: tasks.map((task) => ({ ...task, done: false })) }
      }
      log[addDays(today, -1)] = blank
      log[addDays(today, -2)] = blank
      log[addDays(today, -3)] = blank
      return { ...current, log, tasks: tasks.map((task) => ({ ...task, done: false })) }
    })
  }

  const notes = buildNotes(state, showHorror ? 'eldritch' : mood)
  const unread = notes.filter((note) => !readIds.has(note.id)).length
  const eldritchPopups = mood === 'eldritch' && !purge
    ? notes.filter((note) => !hiddenPopups.has(note.id))
    : []

  function openInbox() {
    const ids = notes.map((note) => note.id)
    localStorage.setItem(INBOX_READ_KEY, JSON.stringify(ids))
    setReadIds(new Set(ids))
    setInboxOpen(true)
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
        <div className="flex items-center justify-between gap-3">
          <p className={`text-xs font-extrabold tracking-[0.22em] uppercase ${theme.muted}`}>Gremagotchi</p>
          <button
            type="button"
            onClick={openInbox}
            aria-label={unread > 0 ? `Inbox, ${unread} unread` : 'Inbox'}
            className={`relative grid h-10 w-10 place-items-center rounded-full ${theme.chip}`}
          >
            <Inbox className="h-5 w-5" aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </div>
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
            wiping={wiping}
          />
          <div className="relative z-20 -mt-5 flex items-start gap-2">
            <p
              aria-live="polite"
              className={`min-h-12 flex-1 rounded-[1.4rem] px-4 py-3 text-base leading-snug font-bold ${theme.bubble}`}
            >
              {speech}
            </p>
            <button
              type="button"
              onClick={toggleVoice}
              disabled={!voiceSupported}
              aria-label={
                voiceSupported
                  ? voiceEnabled ? 'Turn speech off' : 'Read speech aloud'
                  : 'Speech output is not supported by this browser'
              }
              aria-pressed={voiceEnabled}
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${theme.bubble} focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {voiceEnabled
                ? <Volume2 className="h-5 w-5" aria-hidden="true" />
                : <VolumeX className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
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

          {inboxOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Inbox from ${state.petName}`}
              className={`absolute inset-0 z-30 flex flex-col rounded-[2rem] p-4 sm:p-5 ${theme.sheet}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={`text-xs font-extrabold tracking-[0.22em] uppercase ${theme.muted}`}>From {state.petName}</p>
                  <h2 className="text-2xl font-extrabold tracking-tight">Inbox</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setInboxOpen(false)}
                  aria-label="Close inbox"
                  className={`grid h-10 w-10 place-items-center rounded-full ${theme.note}`}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              {notes.length === 0 ? (
                <p className={`mt-6 rounded-[1.4rem] px-4 py-4 font-bold ${theme.note}`}>{inboxCatalog.empty}</p>
              ) : (
                <ul className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
                  {notes.map((note) => (
                    <li key={note.id} className={`rounded-[1.4rem] px-4 py-3 ${theme.note}`}>
                      <p className={`text-xs font-extrabold tracking-wide uppercase ${theme.muted}`}>
                        {state.petName} · {note.when}
                      </p>
                      <p className="mt-1 font-extrabold">{note.title}</p>
                      {note.body ? <p className="mt-1 text-sm leading-snug font-semibold">{note.body}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
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
      {eldritchPopups.length > 0 && createPortal(
        <div className="pointer-events-none fixed inset-0 z-[70]" aria-live="polite">
          {eldritchPopups.map((note, index) => (
            <article
              key={note.id}
              className="eldritch-popup pointer-events-auto fixed flex w-[min(17rem,calc(100vw-1.5rem))] items-start gap-2 rounded-2xl bg-zinc-950 px-3 py-3 text-rose-50 shadow-2xl ring-1 ring-red-800"
              style={{ ...popupSpot(note.id), animationDelay: `${index * 90}ms` }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold tracking-wide text-red-300 uppercase">
                  {state.petName} · {note.when}
                </p>
                <p className="mt-0.5 font-extrabold">{note.title}</p>
                {note.body ? <p className="mt-1 text-sm leading-snug font-semibold text-rose-100/90">{note.body}</p> : null}
              </div>
              <button
                type="button"
                aria-label={`Dismiss ${note.title}`}
                onClick={() => setHiddenPopups((current) => new Set(current).add(note.id))}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-rose-200 hover:bg-red-950"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}
