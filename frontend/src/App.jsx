import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import QuranList from './pages/QuranList';
import SurahReader from './pages/SurahReader';
import Bookmarks from './pages/Bookmarks';
import Progress from './pages/Progress';
import Downloads from './pages/Downloads';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MushafReader from './pages/MushafReader';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quran" element={<QuranList />} />
          <Route path="/surah/:number" element={<SurahReader />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/mushaf" element={<MushafReader />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AppProvider>
  );
}
