import React, { createContext, useContext, useState, useEffect } from 'react';
import ar from '../locales/ar';
import en from '../locales/en';
import axios from 'axios';
import { localDay } from '../utils/quranApi';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [bookmarks, setBookmarks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [prefs, setPrefs] = useState(null);

  const t = lang === 'ar' ? ar : en;
  const isRTL = lang === 'ar';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    localStorage.setItem('lang', lang);
  }, [lang, isRTL]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const [bRes, pRes, dRes, prRes] = await Promise.all([
        axios.get('/api/bookmarks'),
        axios.get('/api/progress'),
        axios.get('/api/downloads'),
        axios.get('/api/prefs', { params: { day: localDay() } }),
      ]);
      setPrefs(prRes.data);
      setBookmarks(bRes.data);
      setProgress(pRes.data);
      setDownloads(dRes.data);
    } catch (error) {
      // Log error for debugging - in production, you might want to use a proper logging service
      console.error('Failed to fetch user data:', error);
    }
  };

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`;
  };

  const updateUser = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setBookmarks([]);
    setProgress([]);
    setDownloads([]);
    setPrefs(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const addBookmark = async (surah_number, ayah_number, note = '') => {
    try {
      const res = await axios.post('/api/bookmarks', { surah_number, ayah_number, note });
      setBookmarks(prev => [res.data, ...prev]);
      return true;
    } catch { return false; }
  };

  const removeBookmark = async (id) => {
    await axios.delete(`/api/bookmarks/${id}`);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const isBookmarked = (surah, ayah) =>
    bookmarks.some(b => b.surah_number === surah && b.ayah_number === ayah);

  const updateProgress = async (surah_number, memorized_ayahs, total_ayahs) => {
    await axios.post('/api/progress', { surah_number, memorized_ayahs, total_ayahs, day: localDay() });
    axios.get('/api/prefs', { params: { day: localDay() } }).then(r => setPrefs(r.data)).catch(() => {});
    setProgress(prev => {
      const idx = prev.findIndex(p => p.surah_number === surah_number);
      const entry = { surah_number, memorized_ayahs, total_ayahs };
      if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next; }
      return [...prev, entry];
    });
  };

  // Save reading position / daily goal (logged-in users only)
  const savePrefs = async (patch) => {
    setPrefs(prev => (prev ? { ...prev, ...patch } : prev));
    if (!token) return;
    try { await axios.put('/api/prefs', patch); } catch { /* non-critical */ }
  };

  const getSurahProgress = (surah_number) =>
    progress.find(p => p.surah_number === surah_number) || null;

  const addDownload = async (surah_number, reciter) => {
    await axios.post('/api/downloads', { surah_number, reciter });
    setDownloads(prev => [...prev, { surah_number, reciter }]);
  };

  const removeDownload = async (surah_number, reciter) => {
    await axios.delete(`/api/downloads/${surah_number}/${reciter}`);
    setDownloads(prev => prev.filter(d => !(d.surah_number === surah_number && d.reciter === reciter)));
  };

  const isDownloaded = (surah_number, reciter) =>
    downloads.some(d => d.surah_number === surah_number && d.reciter === reciter);

  return (
    <AppContext.Provider value={{
      lang, setLang, theme, setTheme, t, isRTL,
      user, token, login, logout, updateUser,
      bookmarks, addBookmark, removeBookmark, isBookmarked,
      progress, updateProgress, getSurahProgress,
      prefs, savePrefs,
      downloads, addDownload, removeDownload, isDownloaded,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
