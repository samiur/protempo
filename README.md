# ProTempo - Tempo Trainer

A cross-platform mobile app that helps golfers improve swing consistency through audio-based tempo training.

## Overview

ProTempo plays timed audio cues that guide golfers through their swing, helping them develop consistent tempo like the pros. The app supports both full swing (3:1 ratio) and short game (2:1 ratio) tempo training.

## Features

- **Long Game Mode**: 3:1 backswing-to-downswing ratio tempo training
- **Short Game Mode**: 2:1 backswing-to-downswing ratio tempo training
- **Multiple Tempo Presets**: From 18/6 to 30/10 for various swing speeds
- **Rep Counter**: Track your practice reps
- **Continuous or Single Rep Mode**: Practice your way
- **Background Audio**: Keep practicing while screen is locked
- **Dark Mode**: Easy on the eyes during outdoor practice

## Tech Stack

- React Native with Expo SDK 54
- TypeScript (strict mode)
- Expo Router for navigation
- Zustand for state management
- expo-av for audio playback
- Jest + React Native Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Format code
npm run format

# Type check
npm run typecheck
```

## Project Structure

```
/protempo
├── app/                    # Expo Router screens
├── components/             # React components
├── lib/                    # Core business logic
├── stores/                 # Zustand stores
├── constants/              # Constants and configuration
├── types/                  # TypeScript type definitions
├── hooks/                  # Custom React hooks
├── assets/audio/           # Audio files (WAV)
├── __tests__/              # Test files
└── __mocks__/              # Jest module mocks
```

## Documentation

- `plan.md` - Detailed implementation plan
- `todo.md` - Implementation progress tracker
- `docs/PRD.md` - Product requirements document
- `CLAUDE.md` - Development assistant instructions

## License

Private - All rights reserved
