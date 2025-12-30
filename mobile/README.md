# Amal Mobile

React Native mobile application for drug addiction support in Algeria.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.74+ | Mobile framework |
| Expo | SDK 52 | Development platform |
| TypeScript | 5.3+ | Type safety |
| React Navigation | 7.x | Navigation |
| Zustand | 4.4+ | State management |
| AsyncStorage | 1.23+ | Local persistence |

## Prerequisites

- Node.js >= 18.0
- npm >= 9.0
- Expo Go app (for testing on physical device)

## Installation

```bash
cd mobile
npm install
```

## Running the App

### Development

```bash
npx expo start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app for physical device

### Physical Device Setup

Update `src/services/api.ts` with your computer's IP:

```typescript
const API_BASE_URL = 'http://YOUR_IP:8000';
```

Find your IP:
- Windows: `ipconfig`
- Mac/Linux: `ifconfig`

## Project Structure

```
mobile/
├── App.tsx                 # Entry point
├── src/
│   ├── components/ui/      # Reusable UI components
│   ├── navigation/         # React Navigation setup
│   ├── screens/            # Screen components
│   ├── services/           # API services
│   ├── store/              # Zustand stores
│   └── types/              # TypeScript types
├── app.json                # Expo configuration
└── package.json            # Dependencies
```

## Features

- AI Chat with backend integration
- Multilingual support (AR, FR, DZ, EN)
- Dark/Light theme
- JWT authentication with AsyncStorage
- Lazy login (works without auth)
- RTL support for Arabic

## Screens

| Screen | Description |
|--------|-------------|
| Home | Landing with quick actions |
| Chat | AI conversation interface |
| Resources | Educational content |
| Settings | Theme, language, account |
| Auth | Login, signup, forgot password |

## API Integration

The app connects to the FastAPI backend:

```typescript
// src/services/api.ts
const API_BASE_URL = 'http://192.168.x.x:8000';

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return response.json();
}
```

## State Management

Zustand stores with AsyncStorage persistence:

- `authStore` - User authentication state
- `chatStore` - Chat messages and history
- `themeStore` - Dark/light mode preference
- `languageStore` - Selected language

## Building for Production

### Android

```bash
npx expo build:android
# or
eas build --platform android
```

### iOS

```bash
npx expo build:ios
# or
eas build --platform ios
```

## License

MIT License
