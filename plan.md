# ProTempo - Tempo Trainer Implementation Plan

**App Name:** ProTempo - Tempo Trainer
**Version:** V1 MVP
**Status:** ✅ COMPLETE (All 16 prompts implemented)

---

## Overview

Cross-platform mobile app helping golfers improve swing consistency through audio-based tempo training. Built with React Native/Expo, featuring 3-tone tempo sequences for Long Game (3:1 ratio) and Short Game (2:1 ratio).

### Architecture

```
App Layer: Long Game | Short Game | Settings screens
    ↓
UI Components: TempoSelector | PlaybackControls | RepCounter | SessionControls
    ↓
State: Zustand (Settings + Session stores)
    ↓
Core: Playback Service → Tempo Engine (timing) + Audio Manager (expo-av)
    ↓
Storage: AsyncStorage (persisted settings)
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router |
| State | Zustand |
| Audio | expo-av / expo-audio |
| Storage | AsyncStorage |
| Testing | Jest + RNTL + Detox |
| CI/CD | GitHub Actions |

---

## Completed Prompts Summary

| # | Prompt | Key Deliverables |
|---|--------|-----------------|
| 1 | Project Setup | Expo + TypeScript, ESLint/Prettier, Jest, folder structure |
| 2 | Constants & Types | Tempo presets (Long 3:1, Short 2:1), TypeScript interfaces |
| 3 | Tempo Engine | Pure timing functions: calculateToneSequence, generateRepTimings |
| 4 | Navigation Shell | Expo Router tabs, dark mode theme |
| 5 | Audio Manager | expo-av wrapper, preload/play/unload, beep & voice styles |
| 6 | Playback Service | Timing loop with drift compensation, callbacks |
| 7 | Zustand Stores | settingsStore (persistent) + sessionStore (transient) |
| 8 | Storage Layer | AsyncStorage + Zustand persist middleware, hydration |
| 9 | Selection Components | TempoSelector (pill buttons), RepCounter (large display) |
| 10 | Control Components | PlaybackControls (play/pause/stop), SessionControls (delay/mode) |
| 11 | Long Game Screen | Full integration with 3:1 presets |
| 12 | Short Game Screen | TempoScreen shared component, 2:1 presets |
| 13 | Settings Screen | Audio, defaults, display sections, reset to defaults |
| 14 | Background Audio | expo-keep-awake, app lifecycle, audio interruption handling |
| 15 | Onboarding | 3-page swipeable tutorial, first-launch detection |
| 16 | CI/CD | GitHub Actions for unit tests + Detox E2E |

---

## Domain Reference

### Tempo Presets

**Long Game (3:1):** 18/6, 21/7, 24/8, 27/9, 30/10 (default: 24/8)
**Short Game (2:1):** 14/7, 16/8, 18/9, 20/10, 22/11 (default: 18/9)
**Frame rate:** 30fps (30 frames = 1 second)

### Three-Tone System

1. **Tone 1:** Start takeaway (backswing begins)
2. **Tone 2:** Top of backswing (start downswing)
3. **Tone 3:** Impact (ball strike)

---

## File Structure

```
/protempo
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout + hydration
│   ├── onboarding.tsx      # First-launch tutorial
│   └── (tabs)/             # Tab screens
├── components/             # UI components
│   ├── TempoScreen.tsx     # Shared screen component
│   ├── TempoSelector.tsx   # Tempo preset selector
│   ├── PlaybackControls.tsx
│   ├── RepCounter.tsx
│   ├── SessionControls.tsx
│   └── settings/           # Settings components
├── lib/                    # Core logic
│   ├── tempoEngine.ts      # Pure timing calculations
│   ├── audioManager.ts     # Audio playback
│   ├── playbackService.ts  # Orchestration
│   └── storage.ts          # Storage utilities
├── stores/                 # Zustand stores
├── hooks/                  # Custom hooks
├── constants/              # Tempos, defaults, theme
├── types/                  # TypeScript types
├── assets/audio/           # WAV files
├── __tests__/              # Jest tests (592 tests)
└── e2e/                    # Detox E2E tests (30 tests)
```

---

*Implementation complete: January 19, 2026*
