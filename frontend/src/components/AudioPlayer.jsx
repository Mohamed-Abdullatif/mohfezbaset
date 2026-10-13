import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { RECITERS } from '../utils/reciters';

export default function AudioPlayer({ surah, reciterId, onClose }) {
  const { lang } = useApp();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
  const audioUrl = reciter.audioUrl(surah.number);

  useEffect(() => {
    const audio = audioRef.current;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoad = () => setDuration(audio.duration);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoad);
    audio.play().then(() => setPlaying(true)).catch(() => {});
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoad);
      audio.pause();
    };
  }, [audioUrl]);

  const toggle = () => {
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const seek = (e) => {
    const t = (e.target.value / 100) * duration;
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} />
      <div className="audio-info">
        <div className="audio-surah">{lang === 'ar' ? surah.name : surah.englishName}</div>
        <div className="audio-reciter">{lang === 'ar' ? reciter.nameAr : reciter.nameEn}</div>
      </div>
      <div className="audio-controls">
        <button className="btn-icon" onClick={() => { audioRef.current.currentTime = Math.max(0, currentTime - 10); }}>⏮</button>
        <button className="audio-play-btn" onClick={toggle}>{playing ? '⏸' : '▶'}</button>
        <button className="btn-icon" onClick={() => { audioRef.current.currentTime = Math.min(duration, currentTime + 10); }}>⏭</button>
      </div>
      <div className="audio-progress">
        <span>{fmt(currentTime)}</span>
        <input type="range" className="audio-slider" min="0" max="100" value={progress} onChange={seek} />
        <span>{fmt(duration)}</span>
      </div>
      <button className="btn-icon" onClick={onClose}>✕</button>
    </div>
  );
}
