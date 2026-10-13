import axios from 'axios';

// In dev, Vite proxies /api and /quran-api. In a static deploy (GitHub Pages)
// there is no proxy, so /api goes to VITE_API_URL and /quran-api goes straight to alquran.cloud.
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

axios.interceptors.request.use(config => {
  if (import.meta.env.DEV || typeof config.url !== 'string') return config;
  if (config.url.startsWith('/quran-api')) {
    config.url = 'https://api.alquran.cloud' + config.url.slice('/quran-api'.length);
  } else if (config.url.startsWith('/api') && API_URL) {
    config.url = API_URL + config.url;
  }
  return config;
});
