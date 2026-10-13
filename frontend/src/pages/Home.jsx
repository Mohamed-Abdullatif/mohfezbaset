import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import './home.css';

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

const FEATURES = [
  { titleKey: 'feat1Title', descKey: 'feat1Desc', icon: <Icon><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></Icon> },
  { titleKey: 'feat2Title', descKey: 'feat2Desc', icon: <Icon><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></Icon> },
  { titleKey: 'feat3Title', descKey: 'feat3Desc', icon: <Icon><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" /></Icon> },
  { titleKey: 'feat4Title', descKey: 'feat4Desc', icon: <Icon><path d="M12 3v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></Icon> },
];

const STAT_ICONS = [
  <Icon key="s"><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" /></Icon>,
  <Icon key="r"><circle cx="12" cy="9" r="3" /><path d="M5 21a7 7 0 0 1 14 0" /><path d="M2 13a10 10 0 0 1 3-7M22 13a10 10 0 0 0-3-7" /></Icon>,
  <Icon key="m"><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></Icon>,
  <Icon key="v"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icon>,
];

const STEPS = [
  {
    ar: ['اختر سورة', 'تصفّح السور الـ ١١٤ وابدأ من حيث تحب.'],
    en: ['Pick a surah', 'Browse all 114 surahs and start wherever you like.'],
  },
  {
    ar: ['استمع وكرّر', 'استمع لقارئك المفضّل وكرّر الآيات حتى تثبت.'],
    en: ['Listen & repeat', 'Follow your favorite reciter and repeat until it sticks.'],
  },
  {
    ar: ['تابع تقدّمك', 'سجّل ما حفظته وراقب إنجازك يومًا بعد يوم.'],
    en: ['Track progress', 'Log what you memorized and watch your progress grow.'],
  },
];

const toArabicDigits = v => String(v).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

export default function Home() {
  const { t, lang, user, progress, prefs } = useApp();
  const isAr = lang === 'ar';
  const savedPage = parseInt(localStorage.getItem('mushaf_last_page'), 10) || (user && prefs && prefs.last_page > 1 ? prefs.last_page : 0);
  const navigate = useNavigate();

  const completedSurahs = progress.filter(p => p.memorized_ayahs >= p.total_ayahs).length;
  const totalMemorized = progress.reduce((s, p) => s + p.memorized_ayahs, 0);
  const fmt = v => (isAr ? toArabicDigits(v) : Number(v).toLocaleString());

  const [visitors, setVisitors] = useState(null);
  useEffect(() => {
    axios.post('/api/stats/visit')
      .then(res => setVisitors(res.data.visitors))
      .catch(() => axios.get('/api/stats').then(r => setVisitors(r.data.visitors)).catch(() => {}));
  }, []);

  const stats = [
    { val: fmt(114), label: t.surah },
    { val: fmt(38), label: t.reciters },
    { val: fmt(user ? completedSurahs : 0), label: isAr ? 'سور محفوظة' : 'Memorized' },
    { val: visitors !== null ? fmt(visitors) : '…', label: isAr ? 'زائر' : 'Visitors' },
  ];

  return (
    <div className="hm">
      {/* ── Hero ── */}
      <section className="hm-hero">
        <div className="hm-hero-glow" aria-hidden="true" />
        <div className="hm-hero-inner">
          <div className="hm-hero-text">
            <span className="hm-badge">
              <span className="hm-badge-dot" />
              {isAr ? 'منصة حفظ القرآن الكريم' : 'Quran Memorization Platform'}
            </span>
            <h1 className="hm-title">{t.appName}</h1>
            <p className="hm-subtitle">{t.welcomeDesc}</p>

            <div className="hm-actions">
              {savedPage > 1 && (
                <button className="hm-btn hm-btn-gold" onClick={() => navigate('/mushaf')}>
                  {isAr ? `تابع القراءة · صفحة ${toArabicDigits(savedPage)}` : `Continue · page ${savedPage}`}
                </button>
              )}
              <button className={`hm-btn ${savedPage > 1 ? 'hm-btn-ghost' : 'hm-btn-gold'}`} onClick={() => navigate('/quran')}>
                {t.getStarted} <span className="hm-arrow">←</span>
              </button>
              {!user && (
                <button className="hm-btn hm-btn-ghost" onClick={() => navigate('/register')}>
                  {t.register}
                </button>
              )}
            </div>
          </div>

          <div className="hm-hero-art" aria-hidden="true">
            <div className="hm-verse-card">
              <img className="hm-verse-logo" src={`${import.meta.env.BASE_URL}logo-mark.webp`} alt="" width="56" height="53" />
              <div className="hm-verse-ayah">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>
              <div className="hm-verse-meta">{isAr ? 'سورة الفاتحة · ١' : 'Al-Fatihah · 1:1'}</div>
              <div className="hm-verse-bar"><span style={{ width: user ? `${Math.min(100, (totalMemorized / 6236) * 100)}%` : '38%' }} /></div>
              <div className="hm-verse-foot">
                <span>{isAr ? 'تقدّمك' : 'Your progress'}</span>
                <b>{user ? `${fmt(totalMemorized)} / ${fmt(6236)}` : (isAr ? 'ابدأ اليوم' : 'Start today')}</b>
              </div>
            </div>
            <div className="hm-orb hm-orb-1" />
            <div className="hm-orb hm-orb-2" />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="hm-stats">
        {stats.map((s, i) => (
          <div key={s.label} className="hm-stat">
            <div className="hm-stat-icon">{STAT_ICONS[i]}</div>
            <div className="hm-stat-val">{s.val}</div>
            <div className="hm-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section className="hm-section">
        <div className="hm-head">
          <span className="hm-eyebrow">{t.features}</span>
          <h2 className="hm-h2">{isAr ? 'كل ما تحتاجه للحفظ' : 'Everything You Need'}</h2>
          <p className="hm-lead">{t.tagline}</p>
        </div>
        <div className="hm-features">
          {FEATURES.map(f => (
            <div key={f.titleKey} className="hm-card">
              <div className="hm-card-icon">{f.icon}</div>
              <h3 className="hm-card-title">{t[f.titleKey]}</h3>
              <p className="hm-card-desc">{t[f.descKey]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="hm-section hm-steps-section">
        <div className="hm-head">
          <span className="hm-eyebrow">{isAr ? 'كيف يعمل' : 'How it works'}</span>
          <h2 className="hm-h2">{isAr ? 'ثلاث خطوات للحفظ' : 'Three steps to memorize'}</h2>
        </div>
        <div className="hm-steps">
          {STEPS.map((s, i) => {
            const [title, desc] = isAr ? s.ar : s.en;
            return (
              <div key={i} className="hm-step">
                <div className="hm-step-num">{fmt(i + 1)}</div>
                <h3 className="hm-card-title">{title}</h3>
                <p className="hm-card-desc">{desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hm-cta-wrap">
        <div className="hm-cta">
          <div className="hm-cta-ornament" aria-hidden="true">۞</div>
          <div className="hm-cta-ayah">ٱقۡرَأۡ بِٱسۡمِ رَبِّكَ ٱلَّذِي خَلَقَ</div>
          <p className="hm-cta-ref">
            {isAr ? 'اقرأ باسم ربك الذي خلق — سورة العلق' : 'Read in the name of your Lord who created — Al-Alaq 96:1'}
          </p>
          <button className="hm-btn hm-btn-gold" onClick={() => navigate('/quran')}>
            {t.startMemorizing} <span className="hm-arrow">←</span>
          </button>
        </div>
      </section>
    </div>
  );
}
