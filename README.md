# 🐹 Gremagotchi

> **A Tamagotchi habit tracker with psychological horror consequences.**  
> Complete your daily devotions to elevate your pet into rainbow ecstasy. Neglect your rituals, and watch an innocent creature mutate into an Eldritch horror that haunts your screen.

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Hackathon](https://img.shields.io/badge/SAIT-Megabyte%20Hack%202026-red)](#)

---

## 📸 Visual Showcase

| 🌸 Neutral State | ✨ Ascended State | 🩸 Eldritch State |
| :---: | :---: | :---: |
| <img src="./2026-10-09%20200754.png" width="300" alt="Neutral State" /> | <img src="./2026-10-09%20200823.png" width="300" alt="Ascended State" /> | <img src="./2026-10-09%20200915.png" width="300" alt="Eldritch State" /> |
| *"I'm here with you. One little step at a time."*<br>Gentle support, cute bow, low-stress daily habit routines. | *"your doing great keep going UwU 🩷"*<br>100% completion unlocks confetti, cheer pom-poms & streak boosts. | *"Every empty checkmark is proof that you'd rather disappoint yourself..."*<br>Multi-day neglect breaks the seal: blood frames, scanlines & guilt popups. |

---

## 🌟 Key Features

### 1. 🎭 Dynamic Mood & Evolution System
- **Neutral**: Meet **Marshmallow**—an adorable hamster offering gentle nudges and positive micro-affirmations.
- **Ascended**: Check off every ritual on your list to bathe the screen in pastel skies, rainbows, celebratory confetti, and streak counters.
- **Disgruntled**: Miss a habit or two, and Marshmallow's demeanor chills with passive-aggressive remarks and subtle side-eye.
- **Eldritch**: Abandon your rituals across multiple days, and your companion mutates into a bloodcurdling entity. Features chromatic glitch shaders, CRT scanlines, screen tremors, visceral blood borders, and sinister whispers.

### 2. ⚡ The Purification & Exorcism Ritual
When your pet is trapped in the Eldritch realm, taking action is the only cure. Checking off an overdue devotion triggers a cinematic banishment sequence:
- **Rupture Shake & Golden Flash**: Visual reality distorts as the curse shatters.
- **Particle Shard Explosions**: The demonic shell fragments across the viewport.
- **Blood Wipe**: Blood splatters dissolve into pristine light.
- *"ONE CHECKBOX AND I AM CHOIR."* — Marshmallow is cleansed back to life!

### 3. 📬 Sinister Inbox & Psychological Dread Popups
- **Guilt-Driven Inbox**: Analyzes exactly which habits you abandoned and tracks consecutive missed nights, delivering targeted, existential wake-up calls.
- **Screen-Cluttering Popups**: In Eldritch mode, persistent horror notes spawn across the viewport, forcing you to confront your procrastination.

### 4. 🗣️ Web Speech Synthesis (TTS Voice Narration)
- Toggle real-time audio narration anytime.
- Pet monologues are dynamically voiced through customized pitch and rate modulation—from bubbly chirps to eerie, distorted, gravelly depths.

### 5. 🔮 The Omen Board (Hackathon Demo Controls)
Built specifically for live hackathon presentations and testing, allowing judges and developers to instantly time-travel:
- **Blessed streak**: Fast-forwards to multi-day perfect consistency (Ascended state).
- **One skipped day**: Simulates a single missed day (Disgruntled state).
- **Three nights of silence**: Summons immediate Tier-3 Eldritch corruption.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 8.3
- **Styling**: Tailwind CSS v4 + Custom Keyframe Shaders (CRT Scanlines, Chromatic Aberration, Particle Physics, Blood Wipe)
- **Icons**: Lucide React
- **Audio**: Web Speech API (`SpeechSynthesis`)
- **State & Persistence**: Browser `localStorage` with automated calendar day rollover logic
- **Tunneling**: Vite configuration prepped for Ngrok preview sharing

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` / `pnpm` / `yarn`

### Installation & Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/chkao19301/sait-megabyte-hack-2026-be.git
   cd sait-megabyte-hack-2026-be
   ```

2. **Navigate into the frontend project and install dependencies**
   ```bash
   cd gremagotchi
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   > By default, the application runs at `http://localhost:5173/`.

4. **Launch with custom port & host (Optional)**
   ```bash
   npm run dev -- --port 5050 --host 0.0.0.0
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```text
sait-megabyte-hack-2026-be/
├── 2026-10-09 200754.png       # Screenshot 1: Neutral State
├── 2026-10-09 200823.png       # Screenshot 2: Ascended State
├── 2026-10-09 200915.png       # Screenshot 3: Eldritch State
├── README.md                   # Project documentation
└── gremagotchi/                # Main React + Vite web application
    ├── index.html              # HTML entry point
    ├── vite.config.js          # Vite configuration
    ├── package.json            # Dependencies & scripts
    └── src/
        ├── Gremagotchi.jsx     # Core component, state machine & purification flow
        ├── index.css           # Global Tailwind tokens, scanlines & horror shaders
        ├── main.jsx            # React root DOM mount
        ├── assets/             # Character portraits & blood frame assets
        └── data/
            └── inbox.json      # Dynamic habit guilt & psychological horror quotes
```
