# ProTempo - Tempo Trainer Implementation Plan

**App Name:** ProTempo - Tempo Trainer
**Version:** V1 MVP
**Created:** January 19, 2025

---

## Overview

This document contains a step-by-step implementation plan for building ProTempo, a cross-platform mobile app that helps golfers improve swing consistency through audio-based tempo training. The plan is broken into 15 iterative prompts, each building on the previous work.

### Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                        App Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Long Game   │  │ Short Game  │  │  Settings   │          │
│  │   Screen    │  │   Screen    │  │   Screen    │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                │                  │
│  ┌──────┴────────────────┴────────────────┴──────┐          │
│  │              UI Components                     │          │
│  │  TempoSelector │ PlaybackControls │ RepCounter │          │
│  │  SessionControls                               │          │
│  └──────────────────────┬────────────────────────┘          │
│                         │                                    │
│  ┌──────────────────────┴────────────────────────┐          │
│  │              State Management                  │          │
│  │         Zustand (Settings + Session)          │          │
│  └──────────────────────┬────────────────────────┘          │
│                         │                                    │
├─────────────────────────┼────────────────────────────────────┤
│                    Core Layer                                │
│  ┌──────────────────────┴────────────────────────┐          │
│  │              Playback Service                  │          │
│  │    (Orchestrates tempo timing + audio)        │          │
│  └───────┬─────────────────────────┬─────────────┘          │
│          │                         │                         │
│  ┌───────┴───────┐         ┌───────┴───────┐                │
│  │ Tempo Engine  │         │ Audio Manager │                │
│  │ (Pure timing) │         │  (expo-av)    │                │
│  └───────────────┘         └───────────────┘                │
│                                                              │
│  ┌─────────────────────────────────────────────────┐        │
│  │              Storage Layer                       │        │
│  │            (AsyncStorage)                        │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.73+ with Expo SDK 50+ |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router |
| State | Zustand |
| Audio | expo-av |
| Storage | AsyncStorage |
| Testing | Jest + React Native Testing Library |
| Linting | ESLint + Prettier |

---

## Prompts

Each prompt below is designed to be executed in order. They follow TDD principles: write tests first, then implement.

---

### Prompt 1: Project Setup

**Goal:** Initialize the Expo project with TypeScript, testing, and linting infrastructure.

**Deliverables:**
- Expo project initialized with TypeScript
- ESLint + Prettier configured
- Jest configured for React Native
- Basic folder structure created
- CI-ready test script

```text
Create a new React Native Expo project called "protempo" with the following requirements:

1. **Initialize with Expo:**
   - Use `npx create-expo-app@latest protempo --template expo-template-blank-typescript`
   - Target Expo SDK 50+
   - Ensure TypeScript is in strict mode

2. **Configure ESLint + Prettier:**
   - Install eslint, prettier, and related plugins for React Native/TypeScript
   - Create `.eslintrc.js` with recommended rules for React Native + TypeScript
   - Create `.prettierrc` with: single quotes, no semicolons, 2-space indent, trailing commas
   - Add lint and format scripts to package.json

3. **Configure Jest:**
   - Install jest, @testing-library/react-native, jest-expo
   - Create `jest.config.js` for Expo compatibility
   - Create a simple test file `__tests__/setup.test.ts` that verifies Jest runs
   - Add test script to package.json

4. **Create folder structure:**
   ```
   /protempo
   ├── app/                    # Expo Router screens (create later)
   ├── components/             # React components
   ├── lib/                    # Core business logic
   ├── stores/                 # Zustand stores
   ├── constants/              # Type definitions and constants
   ├── assets/
   │   └── audio/              # Audio files
   ├── __tests__/              # Test files
   └── types/                  # Global TypeScript types
   ```

5. **Create `.editorconfig`** for consistent formatting across editors.

6. **Verify everything works:**
   - `npm run lint` passes
   - `npm test` passes
   - `npm start` launches Expo

Write tests first, then implement. Each file should start with a 2-line ABOUTME comment.
```

---

### Prompt 2: Constants & Types

**Goal:** Define all tempo-related constants and TypeScript types that will be used throughout the app.

**Deliverables:**
- Tempo ratio definitions (Long Game 3:1, Short Game 2:1)
- TypeScript interfaces for all core concepts
- Unit tests for constant calculations

```text
Create the constants and type definitions for ProTempo. This is foundational work that other modules depend on.

1. **Create `constants/tempos.ts`:**
   Define tempo presets based on the PRD:

   **Long Game (3:1 ratio):**
   | Name | Backswing Frames | Downswing Frames | Total Time |
   |------|------------------|------------------|------------|
   | 18/6 | 18 | 6 | 0.80s |
   | 21/7 | 21 | 7 | 0.93s |
   | 24/8 | 24 | 8 | 1.07s |
   | 27/9 | 27 | 9 | 1.20s |
   | 30/10 | 30 | 10 | 1.33s |

   **Short Game (2:1 ratio):**
   | Name | Backswing Frames | Downswing Frames | Total Time |
   |------|------------------|------------------|------------|
   | 14/7 | 14 | 7 | 0.70s |
   | 16/8 | 16 | 8 | 0.80s |
   | 18/9 | 18 | 9 | 0.90s |
   | 20/10 | 20 | 10 | 1.00s |
   | 22/11 | 22 | 11 | 1.10s |

   Frame rate is 30fps. Include helper functions:
   - `framesToMs(frames: number): number` - converts frames to milliseconds
   - `getTotalTime(preset: TempoPreset): number` - returns total time in ms

2. **Create `types/tempo.ts`:**
   ```typescript
   type GameMode = 'longGame' | 'shortGame'
   type ToneStyle = 'beep' | 'voice'

   interface TempoPreset {
     id: string              // e.g., "24/8"
     backswingFrames: number
     downswingFrames: number
     label: string           // Display name
     description: string     // Use case description
   }

   interface SessionState {
     isPlaying: boolean
     repCount: number
     currentPreset: TempoPreset
     delayBetweenReps: number  // in seconds (2-10)
     mode: 'continuous' | 'single'
   }

   interface Settings {
     defaultLongGamePreset: string
     defaultShortGamePreset: string
     toneStyle: ToneStyle
     keepScreenAwake: boolean
     volume: number  // 0-1
   }
   ```

3. **Create `constants/defaults.ts`:**
   - Default long game preset: "24/8"
   - Default short game preset: "18/9"
   - Default delay between reps: 4 seconds
   - Default tone style: "beep"

4. **Write tests in `__tests__/constants/tempos.test.ts`:**
   - Test that all presets have correct ratios (3:1 for long, 2:1 for short)
   - Test framesToMs conversion (24 frames = 800ms at 30fps)
   - Test getTotalTime returns correct values
   - Test that preset IDs are unique

TDD approach: Write the tests first based on the specifications, then implement the constants.
```

---

### Prompt 3: Tempo Engine

**Goal:** Build the pure timing calculation engine that determines when to play each tone.

**Deliverables:**
- Pure functions for calculating tone intervals
- Sequence generator for rep cycles
- Comprehensive unit tests

```text
Create the Tempo Engine - the core timing logic for ProTempo. This should be pure functions with no side effects, making it highly testable.

1. **Create `lib/tempoEngine.ts`:**

   ```typescript
   interface ToneSequence {
     tone1Time: number  // ms - always 0 (start)
     tone2Time: number  // ms - end of backswing
     tone3Time: number  // ms - impact
     totalCycleTime: number  // ms - including delay
   }

   interface TempoEngineConfig {
     preset: TempoPreset
     delayBetweenReps: number  // seconds
   }
   ```

   Implement these functions:

   a. `calculateToneSequence(config: TempoEngineConfig): ToneSequence`
      - Tone 1 is always at 0ms (start takeaway)
      - Tone 2 is at (backswingFrames / 30) * 1000 ms (start downswing)
      - Tone 3 is at tone2Time + (downswingFrames / 30) * 1000 ms (impact)
      - totalCycleTime = tone3Time + (delayBetweenReps * 1000)

   b. `generateRepTimings(sequence: ToneSequence, repCount: number): number[][]`
      - Returns array of [tone1, tone2, tone3] absolute times for each rep
      - Example for 2 reps with 24/8 at 4s delay:
        - Rep 1: [0, 800, 1067]
        - Rep 2: [5067, 5867, 6134]

   c. `getNextToneTime(currentTime: number, sequence: ToneSequence): { toneNumber: 1 | 2 | 3, time: number } | null`
      - Given current time in a cycle, returns the next tone to play
      - Returns null if cycle is complete

2. **Write tests in `__tests__/lib/tempoEngine.test.ts`:**

   Test cases:
   - calculateToneSequence with 24/8 preset returns correct times:
     - tone1Time: 0
     - tone2Time: 800ms (24 frames at 30fps)
     - tone3Time: 1067ms (800 + 267ms for 8 frames)

   - calculateToneSequence with different delays

   - generateRepTimings produces correct absolute times for multiple reps

   - getNextToneTime returns correct next tone at various points in cycle

   - Edge cases: single rep mode, minimum delay (2s), maximum delay (10s)

   - Verify timing precision is within 1ms

3. **Ensure all functions are pure:**
   - No external dependencies
   - Same input always produces same output
   - No mutations of input parameters

Write comprehensive tests first. The tempo engine is critical for the app's credibility - timing must be precise.
```

---

### Prompt 4: Navigation Shell

**Goal:** Set up Expo Router with the tab-based navigation structure.

**Deliverables:**
- Expo Router configured
- Tab navigation with 3 tabs (Long Game, Short Game, Settings)
- Placeholder screens
- Dark mode theming

```text
Set up the navigation structure for ProTempo using Expo Router.

1. **Install Expo Router:**
   - Follow Expo Router installation guide
   - Configure in app.json/app.config.js

2. **Create the app directory structure:**
   ```
   /app
   ├── _layout.tsx          # Root layout
   ├── (tabs)/
   │   ├── _layout.tsx      # Tab navigator layout
   │   ├── index.tsx        # Long Game (default tab)
   │   ├── short-game.tsx   # Short Game
   │   └── settings.tsx     # Settings
   └── onboarding.tsx       # Onboarding screen (shown on first launch)
   ```

3. **Implement `app/_layout.tsx`:**
   - Set up root stack navigator
   - Configure dark mode as default (per PRD)
   - Set status bar style
   - Will later add logic to show onboarding on first launch

4. **Implement `app/(tabs)/_layout.tsx`:**
   - Create bottom tab navigator with 3 tabs
   - Tab icons (use Expo vector icons):
     - Long Game: golf club or swing icon
     - Short Game: flag/hole icon
     - Settings: gear icon
   - Tab labels: "Long Game", "Short Game", "Settings"
   - Active/inactive colors for dark mode

5. **Create placeholder screens:**
   Each screen should render a simple view with:
   - Screen title
   - "Coming soon" placeholder text
   - Proper dark mode styling (dark background, light text)

6. **Configure theming:**
   - Create `constants/theme.ts` with color palette:
     ```typescript
     const colors = {
       background: '#121212',
       surface: '#1E1E1E',
       primary: '#4CAF50',     // Green accent
       text: '#FFFFFF',
       textSecondary: '#B0B0B0',
       border: '#333333',
     }
     ```

7. **Write tests:**
   - Navigation renders without crashing
   - All three tabs are present
   - Tab switching works correctly

Ensure the app launches and you can navigate between all three tabs.
```

---

### Prompt 5: Audio Manager

**Goal:** Create a wrapper around expo-av for loading and playing audio files.

**Deliverables:**
- Audio manager with preloading capability
- Support for beep and voice tone styles
- Low-latency playback
- Integration tests

```text
Create the Audio Manager for ProTempo. This module handles all audio loading and playback using expo-av.

1. **Install expo-av:**
   ```bash
   npx expo install expo-av
   ```

2. **Create placeholder audio files:**
   For now, create simple placeholder files in `assets/audio/`:
   - `tone-beep.wav` (short beep sound - can use any free sound effect)
   - `tone-voice-back.wav` (placeholder - we'll record real ones later)
   - `tone-voice-down.wav`
   - `tone-voice-hit.wav`

   Note: Use royalty-free sounds for now. These will be replaced with original recordings.

3. **Create `lib/audioManager.ts`:**

   ```typescript
   interface AudioManagerConfig {
     toneStyle: ToneStyle
   }

   interface AudioManager {
     preloadAll(): Promise<void>
     playTone(toneNumber: 1 | 2 | 3): Promise<void>
     setToneStyle(style: ToneStyle): Promise<void>
     setVolume(volume: number): void
     unloadAll(): Promise<void>
     isLoaded(): boolean
   }
   ```

   Implementation requirements:

   a. **Preloading:**
      - Load all audio files into memory on app start
      - Keep Audio.Sound instances ready for instant playback
      - For beep style: load single beep, reuse for all 3 tones
      - For voice style: load 3 separate files (back, down, hit)

   b. **Playback:**
      - playTone(1) plays the "back" cue
      - playTone(2) plays the "down" cue
      - playTone(3) plays the "hit" cue
      - Must handle rapid successive calls (tones can be <300ms apart)
      - Reset sound position before playing to handle overlap

   c. **Configuration:**
      - setToneStyle switches between beep and voice sounds
      - setVolume adjusts playback volume (0-1)

   d. **Cleanup:**
      - unloadAll releases all audio resources

4. **Configure expo-av for low latency:**
   - Use `Audio.setAudioModeAsync` with:
     - `playsInSilentModeIOS: true`
     - `staysActiveInBackground: true` (for later background support)
     - `shouldDuckAndroid: false`

5. **Write tests in `__tests__/lib/audioManager.test.ts`:**
   - preloadAll loads sounds without error
   - playTone plays correct sound for each tone number
   - setToneStyle switches sound set correctly
   - setVolume updates volume
   - unloadAll releases resources
   - isLoaded returns correct state
   - Mock expo-av for unit tests

6. **Create a manual test screen (temporary):**
   Add buttons to the Long Game placeholder to:
   - Preload audio
   - Play each tone individually
   - Test rapid playback

   This helps verify audio works on real devices.

Focus on reliability and low latency. The audio system is critical to the app's value proposition.
```

---

### Prompt 6: Playback Service

**Goal:** Create the service that orchestrates the Tempo Engine and Audio Manager to play tempo sequences.

**Deliverables:**
- Playback service combining timing and audio
- Start/stop/pause functionality
- Rep counting
- Event callbacks for UI updates

```text
Create the Playback Service that orchestrates the Tempo Engine and Audio Manager to play complete tempo sequences.

1. **Create `lib/playbackService.ts`:**

   ```typescript
   interface PlaybackCallbacks {
     onTonePlayed: (toneNumber: 1 | 2 | 3) => void
     onRepComplete: (repCount: number) => void
     onPlaybackStart: () => void
     onPlaybackStop: () => void
   }

   interface PlaybackConfig {
     preset: TempoPreset
     delayBetweenReps: number  // seconds
     mode: 'continuous' | 'single'
     callbacks: PlaybackCallbacks
   }

   interface PlaybackService {
     configure(config: PlaybackConfig): void
     start(): Promise<void>
     stop(): void
     pause(): void
     resume(): void
     isPlaying(): boolean
     getCurrentRepCount(): number
     setPreset(preset: TempoPreset): void
     setDelay(delay: number): void
   }
   ```

2. **Implementation details:**

   a. **Timing mechanism:**
      - Use high-precision timing (not setInterval which drifts)
      - Calculate absolute times for each tone
      - Use requestAnimationFrame or setTimeout with drift compensation
      - Target ±33ms accuracy (1 frame at 30fps)

   b. **Playback loop:**
      ```
      start() {
        1. Calculate tone sequence from preset
        2. Set startTime = performance.now() or Date.now()
        3. Schedule first tone (immediate)
        4. Enter timing loop:
           - Check if next tone time has passed
           - If yes, play tone and invoke callback
           - If all 3 tones played, increment rep count
           - If continuous mode, schedule next cycle
           - If single mode, stop after 1 rep
      }
      ```

   c. **Drift compensation:**
      - Track cumulative drift from expected times
      - Adjust next tone scheduling to compensate
      - Log drift for debugging (should stay under 50ms)

   d. **State management:**
      - Track: isPlaying, isPaused, currentRep, currentToneInRep
      - pause() remembers position in sequence
      - resume() continues from paused position

3. **Write tests in `__tests__/lib/playbackService.test.ts`:**

   - configure() sets up service correctly
   - start() begins playback and fires onPlaybackStart
   - Tones fire at correct times (mock timer tests)
   - onTonePlayed callback fires with correct tone number
   - onRepComplete fires after tone 3
   - Rep counter increments correctly
   - stop() halts playback and fires onPlaybackStop
   - pause/resume works correctly
   - Single mode stops after 1 rep
   - Continuous mode keeps looping
   - setPreset updates timing mid-playback
   - setDelay updates delay mid-playback

4. **Integration test:**
   Create a test that uses real Tempo Engine and mocked Audio Manager:
   - Verify timing accuracy over 5 reps
   - Verify all callbacks fire in correct order

5. **Wire to existing test screen:**
   Update the Long Game placeholder to:
   - Start/stop playback service
   - Display rep count
   - Show which tone is playing

This is the heart of the app. Ensure timing is precise and callbacks are reliable.
```

---

### Prompt 7: Zustand Stores

**Goal:** Set up state management using Zustand for settings and session state.

**Deliverables:**
- Settings store (user preferences)
- Session store (playback state)
- Store tests

```text
Create Zustand stores for ProTempo's state management.

1. **Install Zustand:**
   ```bash
   npm install zustand
   ```

2. **Create `stores/settingsStore.ts`:**

   ```typescript
   interface SettingsState {
     // Preferences
     defaultLongGamePresetId: string
     defaultShortGamePresetId: string
     toneStyle: ToneStyle
     keepScreenAwake: boolean
     volume: number
     delayBetweenReps: number
     hasCompletedOnboarding: boolean

     // Actions
     setDefaultLongGamePreset: (presetId: string) => void
     setDefaultShortGamePreset: (presetId: string) => void
     setToneStyle: (style: ToneStyle) => void
     setKeepScreenAwake: (awake: boolean) => void
     setVolume: (volume: number) => void
     setDelayBetweenReps: (delay: number) => void
     completeOnboarding: () => void
     resetToDefaults: () => void
   }
   ```

   Default values:
   - defaultLongGamePresetId: "24/8"
   - defaultShortGamePresetId: "18/9"
   - toneStyle: "beep"
   - keepScreenAwake: true
   - volume: 1.0
   - delayBetweenReps: 4
   - hasCompletedOnboarding: false

3. **Create `stores/sessionStore.ts`:**

   ```typescript
   interface SessionState {
     // Current session state
     gameMode: GameMode
     currentPresetId: string
     isPlaying: boolean
     isPaused: boolean
     repCount: number
     playbackMode: 'continuous' | 'single'

     // Actions
     setGameMode: (mode: GameMode) => void
     setPreset: (presetId: string) => void
     setPlaying: (playing: boolean) => void
     setPaused: (paused: boolean) => void
     incrementRepCount: () => void
     resetRepCount: () => void
     setPlaybackMode: (mode: 'continuous' | 'single') => void
     resetSession: () => void
   }
   ```

4. **Write tests in `__tests__/stores/`:**

   `settingsStore.test.ts`:
   - Initial state has correct defaults
   - Each setter updates state correctly
   - resetToDefaults restores all defaults
   - State changes are reflected immediately

   `sessionStore.test.ts`:
   - Initial state is correct
   - setPlaying/setPaused update correctly
   - incrementRepCount increases count by 1
   - resetRepCount sets count to 0
   - resetSession clears all session state

5. **Create store hooks:**
   Export typed hooks for easy component usage:
   ```typescript
   export const useSettings = () => useSettingsStore()
   export const useSession = () => useSessionStore()
   ```

6. **Consider devtools:**
   - Add Zustand devtools middleware for debugging (optional for dev builds)

Keep stores simple and focused. Settings store is for persistent preferences, Session store is for transient playback state.
```

---

### Prompt 8: Storage Layer

**Goal:** Add AsyncStorage persistence to the settings store.

**Deliverables:**
- AsyncStorage integration with Zustand
- Automatic save/load of settings
- Storage tests

```text
Add persistence to the settings store using AsyncStorage.

1. **Install AsyncStorage:**
   ```bash
   npx expo install @react-native-async-storage/async-storage
   ```

2. **Create `lib/storage.ts`:**

   ```typescript
   const STORAGE_KEYS = {
     settings: 'protempo:settings',
   } as const

   interface Storage {
     saveSettings(settings: Partial<SettingsState>): Promise<void>
     loadSettings(): Promise<Partial<SettingsState> | null>
     clearAll(): Promise<void>
   }
   ```

   Implementation:
   - Use JSON.stringify/parse for serialization
   - Handle errors gracefully (log but don't crash)
   - Validate loaded data before returning

3. **Integrate with Zustand using persist middleware:**

   Update `stores/settingsStore.ts`:
   ```typescript
   import { persist, createJSONStorage } from 'zustand/middleware'
   import AsyncStorage from '@react-native-async-storage/async-storage'

   export const useSettingsStore = create<SettingsState>()(
     persist(
       (set) => ({
         // ... state and actions
       }),
       {
         name: 'protempo:settings',
         storage: createJSONStorage(() => AsyncStorage),
         partialize: (state) => ({
           // Only persist these fields:
           defaultLongGamePresetId: state.defaultLongGamePresetId,
           defaultShortGamePresetId: state.defaultShortGamePresetId,
           toneStyle: state.toneStyle,
           keepScreenAwake: state.keepScreenAwake,
           volume: state.volume,
           delayBetweenReps: state.delayBetweenReps,
           hasCompletedOnboarding: state.hasCompletedOnboarding,
         }),
       }
     )
   )
   ```

4. **Handle hydration:**
   - Add a `_hasHydrated` flag to track when storage loads
   - Components can wait for hydration before rendering sensitive UI

   ```typescript
   interface SettingsState {
     // ... existing
     _hasHydrated: boolean
     setHasHydrated: (hydrated: boolean) => void
   }
   ```

5. **Write tests in `__tests__/lib/storage.test.ts`:**
   - saveSettings writes to AsyncStorage
   - loadSettings returns saved data
   - loadSettings returns null when no data
   - Invalid JSON is handled gracefully
   - clearAll removes all data

   Mock AsyncStorage for tests:
   ```typescript
   jest.mock('@react-native-async-storage/async-storage', () =>
     require('@react-native-async-storage/async-storage/jest/async-storage-mock')
   )
   ```

6. **Integration test:**
   - Save settings, "restart" app (reset store), verify settings load
   - Change settings, verify they persist
   - Verify hasCompletedOnboarding persists

Persistence ensures user preferences survive app restarts.
```

---

### Prompt 9: Selection & Display Components

**Goal:** Build the TempoSelector and RepCounter UI components.

**Deliverables:**
- TempoSelector component (pill tabs for tempo selection)
- RepCounter component
- Component tests

```text
Create the TempoSelector and RepCounter components for ProTempo.

1. **Create `components/TempoSelector.tsx`:**

   Props:
   ```typescript
   interface TempoSelectorProps {
     presets: TempoPreset[]
     selectedPresetId: string
     onSelectPreset: (presetId: string) => void
     disabled?: boolean
   }
   ```

   Design:
   - Horizontal scrollable row of "pill" buttons
   - Each pill shows the preset label (e.g., "24/8")
   - Selected pill has highlighted background (primary color)
   - Unselected pills have subtle border
   - Show total time below label (e.g., "1.07s")
   - Accessible: proper a11y labels

   Visual example:
   ```
   [ 18/6 ] [ 21/7 ] [[ 24/8 ]] [ 27/9 ] [ 30/10 ]
     0.80s    0.93s     1.07s     1.20s    1.33s
   ```

2. **Create `components/RepCounter.tsx`:**

   Props:
   ```typescript
   interface RepCounterProps {
     count: number
     isActive: boolean  // Animates when playing
   }
   ```

   Design:
   - Large, centered number display
   - Label "REPS" below the number
   - Subtle pulse animation when isActive is true
   - Dark mode styling

   Visual:
   ```
        12
       REPS
   ```

3. **Style with React Native StyleSheet:**
   - Use constants from theme.ts
   - Responsive sizing (works on various screen sizes)
   - Glanceable at arm's length (large text/touch targets)

4. **Write tests in `__tests__/components/`:**

   `TempoSelector.test.tsx`:
   - Renders all presets
   - Highlights selected preset
   - Calls onSelectPreset when pill tapped
   - Disabled state prevents interaction
   - Horizontal scroll works with many presets

   `RepCounter.test.tsx`:
   - Displays count correctly
   - Shows "REPS" label
   - Animation triggers when isActive
   - Handles zero count
   - Handles large counts (100+)

5. **Create stories/playground (optional):**
   Add a temporary dev screen to view components in isolation:
   - TempoSelector with different states
   - RepCounter with different counts

Focus on making these components "glanceable" - users will look at them while holding a golf club.
```

---

### Prompt 10: Control Components

**Goal:** Build the PlaybackControls and SessionControls components.

**Deliverables:**
- PlaybackControls (play/pause button)
- SessionControls (delay slider, mode toggle)
- Component tests

```text
Create the PlaybackControls and SessionControls components for ProTempo.

1. **Create `components/PlaybackControls.tsx`:**

   Props:
   ```typescript
   interface PlaybackControlsProps {
     isPlaying: boolean
     isPaused: boolean
     onPlay: () => void
     onPause: () => void
     onStop: () => void
     disabled?: boolean
   }
   ```

   Design:
   - Large central play/pause button (easily tappable)
   - Stop button (smaller, to the side or below)
   - Visual states:
     - Idle: Play icon
     - Playing: Pause icon with "active" styling
     - Paused: Play icon with "paused" indicator
   - Minimum touch target: 64x64 points

   Visual:
   ```
        ▶️ / ⏸️
      [  STOP  ]
   ```

2. **Create `components/SessionControls.tsx`:**

   Props:
   ```typescript
   interface SessionControlsProps {
     delaySeconds: number
     onDelayChange: (seconds: number) => void
     playbackMode: 'continuous' | 'single'
     onModeChange: (mode: 'continuous' | 'single') => void
     disabled?: boolean
   }
   ```

   Design:

   a. **Delay slider:**
      - Range: 2-10 seconds
      - Step: 1 second
      - Label: "Delay between reps"
      - Current value displayed: "4s"

   b. **Mode toggle:**
      - Two options: "Continuous" | "Single Rep"
      - Segmented control style
      - Clear indication of selected mode

   Visual:
   ```
   Delay between reps
   2s ────●────── 10s
            4s

   [Continuous] [Single Rep]
   ```

3. **Style considerations:**
   - Slider thumb should be large enough to manipulate
   - Toggle should have clear visual distinction
   - Labels should be readable in outdoor light (high contrast)

4. **Write tests in `__tests__/components/`:**

   `PlaybackControls.test.tsx`:
   - Shows play icon when not playing
   - Shows pause icon when playing
   - onPlay called when play tapped
   - onPause called when pause tapped
   - onStop called when stop tapped
   - Disabled state prevents interaction

   `SessionControls.test.tsx`:
   - Slider shows correct initial value
   - onDelayChange fires with new value
   - Slider respects min/max bounds
   - Mode toggle shows correct selection
   - onModeChange fires when toggled
   - Disabled state prevents interaction

5. **Accessibility:**
   - Proper accessibilityRole for buttons and slider
   - accessibilityLabel for screen readers
   - accessibilityState for selected/disabled

These controls must be usable while practicing - keep them simple and responsive.
```

---

### Prompt 11: Long Game Screen

**Goal:** Assemble all components into the functional Long Game screen.

**Deliverables:**
- Complete Long Game screen
- Integration with playback service
- End-to-end functionality
- Integration tests

```text
Build the complete Long Game screen by assembling all components and connecting to the playback service.

1. **Update `app/(tabs)/index.tsx` (Long Game screen):**

   Structure:
   ```
   ┌─────────────────────────────┐
   │         LONG GAME          │  <- Header
   ├─────────────────────────────┤
   │                             │
   │           12               │  <- RepCounter
   │          REPS              │
   │                             │
   ├─────────────────────────────┤
   │ [18/6][21/7][24/8][27/9]...│  <- TempoSelector
   ├─────────────────────────────┤
   │                             │
   │           ▶️               │  <- PlaybackControls
   │         [STOP]             │
   │                             │
   ├─────────────────────────────┤
   │ Delay: 2s ───●─── 10s      │  <- SessionControls
   │ [Continuous] [Single]       │
   └─────────────────────────────┘
   ```

2. **Connect to stores:**
   ```typescript
   const { defaultLongGamePresetId, toneStyle, volume, delayBetweenReps } = useSettingsStore()
   const { isPlaying, isPaused, repCount, currentPresetId, setPlaying, ... } = useSessionStore()
   ```

3. **Initialize playback service:**
   - Create service instance with useRef
   - Configure with current settings
   - Set up callbacks:
     ```typescript
     callbacks: {
       onTonePlayed: (tone) => { /* optional visual feedback */ },
       onRepComplete: () => sessionStore.incrementRepCount(),
       onPlaybackStart: () => sessionStore.setPlaying(true),
       onPlaybackStop: () => sessionStore.setPlaying(false),
     }
     ```

4. **Handle user interactions:**
   - Play: Start playback service
   - Pause: Pause service, update store
   - Stop: Stop service, reset rep count
   - Tempo change: Update service preset
   - Delay change: Update service delay

5. **Audio preloading:**
   - Preload audio on screen mount
   - Show loading state if needed
   - Handle preload errors gracefully

6. **Visual feedback during playback:**
   - RepCounter pulses on each rep
   - Optional: subtle visual indication of current tone

7. **Screen lifecycle:**
   - Stop playback when navigating away
   - Resume capability when returning (if paused)

8. **Write tests in `__tests__/screens/LongGame.test.tsx`:**

   Unit tests:
   - Screen renders with all components
   - Initial state shows correct default preset
   - Pressing play starts playback
   - Pressing stop resets rep count
   - Changing tempo updates playback

   Integration tests:
   - Full playback cycle completes
   - Rep count increments
   - Settings changes reflect immediately

9. **Manual testing checklist:**
   - [ ] App starts, Long Game screen loads
   - [ ] Audio preloads without error
   - [ ] Press play, hear tones at correct intervals
   - [ ] Rep counter increments
   - [ ] Pause works, resume continues
   - [ ] Stop resets to beginning
   - [ ] Changing tempo changes playback speed
   - [ ] Changing delay affects time between reps
   - [ ] Single rep mode stops after one cycle

This is the first fully functional screen. Test thoroughly on real devices.
```

---

### Prompt 12: Short Game Screen

**Goal:** Create the Short Game screen, mirroring Long Game with 2:1 ratio presets.

**Deliverables:**
- Short Game screen
- Shared logic with Long Game
- Tests

```text
Build the Short Game screen. It mirrors the Long Game screen but uses 2:1 ratio presets.

1. **Refactor for code reuse:**

   Create `components/TempoScreen.tsx` - a shared component:
   ```typescript
   interface TempoScreenProps {
     title: string
     presets: TempoPreset[]
     defaultPresetId: string
     onDefaultPresetChange: (id: string) => void
   }
   ```

   Extract all the logic from Long Game into this shared component:
   - Playback service management
   - State connections
   - UI layout

2. **Update `app/(tabs)/index.tsx` (Long Game):**
   ```typescript
   export default function LongGameScreen() {
     const { defaultLongGamePresetId, setDefaultLongGamePreset } = useSettingsStore()

     return (
       <TempoScreen
         title="Long Game"
         presets={LONG_GAME_PRESETS}
         defaultPresetId={defaultLongGamePresetId}
         onDefaultPresetChange={setDefaultLongGamePreset}
       />
     )
   }
   ```

3. **Create `app/(tabs)/short-game.tsx`:**
   ```typescript
   export default function ShortGameScreen() {
     const { defaultShortGamePresetId, setDefaultShortGamePreset } = useSettingsStore()

     return (
       <TempoScreen
         title="Short Game"
         presets={SHORT_GAME_PRESETS}
         defaultPresetId={defaultShortGamePresetId}
         onDefaultPresetChange={setDefaultShortGamePreset}
       />
     )
   }
   ```

4. **Session state per mode:**
   Update session store to track state per game mode:
   - When switching tabs, preserve rep count per mode
   - Or reset rep count on tab switch (discuss preference)

   Recommendation: Reset on tab switch for simplicity in V1.

5. **Visual differentiation:**
   - Different header color or icon for Short Game
   - Same layout, but user can distinguish at a glance

6. **Write tests:**

   `TempoScreen.test.tsx`:
   - Renders with provided presets
   - Uses provided default preset
   - Calls onDefaultPresetChange when preset changes

   `ShortGame.test.tsx`:
   - Uses SHORT_GAME_PRESETS
   - Shows "Short Game" title
   - Correct default preset (18/9)

7. **Verify both screens work:**
   - Long Game with 3:1 ratios
   - Short Game with 2:1 ratios
   - Switching between tabs works smoothly
   - Audio doesn't overlap when switching mid-playback

The refactoring keeps code DRY while allowing screens to have mode-specific behavior.
```

---

### Prompt 13: Settings Screen

**Goal:** Build the Settings screen with all user preferences.

**Deliverables:**
- Settings screen UI
- All V1 settings functional
- Tests

```text
Build the Settings screen for ProTempo.

1. **Update `app/(tabs)/settings.tsx`:**

   Structure:
   ```
   ┌─────────────────────────────┐
   │         SETTINGS           │
   ├─────────────────────────────┤
   │ AUDIO                       │
   │ ┌─────────────────────────┐ │
   │ │ Tone Style              │ │
   │ │ ○ Beep  ● Voice         │ │
   │ └─────────────────────────┘ │
   │ ┌─────────────────────────┐ │
   │ │ Volume                  │ │
   │ │ 🔈 ──────●────── 🔊     │ │
   │ └─────────────────────────┘ │
   ├─────────────────────────────┤
   │ DEFAULTS                    │
   │ ┌─────────────────────────┐ │
   │ │ Long Game Default       │ │
   │ │ 24/8 (1.07s)         >  │ │
   │ └─────────────────────────┘ │
   │ ┌─────────────────────────┐ │
   │ │ Short Game Default      │ │
   │ │ 18/9 (0.90s)         >  │ │
   │ └─────────────────────────┘ │
   │ ┌─────────────────────────┐ │
   │ │ Delay Between Reps      │ │
   │ │ 4 seconds            >  │ │
   │ └─────────────────────────┘ │
   ├─────────────────────────────┤
   │ DISPLAY                     │
   │ ┌─────────────────────────┐ │
   │ │ Keep Screen Awake       │ │
   │ │                    [ON] │ │
   │ └─────────────────────────┘ │
   ├─────────────────────────────┤
   │ ABOUT                       │
   │ ┌─────────────────────────┐ │
   │ │ Version 1.0.0           │ │
   │ │ ProTempo - Tempo Trainer│ │
   │ └─────────────────────────┘ │
   │ ┌─────────────────────────┐ │
   │ │ Reset to Defaults       │ │
   │ └─────────────────────────┘ │
   └─────────────────────────────┘
   ```

2. **Create settings components:**

   a. `components/settings/SettingsSection.tsx`:
      - Section header with title
      - Groups related settings

   b. `components/settings/SettingsRow.tsx`:
      - Reusable row component
      - Supports: toggle, value display, navigation arrow

   c. `components/settings/PresetPicker.tsx`:
      - Modal or bottom sheet
      - Shows all presets for selection
      - Indicates current selection

3. **Connect to settings store:**
   ```typescript
   const settings = useSettingsStore()
   ```

   Each setting change:
   - Updates store immediately
   - Store persists to AsyncStorage automatically

4. **Implement tone preview:**
   - When changing tone style, play a sample
   - When adjusting volume, play a sample at new volume
   - Helps user confirm audio works

5. **Version info:**
   - Read from app.json or expo-constants
   - Display version number
   - Include build number if available

6. **Reset to defaults:**
   - Confirmation dialog before resetting
   - Calls settingsStore.resetToDefaults()
   - Shows toast/feedback on completion

7. **Write tests:**
   - All settings sections render
   - Tone style toggle works
   - Volume slider updates store
   - Default preset selection works
   - Keep screen awake toggle works
   - Reset to defaults shows confirmation
   - Reset actually resets values

8. **Accessibility:**
   - All controls have proper labels
   - Toggle states announced
   - Navigation works with screen reader

Keep the settings screen clean and organized. Users shouldn't need to visit it often after initial setup.
```

---

### Prompt 14: Background Audio & Lifecycle

**Goal:** Enable audio to continue playing when app is backgrounded or screen is locked.

**Deliverables:**
- Background audio support
- Screen wake lock
- App lifecycle handling
- Tests

```text
Implement background audio support and screen wake lock for ProTempo.

1. **Configure expo-av for background audio:**

   Update `lib/audioManager.ts`:
   ```typescript
   await Audio.setAudioModeAsync({
     playsInSilentModeIOS: true,
     staysActiveInBackground: true,
     shouldDuckAndroid: false,
     playThroughEarpieceAndroid: false,
   })
   ```

2. **Configure app.json for background modes:**
   ```json
   {
     "expo": {
       "ios": {
         "infoPlist": {
           "UIBackgroundModes": ["audio"]
         }
       },
       "android": {
         "permissions": ["android.permission.FOREGROUND_SERVICE"]
       }
     }
   }
   ```

3. **Install and configure expo-keep-awake:**
   ```bash
   npx expo install expo-keep-awake
   ```

   Create `hooks/useKeepAwake.ts`:
   ```typescript
   import { useKeepAwake as expoKeepAwake } from 'expo-keep-awake'
   import { useSettingsStore } from '../stores/settingsStore'

   export function useKeepAwake() {
     const keepScreenAwake = useSettingsStore(s => s.keepScreenAwake)

     // Only activate if setting is enabled
     if (keepScreenAwake) {
       expoKeepAwake()
     }
   }
   ```

4. **Handle app state changes:**

   Create `hooks/useAppState.ts`:
   ```typescript
   import { useEffect, useRef } from 'react'
   import { AppState, AppStateStatus } from 'react-native'

   export function useAppState(onChange: (state: AppStateStatus) => void) {
     const appState = useRef(AppState.currentState)

     useEffect(() => {
       const subscription = AppState.addEventListener('change', (nextState) => {
         if (appState.current !== nextState) {
           onChange(nextState)
           appState.current = nextState
         }
       })

       return () => subscription.remove()
     }, [onChange])
   }
   ```

5. **Update TempoScreen to handle lifecycle:**
   ```typescript
   useAppState((state) => {
     if (state === 'background') {
       // Audio continues via background mode
       // Optionally: log session analytics
     } else if (state === 'active') {
       // App returned to foreground
       // Verify audio is still playing correctly
     }
   })
   ```

6. **Handle interruptions:**
   - Phone call interrupts audio
   - Other app plays audio
   - Use expo-av's audio interruption handling

   ```typescript
   Audio.setAudioModeAsync({
     interruptionModeIOS: InterruptionModeIOS.DoNotMix,
     interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
   })
   ```

7. **Write tests:**
   - useKeepAwake activates when setting is true
   - useKeepAwake doesn't activate when setting is false
   - useAppState fires callback on state change
   - Audio mode is configured correctly
   - Mock AppState for tests

8. **Manual testing on device:**
   - [ ] Start playback, lock screen - tones continue
   - [ ] Start playback, switch to another app - tones continue
   - [ ] Receive phone call - playback pauses/handles gracefully
   - [ ] Return to app after background - state is correct
   - [ ] Keep screen awake setting works
   - [ ] Disable keep screen awake - screen dims normally

Background audio is essential for practice sessions. Test thoroughly on physical devices.
```

---

### Prompt 15: Onboarding Flow

**Goal:** Create the first-launch onboarding tutorial that explains tempo concepts.

**Deliverables:**
- 3-screen onboarding flow
- First-launch detection
- Skip/complete functionality
- Tests

```text
Create the onboarding flow for ProTempo. This educates users about tempo training on first launch.

1. **Create `app/onboarding.tsx`:**

   A 3-screen swipeable tutorial:

   **Screen 1: What is Tempo?**
   ```
   ┌─────────────────────────────┐
   │         [Icon/Graphic]      │
   │                             │
   │    What is Golf Tempo?      │
   │                             │
   │  Tour pros complete their   │
   │  swing in under 1.2 seconds │
   │  with a consistent 3:1      │
   │  backswing to downswing     │
   │  ratio.                     │
   │                             │
   │         ○ ○ ○               │
   │                             │
   │        [Next →]             │
   └─────────────────────────────┘
   ```

   **Screen 2: How It Works**
   ```
   ┌─────────────────────────────┐
   │         [Icon/Graphic]      │
   │                             │
   │      Three Simple Tones     │
   │                             │
   │  🎵 Tone 1: Start takeaway  │
   │  🎵 Tone 2: Start downswing │
   │  🎵 Tone 3: Impact          │
   │                             │
   │  Match your swing to the    │
   │  tones to groove perfect    │
   │  tempo.                     │
   │                             │
   │         ○ ● ○               │
   │                             │
   │   [← Back]    [Next →]      │
   └─────────────────────────────┘
   ```

   **Screen 3: Getting Started**
   ```
   ┌─────────────────────────────┐
   │         [Icon/Graphic]      │
   │                             │
   │      Start with 24/8        │
   │                             │
   │  This is the most common    │
   │  tempo for full swings.     │
   │                             │
   │  Practice 10-15 reps,       │
   │  focusing on matching the   │
   │  tones rather than swing    │
   │  mechanics.                 │
   │                             │
   │         ○ ○ ●               │
   │                             │
   │  [← Back]  [Get Started →]  │
   └─────────────────────────────┘
   ```

2. **Navigation flow:**
   - First launch: Show onboarding before main app
   - Complete onboarding: Mark hasCompletedOnboarding in settings
   - Subsequent launches: Go straight to main app
   - Skip option: Also marks onboarding complete

3. **Update `app/_layout.tsx`:**
   ```typescript
   export default function RootLayout() {
     const hasCompletedOnboarding = useSettingsStore(s => s.hasCompletedOnboarding)
     const hasHydrated = useSettingsStore(s => s._hasHydrated)

     if (!hasHydrated) {
       return <LoadingScreen />  // Wait for storage to load
     }

     return (
       <Stack>
         {!hasCompletedOnboarding ? (
           <Stack.Screen name="onboarding" options={{ headerShown: false }} />
         ) : null}
         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
       </Stack>
     )
   }
   ```

4. **Create swipeable pages:**
   - Use a FlatList with horizontal paging, or
   - Use a library like react-native-pager-view
   - Show dot indicators for current page
   - Support swipe gestures

5. **Completion handling:**
   ```typescript
   const handleComplete = () => {
     settingsStore.completeOnboarding()
     router.replace('/(tabs)')
   }
   ```

6. **Skip functionality:**
   - Small "Skip" link in corner
   - Same effect as completing
   - Confirm they understand what they're skipping? (optional)

7. **Write tests:**
   - All three screens render
   - Can navigate between screens
   - Get Started marks onboarding complete
   - Skip marks onboarding complete
   - Subsequent app launch skips onboarding
   - Dot indicators show correct page

8. **Design notes:**
   - Use simple icons/graphics (can be placeholder in V1)
   - Keep text concise - scannable in seconds
   - Dark mode styling consistent with app
   - Touch targets for navigation buttons

9. **Optional: Demo sound:**
   - Play sample tones on screen 2
   - Helps user understand what to expect

The onboarding should take <30 seconds to complete. Keep it brief and valuable.
```

---

## Final Integration Checklist

After completing all prompts, verify:

### Functionality
- [ ] App launches without errors
- [ ] Onboarding shows on first launch only
- [ ] Long Game screen plays correct 3:1 tempos
- [ ] Short Game screen plays correct 2:1 tempos
- [ ] All tempo presets work correctly
- [ ] Rep counter increments accurately
- [ ] Delay between reps is adjustable
- [ ] Single rep mode stops after one cycle
- [ ] Continuous mode loops indefinitely
- [ ] Settings persist after app restart
- [ ] Background audio works
- [ ] Screen stays awake when enabled
- [ ] Voice and beep tones both work

### Performance
- [ ] Audio timing is accurate (±33ms)
- [ ] No audio glitches or dropouts
- [ ] App is responsive during playback
- [ ] Cold start to playing <3 seconds

### Quality
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Tested on physical iOS device
- [ ] Tested on physical Android device

---

## File Reference

Final project structure after all prompts:

```
/protempo
├── app/
│   ├── _layout.tsx
│   ├── onboarding.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx          # Long Game
│       ├── short-game.tsx
│       └── settings.tsx
├── components/
│   ├── TempoScreen.tsx
│   ├── TempoSelector.tsx
│   ├── PlaybackControls.tsx
│   ├── RepCounter.tsx
│   ├── SessionControls.tsx
│   └── settings/
│       ├── SettingsSection.tsx
│       ├── SettingsRow.tsx
│       └── PresetPicker.tsx
├── lib/
│   ├── tempoEngine.ts
│   ├── audioManager.ts
│   ├── playbackService.ts
│   └── storage.ts
├── stores/
│   ├── settingsStore.ts
│   └── sessionStore.ts
├── hooks/
│   ├── useKeepAwake.ts
│   └── useAppState.ts
├── constants/
│   ├── tempos.ts
│   ├── defaults.ts
│   └── theme.ts
├── types/
│   └── tempo.ts
├── assets/
│   └── audio/
│       ├── tone-beep.wav
│       ├── tone-voice-back.wav
│       ├── tone-voice-down.wav
│       └── tone-voice-hit.wav
├── __tests__/
│   ├── constants/
│   ├── lib/
│   ├── stores/
│   ├── components/
│   └── screens/
├── app.json
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
├── .prettierrc
└── .editorconfig
```

---

*Plan created: January 19, 2025*
*Last updated: January 19, 2025*
