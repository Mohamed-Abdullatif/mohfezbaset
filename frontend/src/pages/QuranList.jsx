import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import './quran-list.css';

const toArabicDigits = v => String(v).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

export default function QuranList() {
  const { t, lang, getSurahProgress } = useApp();
  const isAr = lang === 'ar';
  const fmt = v => (isAr ? toArabicDigits(v) : v);
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/quran-api/v1/surah')
      .then(res => setSurahs(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filters = [
    { key: 'all', label: isAr ? 'الكل' : 'All' },
    { key: 'Meccan', label: t.makkiyya },
    { key: 'Medinan', label: t.madaniyya },
    { key: 'progress', label: isAr ? 'قيد الحفظ' : 'In progress' },
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return surahs.filter(s => {
      if (q && !(s.name.includes(search.trim()) || s.englishName.toLowerCase().includes(q) || String(s.number).includes(q))) return false;
      if (filter === 'Meccan' || filter === 'Medinan') return s.revelationType === filter;
      if (filter === 'progress') return !!getSurahProgress(s.number);
      return true;
    });
  }, [surahs, search, filter, getSurahProgress]);

  if (loading) return <div className="loader"><div className="spinner" />{t.loading}</div>;

  return (
    <div className="ql">
      {/* ── Header banner ── */}
      <header className="ql-banner">
        <div className="ql-banner-inner">
          <div>
            <h1 className="ql-title">{t.quran}</h1>
            <p className="ql-sub">
              {isAr ? `${fmt(surahs.length || 114)} سورة · ${fmt(6236)} آية` : `${surahs.length || 114} surahs · 6,236 ayahs`}
            </p>
          </div>
          <button className="ql-read-btn" onClick={() => navigate('/mushaf')}>
            <span aria-hidden="true">📖</span>
            {isAr ? 'اقرأ المصحف كاملاً' : 'Read Full Mushaf'}
          </button>
        </div>
      </header>

      <div className="ql-body">
        {/* ── Search + filters ── */}
        <div className="ql-tools">
          <label className="ql-search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button type="button" className="ql-clear" onClick={() => setSearch('')} aria-label="Clear">✕</button>}
          </label>
          <div className="ql-chips" role="tablist">
            {filters.map(f => (
              <button key={f.key} role="tab" aria-selected={filter === f.key}
                className={`ql-chip${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div className="ql-empty">
            <div className="ql-empty-icon">🔍</div>
            <p>{isAr ? 'لا توجد نتائج مطابقة' : 'No matching surahs'}</p>
          </div>
        ) : (
          <div className="ql-grid">
            {filtered.map(surah => {
              const prog = getSurahProgress(surah.number);
              const pct = prog ? Math.round((prog.memorized_ayahs / prog.total_ayahs) * 100) : 0;
              const meccan = surah.revelationType === 'Meccan';
              return (
                <button key={surah.number} className="ql-card" onClick={() => navigate(`/surah/${surah.number}`)}>
                  <div className="ql-num"><span>{fmt(surah.number)}</span></div>
                  <div className="ql-info">
                    <div className="ql-name">{surah.name}</div>
                    <div className="ql-name-en">{surah.englishName}</div>
                    <div className="ql-meta">
                      <span className={`ql-tag ${meccan ? 'meccan' : 'medinan'}`}>{meccan ? t.makkiyya : t.madaniyya}</span>
                      <span className="ql-count">{fmt(surah.numberOfAyahs)} {t.ayahs}</span>
                    </div>
                    {prog && (
                      <div className="ql-prog">
                        <div className="ql-prog-bar"><div style={{ width: `${pct}%` }} /></div>
                        <span>{fmt(pct)}%</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
