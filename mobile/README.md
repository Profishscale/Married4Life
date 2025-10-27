# Marriaged4Life Mobile App

React Native mobile app for iOS and Android.

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI installed globally: `npm install -g expo-cli`
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
cd mobile
npm install
```

### Running the App

```bash
# Start the Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/         # App screens
│   │   └── WelcomeScreen.tsx
│   └── types/           # TypeScript types
│       └── navigation.d.ts
├── App.tsx              # Main app entry point
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
└── package.json         # Dependencies
```

## Features

### Current (MVP)
- ✅ Welcome Screen with DreamBuilders branding
- ✅ Navigation setup
- ✅ Beautiful gradient UI

### Coming Soon
- Onboarding flow
- Authentication
- Home dashboard
- AI Coach chat
- Courses browser
- Games library
- Profile management

## Design System

### Colors
- **Navy Blue**: `#0A1F44` (Primary background)
- **Gold**: `#D4AF37` (Accent, buttons)
- **White**: `#FFFFFF` (Text, foreground)
- **Gradient**: `#0A1F44` → `#1a3d6b` (Backgrounds)

### Typography
- Headings: Bold, 42px
- Body: Regular, 16-18px
- Buttons: Bold, 20px

### Components
- Safe area aware
- Gradient backgrounds
- Touch feedback
- Accessible

## Development

### Adding a New Screen

1. Create screen component in `src/screens/`
2. Add to navigation types in `src/types/navigation.d.ts`
3. Add route in `App.tsx`

Example:

```typescript
// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View>
      <Text>Home Screen</Text>
    </View>
  );
}
```

```typescript
// Add to src/types/navigation.d.ts
export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined; // Add this
};
```

```typescript
// Add to App.tsx imports and Stack.Navigator
import HomeScreen from './src/screens/HomeScreen';

// In return statement:
<Stack.Screen name="Home" component={HomeScreen} />
```

## Building for Production

### iOS

```bash
# Install pods (if using native modules)
cd ios
pod install
cd ..

# Build
expo build:ios
```

### Android

```bash
expo build:android
```

## Testing

```bash
npm test
```

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### iOS build fails
```bash
cd ios
pod install
cd ..
```

### Android build fails
Make sure Android SDK is properly configured in Android Studio.

