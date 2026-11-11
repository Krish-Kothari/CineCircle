import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken } from '../utils/storage';

const CUSTOM_API_URL_KEY = '@cinecircle_custom_api_url';
export const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function setCustomApiBaseUrl(newUrl) {
  const cleaned = newUrl.trim().replace(/\/$/, '');
  await AsyncStorage.setItem(CUSTOM_API_URL_KEY, cleaned);
  apiClient.defaults.baseURL = cleaned;
}

export async function getActiveApiBaseUrl() {
  const saved = await AsyncStorage.getItem(CUSTOM_API_URL_KEY);
  return saved || DEFAULT_API_BASE_URL;
}

apiClient.interceptors.request.use(
  async (config) => {
    const savedBaseUrl = await AsyncStorage.getItem(CUSTOM_API_URL_KEY);
    if (savedBaseUrl) {
      config.baseURL = savedBaseUrl;
    }
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
