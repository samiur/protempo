# ProTempo - Tempo Trainer Implementation Plan

**App Name:** ProTempo - Tempo Trainer
**Version:** V2 (Post-MVP Features)
**Status:** V1 Complete, V2 Planning

---

## Overview

Cross-platform mobile app helping golfers improve swing consistency through audio-based tempo training. Built with React Native/Expo, featuring 3-tone tempo sequences for Long Game (3:1 ratio) and Short Game (2:1 ratio).

### Architecture (V2 Extended)

```
App Layer: Long Game | Short Game | History | Video | Settings
    ↓
UI Components: TempoSelector | PlaybackControls | VideoPlayer | Analytics
    ↓
State: Zustand (Settings + Session + History + Video stores)
    ↓
Core: Playback Service → Tempo Engine + Audio Manager + Haptic Engine
      Video Service → Camera Capture + Swing Detector + Video Storage
      Music Player → Track Management + Audio Mixing
    ↓
Storage: AsyncStorage (settings, sessions) + FileSystem (videos)
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router |
| State | Zustand |
| Audio | expo-av / expo-audio |
| Video | expo-camera, expo-video |
| Haptics | expo-haptics |
| ML | TensorFlow Lite / Core ML |
| Storage | AsyncStorage + expo-file-system |
| Testing | Jest + RNTL + Detox |
| CI/CD | GitHub Actions |

---

## V1 Completed Prompts (1-16)

| # | Prompt | Status |
|---|--------|--------|
| 1 | Project Setup | ✅ |
| 2 | Constants & Types | ✅ |
| 3 | Tempo Engine | ✅ |
| 4 | Navigation Shell | ✅ |
| 5 | Audio Manager | ✅ |
| 6 | Playback Service | ✅ |
| 7 | Zustand Stores | ✅ |
| 8 | Storage Layer | ✅ |
| 9 | Selection Components | ✅ |
| 10 | Control Components | ✅ |
| 11 | Long Game Screen | ✅ |
| 12 | Short Game Screen | ✅ |
| 13 | Settings Screen | ✅ |
| 14 | Background Audio | ✅ |
| 15 | Onboarding | ✅ |
| 16 | CI/CD | ✅ |

---

## V2 Feature Overview

| Feature | Prompts | Description |
|---------|---------|-------------|
| Haptic Mode | 17-18 | Vibration patterns mirror audio tones |
| Session History | 19-23 | Log sessions, analytics, export |
| Video Analysis | 24-32 | Record swings, ML tempo detection, 10-swing calibration |
| Tempo Tracks | 33-36 | Background music with tempo cues |

---

## Phase 9: Haptic Feedback (Prompts 17-18)

### Prompt 17: Haptic Engine & Settings Store

```text
Implement haptic feedback support for ProTempo. The haptic engine will provide vibration patterns that mirror the audio tones, useful for noisy environments or hearing accessibility.

**Requirements:**

1. Install expo-haptics: `npx expo install expo-haptics`

2. Create `lib/hapticEngine.ts`:
   - Export interface `HapticEngine` with methods:
     - `triggerTone(toneNumber: 1 | 2 | 3): Promise<void>` - trigger haptic for specific tone
     - `setIntensity(intensity: HapticIntensity): void`
     - `isAvailable(): Promise<boolean>` - check device support
   - Export function `createHapticEngine(): HapticEngine`
   - Use expo-haptics:
     - Tone 1 (takeaway): `impactAsync(ImpactFeedbackStyle.Light)`
     - Tone 2 (top): `impactAsync(ImpactFeedbackStyle.Medium)`
     - Tone 3 (impact): `impactAsync(ImpactFeedbackStyle.Heavy)`
   - Map intensity setting to feedback styles

3. Create `types/haptic.ts`:
   - `HapticIntensity = 'light' | 'medium' | 'heavy'`
   - `HapticMode = 'off' | 'haptic' | 'both'` (audio+haptic)

4. Update `stores/settingsStore.ts`:
   - Add `hapticMode: HapticMode` (default: 'off')
   - Add `hapticIntensity: HapticIntensity` (default: 'medium')
   - Update `DEFAULT_SETTINGS` constant

5. Update `constants/defaults.ts`:
   - Add default haptic settings

6. Write tests in `__tests__/lib/hapticEngine.test.ts`:
   - Test triggerTone calls correct expo-haptics method
   - Test intensity mapping
   - Test isAvailable returns boolean
   - Mock expo-haptics module

7. Add mock for expo-haptics in `jest.setup.js`

**Acceptance Criteria:**
- Haptic engine triggers appropriate vibration patterns
- Settings store persists haptic preferences
- All tests pass
- TypeScript compiles without errors
```

### Prompt 18: Haptic Integration & Settings UI

```text
Integrate the haptic engine with the playback service and add haptic settings to the Settings screen.

**Requirements:**

1. Update `lib/playbackService.ts`:
   - Accept optional `hapticEngine` in constructor/factory
   - Accept `hapticMode` setting
   - In the tone callback, if hapticMode is 'haptic' or 'both':
     - Call `hapticEngine.triggerTone(toneNumber)`
   - If hapticMode is 'off' or 'both', play audio (existing behavior)
   - If hapticMode is 'haptic', skip audio playback

2. Update `hooks/usePlayback.ts` (or wherever playback is orchestrated):
   - Initialize haptic engine
   - Pass haptic settings to playback service
   - Re-initialize when haptic settings change

3. Update `app/(tabs)/settings.tsx`:
   - Add new "Haptic Feedback" section after "Audio" section
   - Add toggle row: "Enable Haptics" (maps to hapticMode !== 'off')
   - Add segmented control: "Audio Only" | "Haptic Only" | "Both"
   - Add intensity picker: "Light" | "Medium" | "Heavy"
   - Show "Not available" message if device doesn't support haptics

4. Create `components/settings/HapticSettings.tsx`:
   - Encapsulate haptic-related settings UI
   - Check haptic availability on mount
   - Disable controls if not available

5. Write tests:
   - `__tests__/lib/playbackService.haptic.test.ts`:
     - Test haptic triggers at correct times
     - Test audio-only mode doesn't trigger haptics
     - Test haptic-only mode doesn't play audio
     - Test both mode does both
   - `__tests__/components/settings/HapticSettings.test.tsx`:
     - Test toggle updates store
     - Test mode selection
     - Test intensity selection
     - Test unavailable state

6. Update E2E tests:
   - Add test for haptic settings visibility
   - Verify settings persist

**Acceptance Criteria:**
- Haptics trigger in sync with tones during playback
- Settings UI allows full haptic configuration
- Graceful handling when haptics unavailable
- All tests pass
```

---

## Phase 10: Session History & Analytics (Prompts 19-23)

### Prompt 19: Session Data Model & Storage

```text
Create the data layer for tracking practice sessions. Sessions will be logged automatically during practice and stored locally.

**Requirements:**

1. Create `types/session.ts`:
   ```typescript
   interface PracticeSession {
     id: string // UUID
     startTime: number // Unix timestamp
     endTime: number | null // null if in progress
     mode: 'long' | 'short'
     tempoPreset: TempoPreset
     totalReps: number
     notes: string
     createdAt: number
     updatedAt: number
   }

   interface SessionSummary {
     totalSessions: number
     totalReps: number
     totalDurationMs: number
     mostUsedTempo: TempoPreset | null
     sessionsThisWeek: number
   }
   ```

2. Create `lib/sessionStorage.ts`:
   - `saveSession(session: PracticeSession): Promise<void>`
   - `getSession(id: string): Promise<PracticeSession | null>`
   - `getAllSessions(): Promise<PracticeSession[]>`
   - `getSessionsByDateRange(start: number, end: number): Promise<PracticeSession[]>`
   - `updateSession(id: string, updates: Partial<PracticeSession>): Promise<void>`
   - `deleteSession(id: string): Promise<void>`
   - `getSessionSummary(): Promise<SessionSummary>`
   - Use AsyncStorage with key prefix `protempo:sessions:`
   - Store session index separately for efficient listing

3. Create `lib/sessionUtils.ts`:
   - `generateSessionId(): string` - UUID generation
   - `calculateSessionDuration(session: PracticeSession): number`
   - `formatSessionDate(timestamp: number): string`
   - `groupSessionsByDay(sessions: PracticeSession[]): Map<string, PracticeSession[]>`

4. Write tests in `__tests__/lib/sessionStorage.test.ts`:
   - Test CRUD operations
   - Test date range filtering
   - Test summary calculation
   - Test concurrent access handling
   - Mock AsyncStorage

5. Write tests in `__tests__/lib/sessionUtils.test.ts`:
   - Test ID generation uniqueness
   - Test duration calculation
   - Test date formatting
   - Test grouping logic

**Acceptance Criteria:**
- Session data can be stored and retrieved
- Summary statistics are calculated correctly
- All tests pass
- No data loss on app restart
```

### Prompt 20: Session History Store & Playback Integration

```text
Create a Zustand store for session management and integrate automatic session logging with the playback service.

**Requirements:**

1. Create `stores/sessionHistoryStore.ts`:
   ```typescript
   interface SessionHistoryState {
     currentSession: PracticeSession | null
     sessions: PracticeSession[]
     isLoading: boolean

     // Actions
     startSession(mode: 'long' | 'short', preset: TempoPreset): void
     incrementRep(): void
     endSession(): void
     loadSessions(): Promise<void>
     updateSessionNotes(id: string, notes: string): Promise<void>
     deleteSession(id: string): Promise<void>
     getSessionById(id: string): PracticeSession | undefined
   }
   ```
   - Persist session list to storage on changes
   - Load sessions from storage on hydration

2. Update `lib/playbackService.ts`:
   - Add `onSessionStart` callback option
   - Add `onRepComplete` callback option
   - Add `onSessionEnd` callback option
   - These callbacks will be used to update the session store

3. Update `hooks/usePlayback.ts`:
   - Connect playback callbacks to sessionHistoryStore
   - Start session when playback begins (first rep)
   - Increment rep count on each rep
   - End session when playback stops

4. Update `components/TempoScreen.tsx`:
   - Connect to sessionHistoryStore
   - Pass session callbacks to playback

5. Write tests:
   - `__tests__/stores/sessionHistoryStore.test.ts`:
     - Test session lifecycle (start → reps → end)
     - Test persistence
     - Test loading from storage
     - Test concurrent sessions prevention
   - `__tests__/lib/playbackService.session.test.ts`:
     - Test callbacks fire at correct times
     - Test rep counting accuracy

**Acceptance Criteria:**
- Sessions auto-log during practice
- Rep counts are accurate
- Sessions persist across app restarts
- All tests pass
```

### Prompt 21: History List Screen & Navigation

```text
Create the History screen showing a list of past practice sessions with filtering and sorting.

**Requirements:**

1. Update navigation in `app/(tabs)/_layout.tsx`:
   - Add 4th tab: "History" with clock/history icon
   - Keep tab order: Long Game, Short Game, History, Settings

2. Create `app/(tabs)/history.tsx`:
   - Screen title: "Practice History"
   - Filter chips at top: "All" | "Long Game" | "Short Game"
   - Sort options: "Recent" | "Most Reps" | "Longest"
   - FlatList of session cards
   - Empty state when no sessions
   - Pull-to-refresh

3. Create `components/history/SessionCard.tsx`:
   - Display: date, time, mode icon, tempo preset, duration, rep count
   - Compact card design with dark mode support
   - Tap to navigate to detail view
   - Swipe to delete (optional)

4. Create `components/history/FilterChips.tsx`:
   - Horizontal scrollable chip selector
   - Active state styling
   - Accessible labels

5. Create `components/history/EmptyHistory.tsx`:
   - Friendly illustration or icon
   - "No sessions yet" message
   - "Start practicing" CTA button

6. Write tests:
   - `__tests__/app/history.test.tsx`:
     - Test filter changes update list
     - Test sort changes order
     - Test empty state renders
     - Test pull-to-refresh
   - `__tests__/components/history/SessionCard.test.tsx`:
     - Test displays correct info
     - Test tap handler
   - `__tests__/components/history/FilterChips.test.tsx`:
     - Test selection state
     - Test callback firing

**Acceptance Criteria:**
- History tab visible in navigation
- Sessions display in list with correct info
- Filtering and sorting work
- Empty state shows when no sessions
- All tests pass
```

### Prompt 22: Session Detail View & Notes

```text
Create a detailed view for individual practice sessions with the ability to add notes.

**Requirements:**

1. Create `app/session/[id].tsx` (stack screen):
   - Fetch session by ID from store
   - Show 404-style screen if session not found
   - Header with back button and delete action

2. Create `components/history/SessionDetail.tsx`:
   - Large display of session stats:
     - Date and time (formatted nicely)
     - Mode with icon (Long Game / Short Game)
     - Tempo preset (e.g., "24/8")
     - Duration (formatted: "12 min 34 sec")
     - Total reps
   - Visual tempo indicator showing the ratio

3. Create `components/history/SessionNotes.tsx`:
   - TextInput for notes (multiline)
   - Auto-save on blur with debounce
   - Character count
   - Placeholder: "Add notes about this session..."

4. Add delete confirmation:
   - Alert dialog on delete tap
   - Confirm/Cancel options
   - Navigate back after delete

5. Update `stores/sessionHistoryStore.ts`:
   - Add `currentDetailSession` state for detail view
   - Add `loadSessionDetail(id: string)` action

6. Write tests:
   - `__tests__/app/session/[id].test.tsx`:
     - Test loads correct session
     - Test 404 state
     - Test delete flow
   - `__tests__/components/history/SessionDetail.test.tsx`:
     - Test stat display formatting
   - `__tests__/components/history/SessionNotes.test.tsx`:
     - Test input updates store
     - Test auto-save behavior

**Acceptance Criteria:**
- Tapping session card opens detail view
- All session stats displayed correctly
- Notes can be added and persist
- Delete removes session and navigates back
- All tests pass
```

### Prompt 23: Analytics Dashboard & CSV Export

```text
Create an analytics view showing practice trends and add CSV export functionality.

**Requirements:**

1. Create `components/history/AnalyticsDashboard.tsx`:
   - Summary cards at top:
     - Total sessions (all time)
     - Total reps (all time)
     - Total practice time (formatted)
     - Sessions this week
   - "Most Used Tempo" display
   - Practice streak indicator (consecutive days)

2. Create `components/history/WeeklyChart.tsx`:
   - Simple bar chart showing sessions per day (last 7 days)
   - Use react-native-svg for charting (or simple View-based bars)
   - Day labels (Mon, Tue, etc.)
   - Tap bar to see day's sessions

3. Create `lib/analyticsUtils.ts`:
   - `calculatePracticeStreak(sessions: PracticeSession[]): number`
   - `getSessionsPerDay(sessions: PracticeSession[], days: number): Map<string, number>`
   - `getMostUsedTempo(sessions: PracticeSession[]): TempoPreset | null`
   - `formatDuration(ms: number): string`

4. Create `lib/exportService.ts`:
   - `exportSessionsToCSV(sessions: PracticeSession[]): string`
   - `shareCSV(csvContent: string, filename: string): Promise<void>`
   - CSV columns: Date, Time, Mode, Tempo, Duration (sec), Reps, Notes
   - Use expo-sharing for share sheet

5. Update `app/(tabs)/history.tsx`:
   - Add "Analytics" section above session list (collapsible)
   - Add "Export" button in header
   - Export triggers share sheet with CSV file

6. Install dependencies:
   - `npx expo install expo-sharing expo-file-system`
   - `npm install react-native-svg` (if using for charts)

7. Write tests:
   - `__tests__/lib/analyticsUtils.test.ts`:
     - Test streak calculation
     - Test sessions per day grouping
     - Test most used tempo
   - `__tests__/lib/exportService.test.ts`:
     - Test CSV format correctness
     - Test handles empty sessions
     - Test special characters in notes
   - `__tests__/components/history/AnalyticsDashboard.test.tsx`:
     - Test summary card values
   - `__tests__/components/history/WeeklyChart.test.tsx`:
     - Test bar heights
     - Test day labels

**Acceptance Criteria:**
- Analytics dashboard shows accurate stats
- Weekly chart visualizes practice frequency
- CSV export works and opens share sheet
- All tests pass
```

---

## Phase 11: Video Analysis (Prompts 24-31)

### Prompt 24: Video Data Model & File Storage

```text
Create the data layer for storing and managing swing videos.

**Requirements:**

1. Create `types/video.ts`:
   ```typescript
   interface SwingVideo {
     id: string
     uri: string // file:// path
     thumbnailUri: string | null
     createdAt: number
     duration: number // milliseconds
     fps: number
     width: number
     height: number
     analysis: SwingAnalysis | null
     sessionId: string | null // optional link to practice session
   }

   interface SwingAnalysis {
     takeawayFrame: number
     topFrame: number
     impactFrame: number
     backswingFrames: number // topFrame - takeawayFrame
     downswingFrames: number // impactFrame - topFrame
     ratio: number // backswingFrames / downswingFrames
     confidence: number // 0-1
     manuallyAdjusted: boolean
   }

   interface VideoMetadata {
     duration: number
     fps: number
     width: number
     height: number
   }
   ```

2. Create `lib/videoStorage.ts`:
   - `saveVideo(video: SwingVideo): Promise<void>`
   - `getVideo(id: string): Promise<SwingVideo | null>`
   - `getAllVideos(): Promise<SwingVideo[]>`
   - `deleteVideo(id: string): Promise<void>` - deletes metadata AND file
   - `updateVideoAnalysis(id: string, analysis: SwingAnalysis): Promise<void>`
   - `getVideoStorageSize(): Promise<number>` - total bytes used
   - Store metadata in AsyncStorage, files in documentDirectory

3. Create `lib/videoFileManager.ts`:
   - `saveVideoFile(tempUri: string): Promise<string>` - copy to permanent storage
   - `deleteVideoFile(uri: string): Promise<void>`
   - `generateThumbnail(videoUri: string): Promise<string>` - extract frame
   - `getVideoMetadata(uri: string): Promise<VideoMetadata>`
   - Use expo-file-system and expo-video-thumbnails

4. Create `constants/videoSettings.ts`:
   - `MAX_VIDEO_DURATION = 10000` // 10 seconds
   - `TARGET_FPS = 240` // ideal
   - `MIN_FPS = 60` // minimum acceptable
   - `VIDEO_DIRECTORY = 'videos/'`

5. Install dependencies:
   - `npx expo install expo-file-system expo-video-thumbnails`

6. Write tests:
   - `__tests__/lib/videoStorage.test.ts`:
     - Test CRUD operations
     - Test analysis updates
     - Test storage size calculation
   - `__tests__/lib/videoFileManager.test.ts`:
     - Test file copy
     - Test deletion
     - Mock expo-file-system

**Acceptance Criteria:**
- Video metadata can be stored and retrieved
- Video files managed in document directory
- Thumbnail generation works
- All tests pass
```

### Prompt 25: Camera Capture Hook & Permissions

```text
Create a React hook for capturing high-speed video using the device camera.

**Requirements:**

1. Install dependencies:
   - `npx expo install expo-camera`

2. Create `hooks/useVideoCapture.ts`:
   ```typescript
   interface UseVideoCaptureReturn {
     cameraRef: RefObject<Camera>
     isRecording: boolean
     recordingDuration: number
     actualFps: number
     hasPermission: boolean | null

     requestPermission(): Promise<boolean>
     startRecording(): Promise<void>
     stopRecording(): Promise<{ uri: string; duration: number }>
     getCameraCapabilities(): Promise<CameraCapabilities>
   }

   interface CameraCapabilities {
     maxFps: number
     supportsSlowMotion: boolean
     supportedRatios: string[]
   }
   ```

3. Implementation details:
   - Request camera and microphone permissions
   - Configure for highest available FPS
   - Use back camera by default
   - Track recording duration with timer
   - Limit recording to MAX_VIDEO_DURATION
   - Auto-stop when limit reached

4. Create `lib/cameraUtils.ts`:
   - `getBestVideoQuality(capabilities: CameraCapabilities): VideoQuality`
   - `formatRecordingTime(ms: number): string` // "0:05"

5. Update `app.json`:
   - Add camera usage description for iOS
   - Add camera permission for Android

6. Add mocks in `jest.setup.js`:
   - Mock expo-camera module

7. Write tests:
   - `__tests__/hooks/useVideoCapture.test.ts`:
     - Test permission flow
     - Test recording start/stop
     - Test duration tracking
     - Test auto-stop at limit

**Acceptance Criteria:**
- Hook manages camera permissions
- Recording starts and stops cleanly
- Duration tracked accurately
- Auto-stops at max duration
- All tests pass
```

### Prompt 26: Video Recording Screen

```text
Create the video recording screen for capturing swing videos.

**Requirements:**

1. Update navigation:
   - Add 5th tab: "Video" with video camera icon
   - Tab order: Long Game, Short Game, History, Video, Settings

2. Create `app/(tabs)/video.tsx`:
   - Entry point for video features
   - Two options: "Record New" and "Video Library"
   - Navigate to respective screens

3. Create `app/capture.tsx` (stack screen):
   - Full-screen camera preview
   - Recording indicator (red dot + timer)
   - Record button (large, centered at bottom)
   - Cancel/back button
   - FPS indicator (corner)
   - "Aim camera at your swing" instruction

4. Create `components/video/CameraPreview.tsx`:
   - Wraps expo-camera Camera component
   - Handles aspect ratio
   - Shows grid overlay option

5. Create `components/video/RecordButton.tsx`:
   - Large circular button
   - Idle state: white circle
   - Recording state: red square (stop)
   - Animated pulse when recording
   - Disabled state during processing

6. Create `components/video/RecordingOverlay.tsx`:
   - Red recording dot
   - Timer display
   - FPS badge
   - Semi-transparent background at top

7. Post-recording flow:
   - Show "Saving..." indicator
   - Generate thumbnail
   - Save to video storage
   - Navigate to analysis screen (or library)

8. Write tests:
   - `__tests__/app/capture.test.tsx`:
     - Test permission denied state
     - Test recording flow
     - Test cancel navigation
   - `__tests__/components/video/RecordButton.test.tsx`:
     - Test state changes
     - Test press handlers
   - `__tests__/components/video/RecordingOverlay.test.tsx`:
     - Test timer display

**Acceptance Criteria:**
- Camera preview shows correctly
- Recording starts/stops with button
- Timer counts up during recording
- Video saves after recording
- All tests pass
```

### Prompt 27: Video Player Component & Frame Scrubbing

```text
Create a video player component with frame-by-frame scrubbing for analysis.

**Requirements:**

1. Install dependencies:
   - `npx expo install expo-video` (or use expo-av Video)

2. Create `components/video/VideoPlayer.tsx`:
   ```typescript
   interface VideoPlayerProps {
     uri: string
     fps: number
     onFrameChange?: (frame: number) => void
     markers?: FrameMarker[] // highlighted frames
     initialFrame?: number
   }

   interface FrameMarker {
     frame: number
     color: string
     label: string
   }
   ```

3. Features:
   - Play/pause toggle
   - Playback speed selector: 0.25x, 0.5x, 1x
   - Frame-by-frame controls: |< (prev frame), >| (next frame)
   - Scrubber/slider for seeking
   - Current frame number display
   - Frame markers (colored lines on scrubber)

4. Create `components/video/FrameControls.tsx`:
   - Previous/next frame buttons
   - Current frame / total frames display
   - Playback speed dropdown

5. Create `components/video/VideoScrubber.tsx`:
   - Custom slider with frame markers
   - Tap to seek
   - Drag to scrub
   - Shows thumbnail preview while dragging (stretch goal)

6. Create `hooks/useVideoPlayback.ts`:
   - Manage video playback state
   - Calculate frame from position
   - Handle speed changes
   - Seek to specific frame

7. Write tests:
   - `__tests__/components/video/VideoPlayer.test.tsx`:
     - Test play/pause
     - Test speed changes
     - Test frame navigation
   - `__tests__/components/video/FrameControls.test.tsx`:
     - Test prev/next buttons
     - Test frame display
   - `__tests__/components/video/VideoScrubber.test.tsx`:
     - Test marker rendering
     - Test seek on tap
   - `__tests__/hooks/useVideoPlayback.test.ts`:
     - Test frame calculation
     - Test seek accuracy

**Acceptance Criteria:**
- Video plays at various speeds
- Frame-by-frame navigation works
- Scrubber seeks accurately
- Markers display on scrubber
- All tests pass
```

### Prompt 28: Swing Detector Interface & Mock Implementation

```text
Define the swing detection interface and create a mock implementation for development.

**Requirements:**

1. Create `types/swingDetection.ts`:
   ```typescript
   interface SwingDetectionResult {
     takeawayFrame: number
     topFrame: number
     impactFrame: number
     confidence: number
     processingTimeMs: number
   }

   interface SwingDetector {
     isReady(): boolean
     initialize(): Promise<void>
     detectSwingPhases(videoUri: string, fps: number): Promise<SwingDetectionResult>
     dispose(): void
   }

   interface FrameAnalysis {
     frame: number
     clubHeadPosition: { x: number; y: number } | null
     bodyPose: BodyPose | null
     confidence: number
   }
   ```

2. Create `lib/swingDetector.ts`:
   - Factory function: `createSwingDetector(): SwingDetector`
   - For now, returns mock implementation
   - Interface allows swapping in real ML later

3. Create `lib/mockSwingDetector.ts`:
   - Simulates ML detection with delays
   - Returns plausible frame numbers based on video duration
   - Takeaway at ~10% duration
   - Top at ~60% duration
   - Impact at ~80% duration
   - Random confidence between 0.7-0.95

4. Create `lib/swingAnalysisUtils.ts`:
   - `calculateRatioFromFrames(takeaway, top, impact): number`
   - `compareToTargetTempo(analysis: SwingAnalysis, target: TempoPreset): TempoComparison`
   - `getTempoFeedback(comparison: TempoComparison): string` // "Your tempo is faster than target"
   - `findClosestPreset(ratio: number, mode: 'long' | 'short'): TempoPreset`

5. Write tests:
   - `__tests__/lib/swingDetector.test.ts`:
     - Test initialization
     - Test detection returns valid result
     - Test disposal
   - `__tests__/lib/mockSwingDetector.test.ts`:
     - Test frame numbers are in valid range
     - Test confidence is in range
     - Test processing time simulation
   - `__tests__/lib/swingAnalysisUtils.test.ts`:
     - Test ratio calculation
     - Test tempo comparison
     - Test feedback messages
     - Test closest preset finding

**Acceptance Criteria:**
- SwingDetector interface is well-defined
- Mock implementation works for development
- Analysis utils calculate correctly
- All tests pass
```

### Prompt 29: ML Model Implementation

```text
Implement real swing detection using on-device ML. This prompt focuses on the ML pipeline; the mock can be used as fallback.

**Requirements:**

1. Research and select approach:
   - Option A: TensorFlow Lite with pose detection model
   - Option B: MediaPipe for pose estimation
   - Option C: Custom model trained on golf swings
   - Recommend starting with MediaPipe or TFLite pose detection

2. Install dependencies:
   - `npm install @mediapipe/pose` or equivalent
   - `npx expo install expo-gl` (if needed for ML)

3. Create `lib/mlSwingDetector.ts`:
   - Implements `SwingDetector` interface
   - Load ML model on initialize
   - Extract frames from video at regular intervals
   - Run pose detection on each frame
   - Track club/arm position changes to detect phases:
     - Takeaway: First significant movement
     - Top: Maximum backswing position
     - Impact: Club returns to ball position
   - Return frame numbers with confidence

4. Create `lib/frameExtractor.ts`:
   - `extractFrames(videoUri: string, count: number): Promise<string[]>` - extract N frames as images
   - `extractFrameAt(videoUri: string, timeMs: number): Promise<string>` - single frame
   - Use expo-video-thumbnails or FFmpeg

5. Create `lib/poseAnalyzer.ts`:
   - `analyzePose(imageUri: string): Promise<PoseResult>`
   - Detect key points: shoulders, hips, arms, hands
   - Calculate arm angle relative to body
   - Estimate club position if visible

6. Update `lib/swingDetector.ts`:
   - Use ML detector if available
   - Fall back to mock if ML fails or unavailable
   - Log which detector is being used

7. Write tests:
   - `__tests__/lib/mlSwingDetector.test.ts`:
     - Test initialization with model
     - Test detection with sample frames
     - Test fallback behavior
   - `__tests__/lib/frameExtractor.test.ts`:
     - Test frame extraction
     - Test error handling
   - `__tests__/lib/poseAnalyzer.test.ts`:
     - Test with mock images
     - Test key point detection

**Note:** This prompt may require iteration based on ML performance. Start with a simpler approach (frame differencing) and improve with ML if needed.

**Acceptance Criteria:**
- ML-based detection runs on device
- Falls back gracefully if ML unavailable
- Detection accuracy reasonable for demo
- Processing time < 10 seconds for 5-second video
- All tests pass
```

### Prompt 30: Analysis Results Screen & Manual Adjustment

```text
Create the analysis results screen showing detected tempo with the ability to manually adjust frame markers.

**Requirements:**

1. Create `app/analysis/[id].tsx`:
   - Load video and analysis by ID
   - Show video player with frame markers
   - Display analysis results
   - Allow manual frame adjustment
   - Save button to persist changes

2. Create `components/video/AnalysisOverlay.tsx`:
   - Overlay on video showing:
     - Takeaway marker (green line)
     - Top marker (yellow line)
     - Impact marker (red line)
   - Labels for each marker

3. Create `components/video/AnalysisResults.tsx`:
   - Display detected frames:
     - "Takeaway: Frame 15"
     - "Top: Frame 45"
     - "Impact: Frame 60"
   - Display calculated tempo:
     - "Backswing: 30 frames (1.00s)"
     - "Downswing: 15 frames (0.50s)"
     - "Ratio: 2.0:1"
   - Comparison to target:
     - "vs Target 24/8 (3:1)"
     - Visual indicator (faster/slower/match)

4. Create `components/video/FrameAdjuster.tsx`:
   - Three adjustable frame selectors (takeaway, top, impact)
   - Tap marker on video to select
   - Fine-tune with +/- buttons
   - "Auto Detect" button to re-run ML
   - Live update of ratio as frames change

5. Create `components/video/TempoComparison.tsx`:
   - Visual comparison of detected vs target
   - Show closest matching preset
   - Recommendation text

6. Implement "Analyze" flow:
   - From video library, tap video
   - If not analyzed: show "Analyze" button, run detection
   - If analyzed: show results with option to re-analyze

7. Write tests:
   - `__tests__/app/analysis/[id].test.tsx`:
     - Test loading states
     - Test analysis display
     - Test save flow
   - `__tests__/components/video/AnalysisResults.test.tsx`:
     - Test ratio display
     - Test comparison logic
   - `__tests__/components/video/FrameAdjuster.test.tsx`:
     - Test frame selection
     - Test live ratio update

**Acceptance Criteria:**
- Analysis screen shows detected tempo
- Manual adjustment updates ratio in real-time
- Changes can be saved
- Comparison to target tempo shown
- All tests pass
```

### Prompt 31: Tempo Calibration Flow

```text
Create a calibration flow where users record 10 swings to establish their baseline tempo. This helps users understand their natural timing before training.

**Requirements:**

1. Create `types/calibration.ts`:
   ```typescript
   interface TempoBaseline {
     id: string
     createdAt: number
     updatedAt: number
     mode: 'long' | 'short'
     swingCount: number // target: 10
     isComplete: boolean

     // Aggregate statistics
     averageBackswingFrames: number
     averageDownswingFrames: number
     averageRatio: number
     averageTotalTime: number // milliseconds

     // Consistency metrics
     ratioStdDev: number
     consistencyScore: number // 0-100, higher = more consistent

     // Individual swings
     swings: CalibrationSwing[]

     // Recommendations
     closestPreset: TempoPreset
     comparisonToTour: 'faster' | 'slower' | 'similar'
     percentDifferenceFromTour: number
   }

   interface CalibrationSwing {
     id: string
     videoId: string
     backswingFrames: number
     downswingFrames: number
     ratio: number
     totalFrames: number
     recordedAt: number
     confidence: number
   }

   interface CalibrationProgress {
     currentSwing: number // 1-10
     totalSwings: number // 10
     swingsCompleted: CalibrationSwing[]
     mode: 'long' | 'short'
     startedAt: number
   }
   ```

2. Create `lib/calibrationStorage.ts`:
   - `saveBaseline(baseline: TempoBaseline): Promise<void>`
   - `getBaseline(mode: 'long' | 'short'): Promise<TempoBaseline | null>`
   - `getAllBaselines(): Promise<TempoBaseline[]>`
   - `deleteBaseline(id: string): Promise<void>`
   - `hasCompletedCalibration(mode: 'long' | 'short'): Promise<boolean>`
   - Store in AsyncStorage with key `protempo:calibration:`

3. Create `lib/calibrationStats.ts`:
   - `calculateAverages(swings: CalibrationSwing[]): AggregateStats`
   - `calculateStdDev(values: number[]): number`
   - `calculateConsistencyScore(ratioStdDev: number): number`
   - `findClosestPreset(ratio: number, mode: 'long' | 'short'): TempoPreset`
   - `compareToTourAverage(ratio: number, mode: 'long' | 'short'): TourComparison`
   - `generateRecommendation(baseline: TempoBaseline): string`
   - Tour average reference: Long game 3:1 (24/8), Short game 2:1 (18/9)

4. Create `stores/calibrationStore.ts`:
   ```typescript
   interface CalibrationState {
     isCalibrating: boolean
     progress: CalibrationProgress | null
     currentBaseline: TempoBaseline | null

     // Actions
     startCalibration(mode: 'long' | 'short'): void
     recordSwing(swing: CalibrationSwing): void
     completeCalibration(): Promise<TempoBaseline>
     cancelCalibration(): void
     loadBaseline(mode: 'long' | 'short'): Promise<void>
   }
   ```

5. Create `app/calibrate.tsx` (stack screen):
   - Entry point for calibration flow
   - Mode selection if not passed: "Calibrate Long Game" / "Calibrate Short Game"
   - Shows current baseline if exists with "Recalibrate" option
   - Navigation to calibration recording flow

6. Create `app/calibrate/record.tsx`:
   - Guided recording flow for 10 swings
   - Progress indicator: "Swing 3 of 10"
   - Camera preview (reuse from Prompt 26)
   - Instructions: "Take a full swing at your normal pace"
   - Record button
   - Auto-analyze after each recording
   - Show quick result after analysis
   - "Next Swing" button to continue
   - "Finish Early" option (minimum 5 swings)

7. Create `components/calibration/CalibrationProgress.tsx`:
   - Visual progress bar or dots (1-10)
   - Current swing number
   - Swings completed vs remaining

8. Create `components/calibration/SwingResult.tsx`:
   - Quick result after each swing analysis
   - Shows: ratio, backswing time, downswing time
   - Confidence indicator
   - Checkmark animation on success
   - "Retake" option if confidence low

9. Create `components/calibration/CalibrationSummary.tsx`:
   - Final results after 10 swings
   - Large ratio display with visual
   - Stats breakdown:
     - Average backswing: X.XX seconds
     - Average downswing: X.XX seconds
     - Consistency score: XX%
   - Comparison section:
     - "Your tempo: 2.8:1"
     - "Tour average: 3:1"
     - "You're 7% faster than tour average"
   - Recommendation:
     - "Closest preset: 27/9"
     - "Try practicing with 24/8 to develop tour tempo"
   - "Save & Continue" button
   - "View Details" to see individual swings

10. Create `components/calibration/BaselineCard.tsx`:
    - Display saved baseline on Video tab
    - Shows: ratio, consistency, date
    - Tap to view details or recalibrate

11. Update `app/(tabs)/video.tsx`:
    - Add "Calibrate Tempo" button/card
    - Show existing baseline if available
    - "Not calibrated yet" prompt for new users

12. Write tests:
    - `__tests__/lib/calibrationStorage.test.ts`
    - `__tests__/lib/calibrationStats.test.ts`
    - `__tests__/stores/calibrationStore.test.ts`
    - `__tests__/components/calibration/CalibrationSummary.test.tsx`
    - `__tests__/components/calibration/SwingResult.test.tsx`

**Acceptance Criteria:**
- User can complete 10-swing calibration flow
- Statistics calculated correctly (averages, std dev)
- Consistency score reflects swing-to-swing variation
- Closest preset recommendation is accurate
- Baseline persists across app restarts
- Can recalibrate to update baseline
- All tests pass
```

### Prompt 32: Video Library Screen & E2E Tests

```text
Create the video library screen and comprehensive E2E tests for the video flow.

**Requirements:**

1. Create `app/videos.tsx` (or update `app/(tabs)/video.tsx`):
   - Grid view of recorded videos (thumbnails)
   - List view option
   - Sort by: Date, Analyzed/Not
   - Filter by: Analyzed only, Unanalyzed only
   - Empty state with "Record your first swing" CTA

2. Create `components/video/VideoGrid.tsx`:
   - Grid of video thumbnail cards
   - Analysis badge (checkmark if analyzed)
   - Duration badge
   - Date label
   - Long-press to delete

3. Create `components/video/VideoCard.tsx`:
   - Thumbnail image
   - Overlay with duration
   - Analyzed indicator
   - Tempo badge if analyzed (e.g., "2.8:1")

4. Create `components/video/VideoLibraryHeader.tsx`:
   - Title
   - View toggle (grid/list)
   - Sort/filter dropdown
   - Storage used indicator

5. Video detail flow:
   - Tap video → navigate to analysis screen
   - If not analyzed, prompt to analyze
   - Show analysis if available

6. Storage management:
   - Show total storage used in header
   - Bulk delete option
   - "Delete All" with confirmation

7. Connect to session history:
   - Option to link video to a practice session
   - Show linked session in video detail

8. E2E Tests in `e2e/video.test.ts`:
   - Test video tab navigation
   - Test record flow (mock camera in E2E)
   - Test video appears in library
   - Test analysis screen loads
   - Test manual frame adjustment
   - Test delete video
   - Test storage indicator

9. Update existing E2E tests:
   - Add video tab to navigation tests
   - Verify 5-tab layout

**Acceptance Criteria:**
- Video library shows all recorded videos
- Grid/list views work
- Sort and filter work
- Videos can be deleted
- E2E tests cover full video flow
- All tests pass
```

---

## Phase 12: Tempo Tracks / Background Music (Prompts 33-36)

### Prompt 33: Track Data Model & Constants

```text
Create the data model for tempo tracks (background music with embedded tempo cues).

**Requirements:**

1. Create `types/audioTrack.ts`:
   ```typescript
   interface TempoTrack {
     id: string
     name: string
     artist: string
     genre: TrackGenre
     duration: number // milliseconds
     bpm: number
     tempoPreset: TempoPreset // the tempo it's designed for
     uri: string // bundled asset or remote URL
     isBuiltIn: boolean
   }

   type TrackGenre = 'ambient' | 'electronic' | 'acoustic' | 'jazz' | 'classical'

   interface TrackCategory {
     genre: TrackGenre
     label: string
     tracks: TempoTrack[]
   }
   ```

2. Create `constants/tempoTracks.ts`:
   - Define placeholder tracks (will need actual audio later):
     ```typescript
     const TEMPO_TRACKS: TempoTrack[] = [
       {
         id: 'ambient-24-8',
         name: 'Calm Focus',
         artist: 'ProTempo',
         genre: 'ambient',
         duration: 180000, // 3 min
         bpm: 112, // matches 24/8 timing
         tempoPreset: LONG_GAME_PRESETS[2], // 24/8
         uri: require('@/assets/audio/tracks/ambient-24-8.mp3'),
         isBuiltIn: true,
       },
       // More tracks...
     ]
     ```
   - Group by genre for display
   - Create tracks for common presets (24/8, 21/7, 18/9)

3. Create `lib/trackUtils.ts`:
   - `getTracksForPreset(preset: TempoPreset): TempoTrack[]`
   - `getTracksByGenre(genre: TrackGenre): TempoTrack[]`
   - `findMatchingTracks(bpm: number, tolerance: number): TempoTrack[]`

4. Create placeholder audio files:
   - `assets/audio/tracks/` directory
   - Generate simple placeholder tracks with ffmpeg
   - At least one track per genre

5. Write tests:
   - `__tests__/constants/tempoTracks.test.ts`:
     - Test all tracks have required fields
     - Test grouping functions
   - `__tests__/lib/trackUtils.test.ts`:
     - Test preset matching
     - Test genre filtering

**Acceptance Criteria:**
- Track data model defined
- Placeholder tracks created
- Utility functions work
- All tests pass
```

### Prompt 34: Music Player Engine

```text
Create the music player engine that handles background music playback mixed with tempo cues.

**Requirements:**

1. Create `lib/musicPlayer.ts`:
   ```typescript
   interface MusicPlayer {
     loadTrack(track: TempoTrack): Promise<void>
     play(): Promise<void>
     pause(): void
     stop(): void
     setVolume(volume: number): void // 0-1
     isPlaying(): boolean
     getCurrentPosition(): number
     getDuration(): number
     unload(): void
   }

   function createMusicPlayer(): MusicPlayer
   ```

2. Implementation:
   - Use expo-av Audio for music playback
   - Separate from tempo tone playback (independent audio channels)
   - Loop music continuously
   - Handle audio focus/interruptions
   - Smooth fade in/out on play/pause

3. Create `lib/audioMixer.ts`:
   - Manage volume levels for:
     - Tempo cues (existing)
     - Background music (new)
   - `setCueVolume(volume: number): void`
   - `setMusicVolume(volume: number): void`
   - `getMasterVolume(): number`
   - Duck music volume slightly when cue plays (optional)

4. Update audio configuration:
   - Ensure both audio sources can play simultaneously
   - Handle background audio mode for music
   - Respect silent mode settings

5. Write tests:
   - `__tests__/lib/musicPlayer.test.ts`:
     - Test load/play/pause/stop
     - Test volume control
     - Test loop behavior
     - Mock expo-av
   - `__tests__/lib/audioMixer.test.ts`:
     - Test volume levels
     - Test ducking behavior

**Acceptance Criteria:**
- Music plays in background
- Volume independently controllable
- Music loops seamlessly
- Works with tempo cues simultaneously
- All tests pass
```

### Prompt 35: Track Picker UI & Preview

```text
Create the UI for selecting and previewing tempo tracks.

**Requirements:**

1. Create `components/music/TrackPicker.tsx`:
   - Modal or bottom sheet
   - Grouped by genre (collapsible sections)
   - Each track shows: name, artist, duration, tempo badge
   - Currently selected track highlighted
   - "None" option to disable music

2. Create `components/music/TrackCard.tsx`:
   - Track artwork placeholder (genre icon)
   - Track name and artist
   - Duration formatted
   - Tempo preset badge
   - Play preview button
   - Selection indicator

3. Create `components/music/TrackPreview.tsx`:
   - Mini player for previewing tracks
   - Play/stop toggle
   - 15-second preview
   - Volume indicator
   - Auto-stop when selecting different track

4. Create `hooks/useTrackPreview.ts`:
   - Manage preview playback state
   - Auto-stop after 15 seconds
   - Handle switching between previews

5. Create `components/music/GenreFilter.tsx`:
   - Horizontal chips for genre filtering
   - "All" option
   - Count badge per genre

6. Write tests:
   - `__tests__/components/music/TrackPicker.test.tsx`:
     - Test genre sections render
     - Test selection updates
     - Test "None" option
   - `__tests__/components/music/TrackCard.test.tsx`:
     - Test display info
     - Test preview button
     - Test selection state
   - `__tests__/hooks/useTrackPreview.test.ts`:
     - Test preview start/stop
     - Test auto-stop timer

**Acceptance Criteria:**
- Track picker shows all tracks grouped by genre
- Previews play correctly
- Selection persists
- UI is responsive and accessible
- All tests pass
```

### Prompt 36: Music Integration & Settings

```text
Integrate the music player with the main app and add music settings.

**Requirements:**

1. Update `stores/settingsStore.ts`:
   - Add `musicEnabled: boolean` (default: false)
   - Add `selectedTrackId: string | null` (default: null)
   - Add `musicVolume: number` (default: 0.5)
   - Add `cueVolume: number` (default: 1.0)

2. Update `lib/playbackService.ts`:
   - Accept music player instance
   - Start music when playback starts (if enabled)
   - Stop music when playback stops
   - Sync music with practice session

3. Update tempo screens (`TempoScreen.tsx`):
   - Add music indicator when track selected
   - Tap indicator to open track picker
   - Show current track name

4. Create `components/music/MusicIndicator.tsx`:
   - Small badge showing music status
   - Track name (truncated)
   - Tap to change track
   - Music note icon animation when playing

5. Update `app/(tabs)/settings.tsx`:
   - Add "Music" section:
     - Enable/disable toggle
     - Track selector (opens TrackPicker)
     - Music volume slider
     - Cue volume slider
     - "Cues should be audible over music" tip

6. Create `components/settings/MusicSettings.tsx`:
   - Encapsulate music settings UI
   - Volume sliders with live preview
   - Track display with change button

7. E2E Tests in `e2e/music.test.ts`:
   - Test music settings toggle
   - Test track selection
   - Test volume controls
   - Test music plays during practice
   - Test music stops when practice stops

8. Update onboarding (optional):
   - Add mention of music feature
   - Or add tip on first music enable

**Acceptance Criteria:**
- Music plays during tempo practice when enabled
- Track can be selected from picker
- Volume controls work independently
- Settings persist
- E2E tests pass
- All tests pass
```

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

## File Structure (V2)

```
/protempo
├── app/
│   ├── _layout.tsx
│   ├── onboarding.tsx
│   ├── capture.tsx              # NEW: Video recording
│   ├── videos.tsx               # NEW: Video library
│   ├── calibrate.tsx            # NEW: Calibration entry
│   ├── calibrate/record.tsx     # NEW: 10-swing calibration flow
│   ├── analysis/[id].tsx        # NEW: Video analysis
│   ├── session/[id].tsx         # NEW: Session detail
│   └── (tabs)/
│       ├── index.tsx            # Long Game
│       ├── short-game.tsx       # Short Game
│       ├── history.tsx          # NEW: Session history
│       ├── video.tsx            # NEW: Video tab
│       └── settings.tsx
├── components/
│   ├── TempoScreen.tsx
│   ├── history/                 # NEW
│   │   ├── SessionCard.tsx
│   │   ├── SessionDetail.tsx
│   │   ├── SessionNotes.tsx
│   │   ├── FilterChips.tsx
│   │   ├── AnalyticsDashboard.tsx
│   │   └── WeeklyChart.tsx
│   ├── video/                   # NEW
│   │   ├── CameraPreview.tsx
│   │   ├── RecordButton.tsx
│   │   ├── RecordingOverlay.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── VideoScrubber.tsx
│   │   ├── FrameControls.tsx
│   │   ├── AnalysisOverlay.tsx
│   │   ├── AnalysisResults.tsx
│   │   ├── FrameAdjuster.tsx
│   │   ├── VideoGrid.tsx
│   │   └── VideoCard.tsx
│   ├── calibration/             # NEW
│   │   ├── CalibrationProgress.tsx
│   │   ├── SwingResult.tsx
│   │   ├── CalibrationSummary.tsx
│   │   └── BaselineCard.tsx
│   ├── music/                   # NEW
│   │   ├── TrackPicker.tsx
│   │   ├── TrackCard.tsx
│   │   ├── TrackPreview.tsx
│   │   ├── GenreFilter.tsx
│   │   └── MusicIndicator.tsx
│   └── settings/
│       ├── HapticSettings.tsx   # NEW
│       └── MusicSettings.tsx    # NEW
├── lib/
│   ├── tempoEngine.ts
│   ├── audioManager.ts
│   ├── playbackService.ts
│   ├── storage.ts
│   ├── hapticEngine.ts          # NEW
│   ├── sessionStorage.ts        # NEW
│   ├── sessionUtils.ts          # NEW
│   ├── analyticsUtils.ts        # NEW
│   ├── exportService.ts         # NEW
│   ├── videoStorage.ts          # NEW
│   ├── videoFileManager.ts      # NEW
│   ├── swingDetector.ts         # NEW
│   ├── mockSwingDetector.ts     # NEW
│   ├── mlSwingDetector.ts       # NEW
│   ├── frameExtractor.ts        # NEW
│   ├── poseAnalyzer.ts          # NEW
│   ├── swingAnalysisUtils.ts    # NEW
│   ├── calibrationStorage.ts    # NEW
│   ├── calibrationStats.ts      # NEW
│   ├── musicPlayer.ts           # NEW
│   ├── audioMixer.ts            # NEW
│   └── trackUtils.ts            # NEW
├── stores/
│   ├── settingsStore.ts         # Updated
│   ├── sessionStore.ts
│   ├── sessionHistoryStore.ts   # NEW
│   └── calibrationStore.ts      # NEW
├── hooks/
│   ├── useVideoCapture.ts       # NEW
│   ├── useVideoPlayback.ts      # NEW
│   └── useTrackPreview.ts       # NEW
├── types/
│   ├── session.ts               # NEW
│   ├── video.ts                 # NEW
│   ├── swingDetection.ts        # NEW
│   ├── calibration.ts           # NEW
│   ├── audioTrack.ts            # NEW
│   └── haptic.ts                # NEW
├── constants/
│   ├── tempoTracks.ts           # NEW
│   └── videoSettings.ts         # NEW
├── assets/audio/
│   └── tracks/                  # NEW: Music tracks
└── e2e/
    ├── video.test.ts            # NEW
    └── music.test.ts            # NEW
```

---

*V2 Planning: January 19, 2026*
