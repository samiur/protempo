# Tempo Trainer — Product Requirements Document

**Version:** 0.1 (Draft)  
**Author:** Samiur Rahman  
**Last Updated:** January 18, 2025  
**Status:** In Review

---

## Executive Summary

Tempo Trainer is a cross-platform mobile app that helps golfers improve swing consistency through audio-based tempo training. Inspired by the biomechanical research behind Tour Tempo, the app delivers precisely-timed audio cues that guide users to match the 3:1 (full swing) and 2:1 (short game) tempo ratios observed in professional golfers.

**Core value prop:** Simple, effective tempo training that works anywhere—range, simulator, or backyard—for a fraction of competitor pricing.

---

## Problem Statement

Most amateur golfers have inconsistent tempo, typically swinging too slowly (1.5–3.0 seconds total) compared to tour professionals (<1.2 seconds). This kills clubhead speed, disrupts sequencing, and introduces timing errors.

Existing solutions:
- **Tour Tempo App ($25):** Market leader, but dated UX, iOS/Android feature disparity, no modern analytics
- **Golf BPM ($5/mo subscription):** Music-based approach, less precise
- **Generic metronome apps:** Not golf-specific, wrong ratios

**Opportunity:** Build a modern, cross-platform tempo trainer with better UX, future video analysis, and potential launch monitor integration.

---

## Target Users

| Segment | Description | Needs |
|---------|-------------|-------|
| **Primary** | Serious amateurs (10-20 handicap) actively working on their game | Simple tool that produces results without swing thoughts |
| **Secondary** | Low handicaps / scratch players | Tempo maintenance, speed training at faster ratios |
| **Tertiary** | Instructors | Tool to use with students |

---

## V1 Scope (MVP)

### Core Features

#### 1. Tempo Tone Playback

**Long Game Mode (3:1 ratio)**
| Setting | Frames | Total Time | Use Case |
|---------|--------|------------|----------|
| 18/6 | 24 frames | 0.80s | Speed training, aggressive tempo |
| 21/7 | 28 frames | 0.93s | Tour average, athletic swingers |
| 24/8 | 32 frames | 1.07s | Most common starting point |
| 27/9 | 36 frames | 1.20s | Smoother tempo, seniors |
| 30/10 | 40 frames | 1.33s | Deliberate tempo |

**Short Game Mode (2:1 ratio)**
| Setting | Frames | Total Time | Use Case |
|---------|--------|------------|----------|
| 14/7 | 21 frames | 0.70s | Quick chip |
| 16/8 | 24 frames | 0.80s | Standard chip/pitch |
| 18/9 | 27 frames | 0.90s | Longer pitch |
| 20/10 | 30 frames | 1.00s | Bunker, longer pitches |
| 22/11 | 33 frames | 1.10s | Deliberate short game |

**Audio cue structure:**
- **Tone 1:** Start takeaway
- **Tone 2:** Start downswing
- **Tone 3:** Impact

**Audio requirements:**
- Original tones (not sampled from Tour Tempo)
- Clear, distinct sounds that cut through range noise
- Option for voice cues ("Back... Down... Hit")
- Adjustable volume

#### 2. Practice Session Controls

- Play/pause toggle
- Rep counter (counts tone cycles)
- Adjustable delay between reps (2–10 seconds, default 4s)
- Continuous mode vs. single-rep mode
- Session timer (optional)

#### 3. Settings & Preferences

- Default tempo preset (remembered per mode)
- Audio output selection (speaker, headphones, Bluetooth)
- Tone style: Beep vs. Voice
- Keep screen awake during session
- Background audio support (tones continue when screen locks)

#### 4. Onboarding & Education

- First-launch tutorial explaining 3:1 and 2:1 concepts
- Tempo selection guide ("Start here if you're unsure")
- Quick tips per mode

### Platform Requirements

| Requirement | Spec |
|-------------|------|
| iOS | 15.0+ |
| Android | API 26+ (Android 8.0) |
| Framework | React Native + Expo |
| Offline | Fully functional offline |
| Audio latency | <50ms tone precision |

### V1 Non-Goals

- Video capture/analysis
- Wearable companion apps
- Launch monitor integration
- User accounts / cloud sync
- Subscription features
- Analytics / session history

---

## V2 Roadmap

Target: 3–6 months post-V1 launch

### 2.1 Video Capture & Tempo Analysis

**Functionality:**
- Record swing using device camera
- Frame-by-frame analysis to calculate actual tempo ratio
- Display measured backswing/downswing frames and ratio
- Compare measured vs. target tempo
- Save videos to library

**Technical approach:**
- 240fps capture on supported devices (120fps fallback)
- On-device ML for swing phase detection (takeaway → top → impact)
- Manual frame adjustment for edge cases

**Value:** Turns app from "training tool" to "feedback system"

### 2.2 Session History & Analytics

**Functionality:**
- Log practice sessions (date, duration, tempo setting, reps)
- Track tempo setting trends over time
- Session notes (free text)
- Export session data (CSV)

**Value:** Enables tracking improvement, identifying patterns

### 2.3 Haptic Mode

**Functionality:**
- Vibration patterns mirror audio tones
- Use alongside or instead of audio
- Configurable intensity

**Value:** Noisy environments, hearing accessibility, discretion

### 2.4 Tempo Tracks (Background Music)

**Functionality:**
- Curated music tracks with embedded tempo cues
- Multiple genres/vibes
- Adjustable cue volume vs. music volume

**Value:** More enjoyable practice sessions, passive tempo reinforcement

---

## V3+ Considerations (Backlog)

| Feature | Notes |
|---------|-------|
| Apple Watch / WearOS companion | Tones on wrist, phone stays in bag |
| Launch monitor integration | Correlate tempo with shot data (GC2, Garmin, etc.) |
| Binaural / alpha wave tracks | Pre-round mental prep |
| Pro swing reference videos | Licensed content, synced to tempo |
| Social / sharing | Share sessions, compare with friends |
| Instructor mode | Multi-student management |

---

## Technical Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.73+ with Expo SDK 50+ |
| Navigation | Expo Router |
| State | Zustand (lightweight, persisted) |
| Audio | expo-av (primary), react-native-sound (fallback if latency issues) |
| Storage | AsyncStorage (settings), expo-file-system (v2 videos) |
| Video (v2) | expo-camera, expo-video-thumbnails |
| Analytics | PostHog or Amplitude (privacy-friendly) |
| Crash reporting | Sentry |

### Audio Timing Architecture

Critical for app credibility—tones must be frame-accurate.

```
┌─────────────────────────────────────────────────────┐
│                   Tempo Engine                       │
├─────────────────────────────────────────────────────┤
│  Input: ratio (e.g., 24/8), delay between reps      │
│                                                      │
│  1. Preload all tone audio files on app start       │
│  2. Calculate intervals:                            │
│     - Tone 1 → Tone 2: (backswing frames / 30) sec  │
│     - Tone 2 → Tone 3: (downswing frames / 30) sec  │
│  3. Use high-precision timer (setInterval too slow) │
│     - iOS: CADisplayLink or dispatch_after          │
│     - Android: Handler with postDelayed             │
│  4. Trigger preloaded audio at calculated times     │
│                                                      │
│  Output: Three tones at precise intervals           │
└─────────────────────────────────────────────────────┘
```

**Frame timing basis:** 30 fps (industry standard for swing analysis)
- 24/8 = 24 frames backswing = 0.800s, 8 frames downswing = 0.267s

**Latency mitigation:**
- Preload audio buffers on screen mount
- Avoid JavaScript-side timing for actual playback
- Use native audio scheduling where possible (iOS AVAudioEngine, Android AudioTrack)

### Project Structure

```
/tempo-trainer
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── long-game.tsx
│   │   ├── short-game.tsx
│   │   └── settings.tsx
│   ├── onboarding.tsx
│   └── _layout.tsx
├── components/
│   ├── TempoPlayer.tsx     # Core playback component
│   ├── TempoSelector.tsx   # Ratio picker
│   ├── RepCounter.tsx
│   └── SessionControls.tsx
├── lib/
│   ├── tempoEngine.ts      # Audio timing logic
│   ├── audioManager.ts     # Preloading, playback
│   └── storage.ts          # Persisted settings
├── assets/
│   └── audio/
│       ├── tone-beep.wav
│       ├── tone-voice-back.wav
│       ├── tone-voice-down.wav
│       └── tone-voice-hit.wav
└── constants/
    └── tempos.ts           # Ratio definitions
```

---

## UX / Design Principles

1. **One-tap to practice:** User should go from app open → tones playing in <3 seconds
2. **Minimal chrome:** Big, glanceable UI—usable at arm's length while holding a club
3. **No account required:** V1 is fully local, zero friction
4. **Respectful defaults:** 24/8 long game, 18/9 short game—safe starting points
5. **Dark mode default:** Most practice happens outdoors; reduce glare

### Key Screens (V1)

| Screen | Elements |
|--------|----------|
| **Long Game** | Large play/pause button, tempo selector (pill tabs), rep counter, delay slider |
| **Short Game** | Same layout, different tempo options |
| **Settings** | Tone style, default tempos, screen awake toggle, about/legal |
| **Onboarding** | 3-screen tutorial (swipeable), skip option |

---

## Legal & Branding

### Trademark Considerations

- ❌ Cannot use "Tour Tempo" in name, marketing, or App Store listing
- ✅ Can describe as "tempo training" or "swing tempo"
- ✅ Can reference 3:1 and 2:1 ratios (biomechanical facts, not IP)

### Suggested Names

| Name | Domain | App Store availability |
|------|--------|------------------------|
| Tempo Trainer | tempotrainer.golf | Check |
| SwingSync | swingsync.app | Check |
| ProTempo | protempo.golf | Check |
| Tempo Caddy | tempocaddy.com | Check |

**Recommendation:** "Tempo Trainer" — clear, descriptive, SEO-friendly

### Required Original Assets

- [ ] App icon (custom design)
- [ ] Audio tones (original recordings, not sampled)
- [ ] Voice cues (original recordings or TTS)
- [ ] All UI graphics

### App Store Compliance

- Privacy policy required (even for offline app)
- No health claims without disclaimers
- Age rating: 4+ (no objectionable content)

---

## Success Metrics

### V1 Launch Criteria

| Metric | Target |
|--------|--------|
| Crash-free sessions | >99% |
| Audio timing accuracy | ±1 frame (33ms) |
| App Store rating | 4.5+ |
| Cold start → playing | <3 seconds |

### Growth Metrics (Post-Launch)

| Metric | 30-day target | 90-day target |
|--------|---------------|---------------|
| Downloads | 1,000 | 5,000 |
| D7 retention | 30% | 35% |
| Sessions per WAU | 3+ | 4+ |
| App Store rating | 4.3+ | 4.5+ |

### V2 Success Criteria

| Metric | Target |
|--------|--------|
| Video analysis adoption | 40% of WAU |
| Session logging adoption | 50% of WAU |
| Upgrade to paid (if applicable) | 5% of MAU |

---

## Monetization Options

### Recommended: Freemium

| Tier | Features | Price |
|------|----------|-------|
| **Free** | All V1 features (tone playback, all tempos) | $0 |
| **Pro** | Video analysis, session history, haptic mode | $9.99 one-time or $2.99/mo |

**Rationale:** Free tier builds audience and reviews; Pro unlocks V2 features that cost more to build/maintain.

### Alternative: Paid Upfront

- $4.99–$9.99 one-time
- Simpler model, but higher friction
- Tour Tempo charges $24.99—room to undercut

### Not Recommended

- Ads (degrades UX, wrong audience)
- Feature-gated tempos (frustrating)

---

## Timeline Estimate

### V1 MVP

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Setup & architecture | 1 week | Repo, Expo config, navigation, audio POC |
| Core playback | 2 weeks | Tempo engine, audio manager, player UI |
| Settings & polish | 1 week | Preferences, onboarding, dark mode |
| Testing & QA | 1 week | Device testing, timing validation |
| App Store prep | 1 week | Assets, screenshots, descriptions, submission |

**Total: ~6 weeks** (assuming ~10 hrs/week)

### V2

| Phase | Duration |
|-------|----------|
| Video capture | 2–3 weeks |
| Tempo analysis ML | 3–4 weeks |
| Session history | 1–2 weeks |
| Haptic mode | 1 week |

**Total: ~8–10 weeks** (after V1 stabilization)

---

## Open Questions

1. **Pricing strategy** — Free + IAP, or paid upfront?
2. **Name finalization** — Tempo Trainer vs. alternatives?
3. **Voice cue approach** — Record custom, use TTS, or skip for V1?
4. **Beta distribution** — TestFlight/Play Console internal, or public beta?
5. **V2 ML approach** — On-device (Core ML / TFLite) vs. cloud processing?

---

## Appendix

### A. Tour Tempo Ratio Reference

| Frames (30fps) | Ratio | Total Time | Notes |
|----------------|-------|------------|-------|
| 18/6 | 3:1 | 0.80s | Speed training |
| 21/7 | 3:1 | 0.93s | Tour fast |
| 24/8 | 3:1 | 1.07s | Tour average |
| 27/9 | 3:1 | 1.20s | Tour smooth |
| 30/10 | 3:1 | 1.33s | Deliberate |

### B. Competitive Landscape

| App | Price | Platforms | Strengths | Weaknesses |
|-----|-------|-----------|-----------|------------|
| Tour Tempo | $24.99 | iOS, Android | Market leader, trusted, video analysis | Dated UX, expensive |
| Golf BPM | $5/mo | iOS, Android | Music-based, fun | Less precise, subscription |
| Tempo Perfect | Free | iOS | Simple | Not golf-specific |

### C. Resources

- Tour Tempo Book: [Amazon](https://amzn.to/49Gu9in)
- Biomechanics study: Yale Physics/Biomechanics validation
- Expo Audio docs: [expo.dev/audio](https://docs.expo.dev/versions/latest/sdk/audio/)
