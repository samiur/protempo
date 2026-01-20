# ProTempo - Claude Code Instructions

Hi! I'm **Cadence**, the development assistant for ProTempo. Here's what you need to know about this project.

## Project Overview

ProTempo is a cross-platform mobile app that helps golfers improve swing consistency through audio-based tempo training. It plays timed audio cues that guide the golfer's backswing and downswing timing.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native with Expo SDK 54 |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router |
| State | Zustand |
| Audio | expo-audio |
| Video | react-native-vision-camera, expo-video |
| Storage | AsyncStorage + expo-file-system |
| Unit Testing | Jest + React Native Testing Library |
| E2E Testing | Detox |
| Linting | ESLint + Prettier |

## Project Structure

```
/protempo
├── app/                    # Expo Router screens
├── components/             # React components
├── lib/                    # Core business logic
├── stores/                 # Zustand stores
├── constants/              # Type definitions and constants
├── types/                  # Global TypeScript types
├── hooks/                  # Custom React hooks
├── assets/audio/           # Audio files (WAV)
├── __tests__/              # Jest unit/integration tests
├── __mocks__/              # Jest module mocks (expo-audio, expo-av)
├── e2e/                    # Detox E2E tests
├── ios/                    # Native iOS project (after prebuild)
└── android/                # Native Android project (after prebuild)
```

## Key Files

- `plan.md` - Detailed implementation plan with 15 prompts
- `todo.md` - Implementation progress tracker
- `docs/PRD.md` - Product requirements document
- `jest.setup.js` - Global Jest setup with module mocks
- `lib/tempoEngine.ts` - Pure timing calculation functions
- `hooks/useAudioManager.ts` - React hook for audio playback (expo-audio)
- `lib/playbackService.ts` - Orchestrates timing and audio for practice sessions
- `stores/settingsStore.ts` - Zustand store for persistent user preferences (auto-persisted to AsyncStorage)
- `stores/sessionStore.ts` - Zustand store for transient playback state
- `lib/storage.ts` - Storage utilities for direct AsyncStorage access
- `lib/audioManager.ts` - Legacy audio manager (expo-av, kept for backward compatibility)
- `components/TempoSelector.tsx` - Horizontal scrollable tempo preset selector
- `components/RepCounter.tsx` - Large rep count display for practice sessions
- `components/PlaybackControls.tsx` - Play/pause/stop buttons for tempo playback
- `components/SessionControls.tsx` - Delay slider and playback mode toggle
- `components/TempoScreen.tsx` - Shared screen component for both Long Game and Short Game
- `components/settings/SettingsSection.tsx` - Groups related settings with header
- `components/settings/SettingsRow.tsx` - Flexible row supporting toggle, value, navigation, slider, segmented types
- `components/settings/PresetPicker.tsx` - Modal for selecting tempo preset defaults
- `components/settings/DelayPicker.tsx` - Modal for selecting delay between reps
- `app/(tabs)/index.tsx` - Long Game screen (3:1 ratio presets)
- `app/(tabs)/short-game.tsx` - Short Game screen (2:1 ratio presets)
- `app/(tabs)/settings.tsx` - Settings screen with audio, defaults, display, and about sections
- `hooks/useKeepAwake.ts` - Manages screen wake lock based on user settings
- `hooks/useAppState.ts` - Tracks app lifecycle state changes (active, background, inactive)
- `app/onboarding.tsx` - 3-page swipeable tutorial for first-launch users
- `app/_layout.tsx` - Root layout with hydration loading and onboarding redirect
- `types/video.ts` - Type definitions for swing videos, analysis results, and metadata
- `lib/videoStorage.ts` - AsyncStorage CRUD operations for video metadata with index management
- `lib/videoFileManager.ts` - File operations for video storage and thumbnail generation (expo-file-system SDK 54)
- `constants/videoSettings.ts` - Video recording limits, FPS targets, and storage paths
- `hooks/useVideoCapture.ts` - React hook for camera permissions, recording lifecycle, and duration tracking (react-native-vision-camera)
- `lib/cameraUtils.ts` - Camera utility functions including `formatRecordingTime` and `CameraCapabilities` interface

## Development Commands

```bash
npm start           # Start Expo development server
npm run lint        # Run ESLint
npm run lint:fix    # Run ESLint with auto-fix
npm run format      # Format code with Prettier
npm run format:check # Check formatting
npm run typecheck   # Run TypeScript type checking
npm test            # Run Jest tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# E2E Testing (requires native build)
npx expo prebuild   # Generate native iOS/Android projects
npm run e2e:ios     # Build and run E2E tests on iOS simulator
npm run e2e:android # Build and run E2E tests on Android emulator
```

## Code Style

- All files must start with a 2-line `ABOUTME:` comment explaining the file's purpose
- Use single quotes, no semicolons, 2-space indent (enforced by Prettier)
- Follow TDD: write tests first, then implement
- Keep code simple and maintainable over clever

## Implementation Process

This project follows a structured 15-prompt implementation plan. When working on the project:

1. Check `todo.md` for current progress and next tasks
2. Reference `plan.md` for detailed prompt instructions
3. Follow TDD - write tests before implementation
4. Update `todo.md` after completing each prompt

## Domain Knowledge

### Golf Tempo Basics

- **Long Game (3:1 ratio)**: Backswing is 3x longer than downswing
  - Presets: 18/6, 21/7, 24/8, 27/9, 30/10 (frames at 30fps)
- **Short Game (2:1 ratio)**: Backswing is 2x longer than downswing
  - Presets: 14/7, 16/8, 18/9, 20/10, 22/11 (frames at 30fps)
- Frame rate is 30fps, so 30 frames = 1 second

### Three-Tone System

1. **Tone 1**: Start of takeaway (backswing begins)
2. **Tone 2**: Top of backswing (start downswing)
3. **Tone 3**: Impact (ball strike)

## Testing Requirements

- Unit tests for all business logic
- Component tests for UI components
- Integration tests for screen functionality
- All tests must pass before committing
- Target 70% code coverage

## Implementation Notes

### expo-audio Hook

Audio playback uses expo-audio via the `useAudioManager` hook. This hook:
- Auto-loads audio files when mounted
- Provides `playTone`, `setVolume`, and `isLoaded` state
- Manages audio mode configuration for silent mode and background playback
- Requires `seekTo(0)` before replay (expo-audio doesn't auto-reset position)

The playback service accepts a `playTone` callback from the hook rather than managing audio directly.

### Storage Persistence

The `settingsStore` uses Zustand's `persist` middleware with AsyncStorage for automatic persistence. Key points:
- Settings auto-save on every change
- `_hasHydrated` flag tracks when storage has loaded
- Use `useSettingsStore.persist.rehydrate()` to manually trigger rehydration if needed
- Storage key: `protempo:settings`

The `lib/storage.ts` provides standalone utilities for direct AsyncStorage access if needed.

### Jest Mocking

expo-av, expo-audio, expo-keep-awake, react-native-vision-camera, AsyncStorage, and @react-native-community/slider modules have native dependencies that aren't available in Jest. Global mocks are configured in `jest.setup.js`. For tests that need specific mock behavior, define local mocks before importing the module under test.

### Asset Loading

React Native/Metro bundler requires `require()` for asset imports. This is disabled via eslint-disable comments in `audioManager.ts`. Don't convert these to ES6 imports.

### Audio Files

Placeholder audio files are in `assets/audio/`:
- `tone-beep.wav` - Single beep for all tones (beep style)
- `tone-voice-back.wav` - "Back" cue (voice style)
- `tone-voice-down.wav` - "Down" cue (voice style)
- `tone-voice-hit.wav` - "Hit" cue (voice style)

These are simple sine wave tones generated with ffmpeg. Replace with professional recordings before release.

### Background Audio & Screen Wake Lock

The app supports background audio playback and screen wake lock:

**Background Audio:**
- Configured in `useAudioManager` via `setAudioModeAsync`:
  - `playsInSilentMode: true` - plays in iOS silent mode
  - `shouldPlayInBackground: true` - continues when app is backgrounded
  - `interruptionMode: 'doNotMix'` - handles audio interruptions from calls/other apps
- `app.json` includes iOS `UIBackgroundModes: ["audio"]` and Android `FOREGROUND_SERVICE` permission
- **Silent loop technique**: iOS suspends apps when no audio is actively playing. Since tempo tones have gaps between them, a silent audio file (`silence.wav`) loops continuously during playback to keep the audio session alive. Call `activateSession()` when starting playback and `deactivateSession()` when stopping.

**Screen Wake Lock:**
- `hooks/useKeepAwake.ts` manages screen dimming prevention
- Controlled by `keepScreenAwake` setting in `settingsStore`
- Uses `expo-keep-awake` for cross-platform support

**App Lifecycle:**
- `hooks/useAppState.ts` provides callbacks for app state changes
- Available for future enhancements (e.g., analytics, state verification)

### Onboarding Flow

First-launch users see a 3-page swipeable tutorial before accessing the main app:

**Pages:**
1. "What is Golf Tempo?" - Explains 3:1 ratio and timing concepts
2. "Three Simple Tones" - Describes the purpose of each tone
3. "Start with 24/8" - Recommends a starting tempo

**Implementation:**
- `app/_layout.tsx` checks `hasCompletedOnboarding` from settings store
- Shows loading screen while AsyncStorage hydrates (`_hasHydrated` flag)
- Uses `router.replace('/onboarding')` in a deferred useEffect (setTimeout) to redirect after Stack mounts
- `app/onboarding.tsx` uses horizontal FlatList with paging
- Skip button and Get Started both call `completeOnboarding()` and redirect to `/(tabs)`
- State is persisted, so subsequent launches skip onboarding

### E2E Testing with Detox

End-to-end tests verify the app works correctly on real devices/simulators.

**Prerequisites:**
- `brew tap wix/brew && brew install applesimutils` - Required for iOS simulator control
- iOS Simulator with iPhone 16 (or update `.detoxrc.js` for available device)

**Setup & Running:**
```bash
npx expo prebuild         # Generate native iOS/Android projects (first time)
npm run e2e:ios           # Build and run E2E tests (release build)
npm run e2e:test:ios      # Run tests only (if already built)
```

**Test Files (30 tests total):**
- `e2e/onboarding.test.ts` (12 tests) - First-launch flow, navigation, skip/complete, persistence
- `e2e/mainApp.test.ts` (18 tests) - Tab navigation, Long/Short Game screens, Settings, Playback

**Configuration:**
- `.detoxrc.js` - Detox configuration (devices, apps, build commands)
- `e2e/jest.config.js` - Jest configuration for Detox runner
- Uses release builds by default (bundles JS, no Metro needed)

**Key Patterns:**
- Always call `device.launchApp()` BEFORE `device.disableSynchronization()`
- Use `device.disableSynchronization()` to avoid timeouts from background tasks
- Add `await new Promise(resolve => setTimeout(resolve, 3000))` after launch for app to settle
- Use `element(by.text('...')).atIndex(0)` when text appears multiple times (tab + header)
- Use `toExist()` instead of `toBeVisible()` for elements that may be partially off-screen
- Scroll before checking elements at bottom of scrollable views
- Use `device.launchApp({ newInstance: true, delete: true })` to simulate first launch

**TestIDs for components:**
- `onboarding-screen`, `page-indicator-0/1/2` - Onboarding
- `tempo-selector-scroll`, `rep-counter` - Tempo screens
- `playback-controls`, `playback-play-button`, `playback-pause-button`, `playback-stop-button` - Playback
- `session-controls` - Session controls
- `segment-beep`, `segment-voice` - Settings tone style

### CI/CD with GitHub Actions

The project uses GitHub Actions for continuous integration and testing.

**Workflows:**

1. **CI Workflow** (`.github/workflows/ci.yml`)
   - Triggers: Every push and PR to `main`
   - Runs on: Ubuntu (fast, cost-effective)
   - Steps: ESLint, Prettier check, TypeScript check, Jest unit tests
   - Coverage uploaded to Codecov

2. **E2E Workflow** (`.github/workflows/e2e.yml`)
   - Triggers: PRs to `main` (excluding docs-only changes), manual dispatch
   - Runs on: macOS 14 (Apple Silicon, required for iOS simulator)
   - Steps: Build native iOS app, boot simulator, run Detox tests
   - Artifacts: Screenshots and videos uploaded on test failure

**Checking CI Status:**
- View workflow runs at: https://github.com/samiur/protempo/actions
- Status badges in README.md show current build status
- PR checks must pass before merging

**Manually Triggering E2E:**
1. Go to Actions tab on GitHub
2. Select "E2E Tests" workflow
3. Click "Run workflow" dropdown
4. Select branch and click "Run workflow"

**Debugging CI Failures:**
- Click on the failed workflow run to see logs
- Each step's output is expandable
- For E2E failures, download the `detox-artifacts` artifact for screenshots/videos
- The `.detoxrc.js` enables debug logging and captures artifacts only in CI

**Expected CI Times:**
- CI workflow (lint, typecheck, tests): ~2 minutes
- E2E workflow (iOS build + tests): ~15-20 minutes (with caching)

**Caching:**
- npm dependencies cached via `actions/setup-node`
- CocoaPods cached for iOS builds
- Detox build artifacts cached to speed up subsequent runs

**CI Configuration Notes:**
- `.npmrc` with `legacy-peer-deps=true` is required for Expo's complex dependency tree
- The `jest.config.js` excludes `e2e/` and `types/` from coverage to meet thresholds
- Coverage thresholds are set to 70% for all metrics (statements, branches, functions, lines)

### Video Storage (V2 Feature - In Progress)

The video analysis feature stores swing videos and their analysis results:

**Data Model (`types/video.ts`):**
- `SwingVideo` - Video metadata including URI, dimensions, FPS, and optional analysis
- `SwingAnalysis` - Detected swing phases (takeaway, top, impact frames) with ratio calculation
- `VideoMetadata` - Technical video properties (duration, fps, width, height)

**Storage Architecture:**
- Video metadata stored in AsyncStorage with index (`protempo:video:index`)
- Video files stored in document directory (`videos/`)
- Thumbnails stored separately (`thumbnails/`)
- Uses expo-file-system SDK 54 class-based API (File, Directory, Paths)

**Key Files:**
- `lib/videoStorage.ts` - CRUD operations for video metadata
- `lib/videoFileManager.ts` - File operations using SDK 54 classes
- `constants/videoSettings.ts` - Configuration constants

**Jest Mocking:**
The `jest.setup.js` includes mocks for expo-file-system's SDK 54 API:
- `File` class with `uri`, `exists`, `copy()`, `delete()` methods
- `Directory` class with `uri`, `exists`, `create()`, `delete()`, `list()` methods
- `Paths` static object with `document`, `cache`, `bundle` directories

**Storage Keys:**
- `protempo:video:index` - Array of video IDs
- `protempo:video:{id}` - Individual video metadata

### Video Capture (V2 Feature - In Progress)

The `useVideoCapture` hook provides camera recording functionality for capturing golf swing videos using react-native-vision-camera for high-FPS support (120-240fps).

**Hook Interface (`hooks/useVideoCapture.ts`):**
- `cameraRef` - Ref to attach to the VisionCamera Camera component
- `device` - Selected camera device (back camera)
- `format` - Selected camera format optimized for high-FPS recording
- `isRecording` - Whether the camera is currently recording
- `recordingDuration` - Current recording duration in milliseconds
- `actualFps` - FPS being used for recording (from selected format, targets 240fps)
- `hasPermission` - Permission state (true, false, or null if not yet determined)
- `requestPermission()` - Request camera and microphone permissions
- `startRecording()` - Start recording video (callback-based)
- `stopRecording()` - Stop recording and return the video result
- `getCameraCapabilities()` - Get the camera's capabilities

**Features:**
- Uses `useCameraFormat(device, [{ fps: TARGET_FPS }, { videoAspectRatio: 16/9 }])` for high-FPS format selection
- Targets 240fps for smooth frame-by-frame swing analysis
- Tracks recording duration with an interval timer
- Auto-stops recording at `MAX_VIDEO_DURATION` (10 seconds)
- Returns recording result with URI and duration
- Falls back to `MIN_FPS` (60fps) when high-FPS format unavailable

**VisionCamera vs expo-camera:**
- VisionCamera provides explicit FPS control via format selection
- Supports up to 240fps (device-dependent)
- Uses callback-based recording (`onRecordingFinished`, `onRecordingError`)
- Higher FPS modes use lower resolutions (e.g., 240fps @ 720p) - expected behavior

**Camera Utils (`lib/cameraUtils.ts`):**
- `formatRecordingTime(ms)` - Format duration as "M:SS"
- `CameraCapabilities` interface - Describes device camera capabilities (maxFps, supportsSlowMotion, supportedRatios)

**Permissions (app.json via VisionCamera plugin):**
- iOS: Camera and microphone usage descriptions configured via plugin
- Android: Camera and microphone permissions granted via plugin

**Note:** VisionCamera requires native builds (won't work in Expo Go). Use `npx expo prebuild` to generate native projects.
