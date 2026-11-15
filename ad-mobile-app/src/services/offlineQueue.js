import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';

const QUEUE_KEY = '@cinecircle_offline_episode_queue';

async function readQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function enqueueOfflineEpisodeLog(payload) {
  const queue = await readQueue();
  queue.push(payload);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function flushOfflineEpisodeQueue() {
  const queue = await readQueue();
  let flushedCount = 0;
  const remaining = [];

  for (const payload of queue) {
    try {
      await apiClient.post('/tracker/watchlist/log-episode', payload);
      flushedCount += 1;
    } catch {
      remaining.push(payload);
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { flushedCount, pendingCount: remaining.length };
}
