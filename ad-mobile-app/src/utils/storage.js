import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: '@cinecircle_token',
  USER_PROFILE: '@cinecircle_user',
  OFFLINE_WATCHLIST: '@cinecircle_watchlist_cache'
};

export async function saveAuthSession(token, user) {
  await AsyncStorage.multiSet([
    [KEYS.AUTH_TOKEN, token],
    [KEYS.USER_PROFILE, JSON.stringify(user)]
  ]);
}

export async function getAuthToken() {
  return AsyncStorage.getItem(KEYS.AUTH_TOKEN);
}

export async function clearAuthSession() {
  await AsyncStorage.multiRemove([KEYS.AUTH_TOKEN, KEYS.USER_PROFILE]);
}

export async function cacheWatchlistOffline(watchlistArray) {
  await AsyncStorage.setItem(KEYS.OFFLINE_WATCHLIST, JSON.stringify(watchlistArray));
}

export async function getCachedWatchlist() {
  const raw = await AsyncStorage.getItem(KEYS.OFFLINE_WATCHLIST);
  return raw ? JSON.parse(raw) : [];
}
