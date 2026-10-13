import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';

export default function QuranList() {
  const { t, lang, getSurahProgress } = useApp();
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/quran-api/v1/surah')
      .then(res => setSurahs(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = surahs.filter(s =>
    s.name.includes(search) ||
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    String(s.number).includes(search)
  );

  if (loading) return <div className="loader"><div className="spinner" />{t.loading}</div>;

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 6, flexWrap:'wrap', gap:10 }}>
        <h1 className="page-title" style={{ margin:0 }}>{t.quran}</h1>
        <button className="btn btn-primary" onClick={() => navigate('/mushaf')}>
          📖 {lang === 'ar' ? 'اقرأ المصحف كاملاً' : 'Read Full Mushaf'}
        </button>
      </div>
      <div className="search-bar">
        <span>🔍</span>
        <input
          placeholder={t.search}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button onClick={() => setSearch('')} style={{ color: 'var(--text3)' }}>✕</button>}
      </div>

      <div className="surah-grid">
        {filtered.map(surah => {
          const prog = getSurahProgress(surah.number);
          const pct = prog ? Math.round((prog.memorized_ayahs / prog.total_ayahs) * 100) : 0;
          return (
            <div key={surah.number} className="surah-card" onClick={() => navigate(`/surah/${surah.number}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="surah-num">{surah.number}</div>
                <div>
                  <div className="surah-name">{surah.name}</div>
                  <div className="surah-name-en">{surah.englishName}</div>
                </div>
              </div>
              <div className="surah-meta">
                <span className="surah-tag">{surah.revelationType === 'Meccan' ? t.makkiyya : t.madaniyya}</span>
                <span>{surah.numberOfAyahs} {t.ayahs}</span>
              </div>
              {prog && (
                <div>
                  <div className="progress-bar-mini">
                    <div className="progress-bar-mini-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: 2 }}>
                    {pct}% {t.memorized}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
