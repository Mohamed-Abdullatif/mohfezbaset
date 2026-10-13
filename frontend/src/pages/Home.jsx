import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';

const FEATURES = [
  { icon: '🎧', titleKey: 'feat1Title', descKey: 'feat1Desc' },
  { icon: '📈', titleKey: 'feat2Title', descKey: 'feat2Desc' },
  { icon: '🔖', titleKey: 'feat3Title', descKey: 'feat3Desc' },
  { icon: '📥', titleKey: 'feat4Title', descKey: 'feat4Desc' },
];

export default function Home() {
  const { t, lang, user, progress, prefs } = useApp();
  const savedPage = parseInt(localStorage.getItem('mushaf_last_page'), 10) || (user && prefs && prefs.last_page > 1 ? prefs.last_page : 0);
  const navigate = useNavigate();

  const totalMemorized = progress.reduce((s, p) => s + p.memorized_ayahs, 0);
  const completedSurahs = progress.filter(p => p.memorized_ayahs >= p.total_ayahs).length;

  const [visitors, setVisitors] = useState(null);
  useEffect(() => {
    axios.post('/api/stats/visit')
      .then(res => setVisitors(res.data.visitors))
      .catch(() => axios.get('/api/stats').then(r => setVisitors(r.data.visitors)).catch(() => {}));
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-inner">
          <img className="hero-logo" src={`${import.meta.env.BASE_URL}logo-mark.webp`} alt="" width="150" height="141" />
          <div className="hero-badge">
            {lang === 'ar' ? 'منصة حفظ القرآن الكريم' : 'Quran Memorization Platform'}
          </div>

          <h1 className="hero-title">{t.appName}</h1>
          <p className="hero-subtitle">{t.welcomeDesc}</p>

          <div className="hero-actions">
            {savedPage > 1 && (
              <button className="hero-btn-white" onClick={() => navigate('/mushaf')}>
                {lang === 'ar' ? `تابع القراءة · صفحة ${String(savedPage).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])}` : `Continue · page ${savedPage}`}
              </button>
            )}
            <button className={savedPage > 1 ? 'hero-btn-outline' : 'hero-btn-white'} onClick={() => navigate('/quran')}>
              {t.getStarted} ←
            </button>
            {!user && (
              <button className="hero-btn-outline" onClick={() => navigate('/register')}>
                {t.register}
              </button>
            )}
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-val">١١٤</div>
              <div className="hero-stat-label">{t.surah}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-val">٣٨</div>
              <div className="hero-stat-label">{t.reciters}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-val">{user ? completedSurahs : '—'}</div>
              <div className="hero-stat-label">{lang === 'ar' ? 'سور محفوظة' : 'Memorized'}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-val">
                {visitors !== null
                  ? (lang === 'ar'
                      ? String(visitors).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])
                      : visitors.toLocaleString())
                  : '…'}
              </div>
              <div className="hero-stat-label">{lang === 'ar' ? 'زائر' : 'Visitors'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div className="features-section">
        <div className="section-header">
          <div className="section-badge">{t.features}</div>
          <h2 className="section-title">{lang === 'ar' ? 'كل ما تحتاجه للحفظ' : 'Everything You Need'}</h2>
          <p className="section-sub">{t.tagline}</p>
        </div>
        <div className="grid-4">
          {FEATURES.map(f => (
            <div key={f.titleKey} className="feature-card">
              <div className="feature-icon-wrap">{f.icon}</div>
              <div className="feature-title">{t[f.titleKey]}</div>
              <div className="feature-desc">{t[f.descKey]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: '0 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="cta-block">
          <div className="cta-ayah">ٱقۡرَأۡ بِٱسۡمِ رَبِّكَ ٱلَّذِي خَلَقَ</div>
          <p className="cta-ref">
            {lang === 'ar' ? 'اقرأ باسم ربك الذي خلق — سورة العلق' : 'Read in the name of your Lord who created — Al-Alaq 96:1'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/quran')}>
            {t.startMemorizing} ←
          </button>
        </div>
      </div>
    </div>
  );
}
