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
| Audio | expo-av |
| Storage | AsyncStorage |
| Testing | Jest + React Native Testing Library |
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
├── __tests__/              # Test files
└── __mocks__/              # Jest module mocks (expo-av, etc.)
```

## Key Files

- `plan.md` - Detailed implementation plan with 15 prompts
- `todo.md` - Implementation progress tracker
- `docs/PRD.md` - Product requirements document
- `jest.setup.js` - Global Jest setup with module mocks
- `lib/tempoEngine.ts` - Pure timing calculation functions
- `lib/audioManager.ts` - Audio playback management (expo-av wrapper)
- `lib/playbackService.ts` - Orchestrates timing and audio for practice sessions

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

### expo-av Mocking

The expo-av module has native dependencies that aren't available in Jest. A global mock is configured in `jest.setup.js`. For tests that need specific mock behavior (like `audioManager.test.ts`), define local mocks before importing the module under test.

### Asset Loading

React Native/Metro bundler requires `require()` for asset imports. This is disabled via eslint-disable comments in `audioManager.ts`. Don't convert these to ES6 imports.

### Audio Files

Placeholder audio files are in `assets/audio/`:
- `tone-beep.wav` - Single beep for all tones (beep style)
- `tone-voice-back.wav` - "Back" cue (voice style)
- `tone-voice-down.wav` - "Down" cue (voice style)
- `tone-voice-hit.wav` - "Hit" cue (voice style)

These are simple sine wave tones generated with ffmpeg. Replace with professional recordings before release.
