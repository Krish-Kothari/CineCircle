import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';

const QUEUE_KEY = '@cinecircle_offline_episode_queue';

export async function enqueueOfflineEpisodeLog(payload) {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const currentQueue = raw ? JSON.parse(raw) : [];
  currentQueue.push({
    ...payload,
    queuedAt: new Date().toISOString()
  });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));
  return currentQueue.length;
}

export async function flushOfflineEpisodeQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const currentQueue = raw ? JSON.parse(raw) : [];

  if (currentQueue.length === 0) {
    return { flushedCount: 0 };
  }

  const remaining = [];
  let flushedCount = 0;

  for (const item of currentQueue) {
    try {
      await apiClient.post('/tracker/watchlist/log-episode', {
        mediaId: item.mediaId,
        seasonNumber: item.seasonNumber || 1,
        episodeNumber: item.episodeNumber
      });
      flushedCount += 1;
    } catch (err) {
      remaining.push(item);
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { flushedCount, remainingCount: remaining.length };
}
