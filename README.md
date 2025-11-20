# LazyTask

A minimal task management app built with React Native and Expo, using local storage instead of a database.

## Features

- ✅ Add, complete, and delete tasks
- 📊 View statistics and completion rate
- 🌓 Dark mode support
- 💾 Local storage (AsyncStorage)
- 🎨 Custom Iosevka Term font
- 📱 Cross-platform (iOS, Android, Web)

## Tech Stack

- React Native
- Expo Router
- TypeScript
- AsyncStorage for local persistence
- Ionicons for icons

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android
```

## Project Structure

```
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx      # Main task list screen
│   │   └── two.tsx        # Statistics screen
│   └── _layout.tsx        # Root layout with font loading
├── components/
│   ├── TaskItem.tsx       # Individual task component
│   ├── AddTaskInput.tsx   # Task input component
│   └── Themed.tsx         # Themed components
├── utils/
│   └── storage.ts         # AsyncStorage utilities
└── assets/
    └── fonts/             # Iosevka Term fonts
```

## Storage

All tasks are stored locally using `@react-native-async-storage/async-storage`. No database or backend required!

## License

MIT
