# CineCircle Mobile (AD Evaluation — Krish)

## Key Mobile Engineering Features
1. **5-Tab Touch-First Navigation (`RootNavigator.js`):** Feed, Instant Debounced Search, Offline-Resilient Watchlist, Friend Squads & Blend, Profile SQL Stats, and Live LAN Settings.
2. **Offline Watchlist Cache & Sync Queue (`storage.js` & `offlineQueue.js`):** Automatically caches the user's watchlist in `AsyncStorage` and queues `+1 Episode` logs when offline, flushing them to PostgreSQL on reconnect.
3. **Native OTT Deep-Linking (`MediaDetailModal.js`):** Uses React Native `Linking.openURL()` to launch Netflix, Prime Video, or Hotstar directly from a movie card.
4. **Live Classroom LAN IP Switcher (`SettingsScreen.js`):** Allows switching the Axios baseURL dynamically on a physical phone during evaluation without rebuilding the bundle.
