# Tichu Scoreboard

![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-16%2B-000000?logo=apple&logoColor=white)
![Android](https://img.shields.io/badge/Android-6.0%2B-3DDC84?logo=android&logoColor=white)

A mobile scorekeeper for the card game **Tichu**. Tracks live game scores, round
history, and a persistent per-player leaderboard.

---

## Features

- Score tracking
- Round history with per-round breakdown of the active game
- Leaderboard sortable by win rate, games played, Tichu %, and more
- Per-player stats screen

---

## Getting Started

**Prerequisites:** Node.js 18+, npm 9+, and **Expo Go** installed on your phone
([App Store](https://apps.apple.com/app/expo-go/id982107779) · [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))

```bash
git clone https://github.com/your-org/tichu-scoreboard.git
cd tichu-scoreboard
npm install
npx expo start
```

Scan the QR code shown in the terminal with Expo Go to open the app on your device.

---

## Development

### Run tests

```bash
npm test                # run all tests once
npm run test:watch      # watch mode
```

### Type checking & linting

```bash
npm run typecheck       # tsc --noEmit
npm run lint            # ESLint on src/ and app/
```

### Storybook

Browse every screen and component in isolation — no device needed.

```bash
npm run storybook       # serves at http://localhost:6006
npm run build-storybook # build static snapshot → storybook-static/
```

---

## Project Structure

```tree
.storybook/                 # Storybook config (webpack5 + react-native-web)
__mocks__/                  # Manual mocks for native modules
app/                        # Expo Router file-based routes
assets/images               # App icons
src/
  data/repositories/        # SQLite repository layer
  domain/                   # Pure logic (scoring, game rules)
  store/                    # Zustand global state
  stories/                  # Storybook fixtures and store decorators
  types/                    # Shared TypeScript interfaces
  ui/
    components/             # Reusable UI components + stories
    screens/                # Full-screen components + stories
app.json                    # Bundled application configuration
package.json                # Application description and dependencies
```

---

## Build & Deploy

Production builds use [EAS Build](https://docs.expo.dev/build/introduction/) — Expo's cloud build
service.

### One-time setup

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Share with friends

#### Option 1 — Expo Go + tunnel (easiest, no build needed)

Ask your friends to install **Expo Go**
([App Store](https://apps.apple.com/app/expo-go/id982107779) ·
[Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)), then start the
dev server with the tunnel flag and share the QR code or printed URL with them:

```bash
npx expo start --tunnel
```

They scan the QR code with Expo Go and the app opens on their device. The `--tunnel` flag routes
traffic through Expo's servers, so friends can connect from anywhere — no shared Wi-Fi needed.
You do need to keep the terminal running while they use it.

#### Option 2 — Android APK (standalone, no Expo Go needed)

Build a standalone APK with EAS and share the file directly:

```bash
eas build --platform android --profile preview
```

EAS prints a download link when the build finishes. Share the APK file directly (e.g. via a
messaging app). Recipients install it by opening the file on their Android device
(Settings → allow installs from unknown sources).

#### Option 3 — iOS via TestFlight (no Expo Go needed)

Apple does not allow APK-style side-loading. The easiest path is
[TestFlight](https://testflight.apple.com), which requires a free Apple Developer account:

```bash
eas build --platform ios --profile preview
eas submit --platform ios   # uploads to App Store Connect → invite testers via TestFlight
```

### Production builds

```bash
eas build --platform android --profile production  # AAB for Google Play
eas build --platform ios --profile production      # IPA for App Store
```

### Submit to stores

```bash
eas submit --platform android
eas submit --platform ios
```

---

## Contributing

Here are some ways you can contribute to this project:

- You can open an issue if you would like to request a feature or report a bug/error.
- If you found a bug, please illustrate it with a minimal reprex
- If you want to contribute on a deeper level, it is a good idea to file an issue first. I will
  be happy to discuss other ways of contribution!
