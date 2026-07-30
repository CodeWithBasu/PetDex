# Product Requirements Document (PRD) - PetDex

**Full Form**: **P**roduct **R**equirements **D**ocument  
**Project Name**: PetDex  
**Repository**: [CodeWithBasu/PetDex](https://github.com/CodeWithBasu/PetDex)  
**Version**: 1.0.0  
**Status**: Approved & Implemented  

---

## 1. Executive Summary

**PetDex** is a next-generation public gallery, interactive Tamagotchi-style desktop playground, and creation studio for Codex-compatible animated desktop pets. It allows developers, pixel artists, and AI enthusiasts to browse approved pet packages, preview multi-state animations, test pet interactions with retro chiptune audio, and build/export custom pet packs.

---

## 2. Product Vision & Core Objectives

### 2.1 Vision
To become the definitive open-source hub for Codex-compatible animated companion pets, enabling seamless community discovery, interaction, and creation.

### 2.2 Core Objectives
- **Discovery**: Provide a rich, fast, glassmorphic gallery for searching and previewing pets.
- **Engagement**: Offer an in-browser interactive Tamagotchi playground with real-time stats and Web Audio synthesized sound effects.
- **Creator Empowerment**: Provide a zero-install Pet Creation Studio for mapping spritesheet frames and generating ready-to-use Codex `.zip` packages.
- **Seamless Distribution**: Provide one-click terminal commands for installing pets locally into Codex (`~/.codex/pets/`).

---

## 3. User Personas

1. **Codex Developers & CLI Power Users**: Want quick, delightful animated pets for their terminal and coding sessions.
2. **Pixel Artists & Designers**: Want an easy platform to upload spritesheets, configure animation states, and share custom pet packs with the community.
3. **Open-Source Contributors**: Want a modern Next.js 16 codebase to contribute new features and pet packages.

---

## 4. Feature Specifications

### 4.1 Pet Gallery & State Inspector
- **Grid & Card Layout**: Highlighting pet avatars, display names, vibes, and state counts.
- **Multi-State Animation Player**: HTML Canvas renderer cycling through states (`idle`, `walk`, `run`, `sleep`, `play`, `eat`, `celebrate`, `drag`).
- **Real-Time Search & Filters**: Multi-tag search (by name, tag, vibe) and vibe categories (`cozy`, `cyberpunk`, `playful`, `magical`, `chill`).
- **Favorites System**: Local storage bookmarking hook with reactive UI tabs.

### 4.2 Interactive Tamagotchi Playground
- **Live Stats Engine**: Happiness, Fullness, and Energy progress meters.
- **Interactive Action Buttons**:
  - **Pet ❤️**: Purr sound + heart particle outburst + happiness increase.
  - **Feed Treat 🍎**: Crunch sound + eating animation + fullness restore.
  - **Play Ball ⚽**: Bounce sound + play animation + energy consumption.
- **Environment Switcher**: 5 backdrop themes (Cozy Desk, Cyberpunk Grid, Mystic Forest, Synthwave Neon, Dark Void).
- **Web Audio API Synthesizer**: Zero-dependency browser audio engine producing chiptune sound effects.

### 4.3 Pet Creation Studio (In-Browser Pack Builder)
- **Drag-and-Drop Upload**: Supports PNG/WEBP spritesheet upload.
- **Frame Grid Mapper**: Configurable frame width, height, start frame, and frame counts per state.
- **Real-Time Preview**: Live sprite preview rendering.
- **Automated Exporter**: Generates `pet.json`, `metadata.json`, and outputs a ready-to-use `.zip` bundle.

### 4.4 One-Click Codex Installation
- Automatically generated terminal installation commands (`mkdir -p ~/.codex/pets/<slug> && unzip <slug>.zip -d ~/.codex/pets/<slug>`).
- Direct ZIP downloads for individual pets and approved megapacks.

---

## 5. Technical Stack & Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Library**: React 19, TypeScript 5.7+
- **Styling**: Tailwind CSS v4, Glassmorphism design tokens, custom brand selection highlight (`::selection { background-color: #5266ea; }`)
- **Package Manager**: npm (v10+) / npx
- **Database & ORM**: Drizzle ORM, Neon Serverless PostgreSQL
- **Authentication**: Clerk Auth (`@clerk/nextjs`)
- **Rate Limiting & Caching**: Upstash Redis (`@upstash/ratelimit`)
- **Storage & Uploads**: UploadThing (`uploadthing`)

---

## 6. Design System & User Experience

- **Primary Color Accent**: PetDex Indigo (`#5266ea`)
- **Selection Highlight**: Custom matching `#5266ea` background with crisp white text.
- **Backdrop Styling**: Glassmorphic panels (`backdrop-filter: blur(18px)`), radial glowing mesh gradients, responsive typography.
- **PWA & Browser Hygiene**: Service Worker (`public/sw.js`) to ensure zero 404 console warnings.

---

## 7. Delivery & Workflow Standard

- **Atomic Commit Workflow**: Every file modification is committed (`git add <file>`, `git commit -m "..."`, `git push origin main`) and verified on GitHub before touching subsequent files.
- **Build Cleanliness**: 100% type-checked and static pre-rendering build verification (`npm run build`).
