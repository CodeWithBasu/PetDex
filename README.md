# PetDex - Next Prime Level Desktop Pet Gallery & Creation Studio

[![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-1.0-orange?style=flat-square&logo=bun)](https://bun.sh)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

**PetDex** is a public gallery, interactive Tamagotchi playground, and custom creation studio for Codex-compatible animated desktop pets.

---

## 🌟 Key Features

- **Interactive Pet Playground**: Live sprite viewer with real-time Tamagotchi interaction stats (Happiness, Fullness, Energy), interactive feeding 🍎, playing ⚽, petting ❤️, and 5 environment backdrops.
- **Web Audio API Sound Engine**: Zero external audio asset dependencies synthesized retro chiptune sound FX.
- **Pet Creation Studio**: In-browser spritesheet inspector, frame grid mapper, and one-click Codex-compatible `.zip` package exporter.
- **Advanced Search & Filtering**: Filter by Vibe categories (`cozy`, `cyberpunk`, `playful`, `magical`, `chill`), state capabilities, and local storage favorite bookmarks.
- **One-Click Codex Installation**: Copy-paste CLI commands and VS Code configuration generators.
- **Community Submissions**: Submit custom pet packages with automated spritesheet validation.

---

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) (v1.0+) or Node.js (v20+)

### Installation

```bash
# Clone repository
git clone https://github.com/CodeWithBasu/PetDex.git
cd PetDex

# Install dependencies
bun install

# Start local development server
bun dev
```

Open `http://localhost:3000` in your browser.

---

## 🛠️ Project Structure

```text
PetDex/
├── public/
│   ├── brand/          # SVG brand logos & mark
│   ├── pets/           # Approved pet packages (spritesheets & metadata)
│   └── packs/          # Downloadable pet archives & manifest.json
├── src/
│   ├── app/            # Next.js 16 App Router pages & API endpoints
│   ├── components/     # UI components (Playground, Studio, Gallery, Canvas Sprites)
│   ├── lib/            # Utilities (Audio FX, Favorites, Database, Rate Limiting)
│   └── data/           # Generated pet definitions registry
├── scripts/            # Asset pipeline & pack builder scripts
└── drizzle.config.ts   # Drizzle ORM PostgreSQL configuration
```

---

## 📦 Building Pet Packs

To regenerate downloadable `.zip` archives and the `manifest.json`:

```bash
bun run build-packs
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
