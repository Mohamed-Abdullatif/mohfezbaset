import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { RECITERS } from '../utils/reciters';
import AudioPlayer from '../components/AudioPlayer';
import Toast from '../components/Toast';
import MushafBook from '../components/MushafBook';

const toArabicNum = (n) => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

const JUZ_AR = ['','الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر','الثالث عشر','الرابع عشر','الخامس عشر','السادس عشر','السابع عشر','الثامن عشر','التاسع عشر','العشرون','الحادي والعشرون','الثاني والعشرون','الثالث والعشرون','الرابع والعشرون','الخامس والعشرون','السادس والعشرون','السابع والعشرون','الثامن والعشرون','التاسع والعشرون','الثلاثون'];

// Surah names list for the dropdown
const SURAH_NAMES_AR = ['','الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];

export default function SurahReader() {
  const { number } = useParams();
  const { t, lang, user, updateProgress, getSurahProgress, isDownloaded, addDownload, removeDownload } = useApp();
  const navigate = useNavigate();

  const surahNum = parseInt(number);

  const [surah, setSurah]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [allPages, setAllPages]       = useState([]);
  const [juzMap, setJuzMap]           = useState({});
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0].id);
  const [audioSurah, setAudioSurah]   = useState(null);
  const [memorizedCount, setMemorizedCount] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [showSurahMenu, setShowSurahMenu] = useState(false);
  const [toast, setToast]             = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  useEffect(() => {
    setLoading(true);
    setSurah(null);
    setAllPages([]);
    setSpreadIndex(0);
    setShowSurahMenu(false);

    axios.get(`/quran-api/v1/surah/${number}/ar.uthmani`)
      .then(res => {
        const data = res.data.data;
        setSurah(data);
        const pageSet = new Set(data.ayahs.map(a => a.page));
        const sorted  = [...pageSet].sort((a, b) => a - b);
        const jMap    = {};
        data.ayahs.forEach(a => { jMap[a.page] = a.juz; });
        setJuzMap(jMap);
        setAllPages(sorted);
        const prog = getSurahProgress(parseInt(number));
        if (prog) setMemorizedCount(prog.memorized_ayahs);
      })
      .catch(() => navigate('/quran'))
      .finally(() => setLoading(false));
  }, [number]);

  const rightPageNum = allPages[spreadIndex];
  const leftPageNum  = allPages[spreadIndex + 1];
  const canGoNext    = spreadIndex + 2 < allPages.length;
  const canGoPrev    = spreadIndex > 0;
  const currentJuz   = juzMap[rightPageNum] || juzMap[leftPageNum];

  const goNext = () => { if (canGoNext) { setSpreadIndex(i => i + 2); } };
  const goPrev = () => { if (canGoPrev) { setSpreadIndex(i => i - 2); } };
  const goSurah = (n) => navigate(`/surah/${n}`);

  const handleSaveProgress = async () => {
    if (!user) return showToast(t.loginRequired, 'error');
    await updateProgress(surah.number, memorizedCount, surah.numberOfAyahs);
    setShowProgress(false);
    showToast(t.save + ' ✓');
  };

  const handleDownload = async () => {
    if (!user) return showToast(t.loginRequired, 'error');
    if (isDownloaded(surah.number, selectedReciter)) {
      await removeDownload(surah.number, selectedReciter);
      showToast('Removed');
    } else {
      await addDownload(surah.number, selectedReciter);
      showToast(t.downloaded + ' ✓');
    }
  };

  if (loading) return (
    <div className="mushaf-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader" style={{ color: '#c9a84c' }}>
        <div className="spinner" style={{ borderTopColor: '#c9a84c' }} />
        {t.loading}
      </div>
    </div>
  );

  if (!surah) return null;

  const prog = getSurahProgress(surah.number);
  const pct  = prog ? Math.round((prog.memorized_ayahs / surah.numberOfAyahs) * 100) : 0;

  return (
    <div className="mushaf-container" onClick={() => showSurahMenu && setShowSurahMenu(false)}>

      {/* ── Top bar ── */}
      <div className="mushaf-topbar">
        <div className="mushaf-topbar-side">
          <button className="mushaf-back-btn" onClick={() => navigate('/quran')}>
            ← {lang === 'ar' ? 'القرآن' : 'Quran'}
          </button>
        </div>

        <div className="mushaf-topbar-center">
          {currentJuz && (
            <span className="mushaf-badge">الجزء {JUZ_AR[currentJuz]}</span>
          )}
          {rightPageNum && (
            <span className="mushaf-badge mushaf-badge-pages">
              {leftPageNum
                ? `بين ${toArabicNum(rightPageNum)} ـ ${toArabicNum(leftPageNum)}`
                : toArabicNum(rightPageNum)}
            </span>
          )}
        </div>

        <div className="mushaf-topbar-side mushaf-topbar-right">
          <span className="mushaf-surah-title-tag">{surah.name}</span>
        </div>
      </div>

      {/* ── Controls bar ── */}
      <div className="mushaf-controls">
        {/* Surah selector */}
        <div className="surah-nav-group" onClick={e => e.stopPropagation()}>
          <button
            className="btn btn-sm mushaf-surah-btn"
            disabled={surahNum <= 1}
            onClick={() => goSurah(surahNum - 1)}
            title={surahNum > 1 ? SURAH_NAMES_AR[surahNum - 1] : ''}
          >›</button>

          <div className="surah-selector-wrap">
            <button
              className="surah-selector-trigger"
              onClick={() => setShowSurahMenu(v => !v)}
            >
              <span>{surah.name}</span>
              <span style={{ opacity: .6, fontSize: '.7rem' }}>▾</span>
            </button>

            {showSurahMenu && (
              <div className="surah-dropdown">
                {Array.from({ length: 114 }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    className={`surah-dropdown-item${n === surahNum ? ' active' : ''}`}
                    onClick={() => { goSurah(n); setShowSurahMenu(false); }}
                  >
                    <span className="sd-num">{toArabicNum(n)}</span>
                    <span className="sd-name">{SURAH_NAMES_AR[n]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="btn btn-sm mushaf-surah-btn"
            disabled={surahNum >= 114}
            onClick={() => goSurah(surahNum + 1)}
            title={surahNum < 114 ? SURAH_NAMES_AR[surahNum + 1] : ''}
          >‹</button>
        </div>

        <div style={{ width: 1, background: 'rgba(255,255,255,.12)', alignSelf: 'stretch', margin: '0 4px' }} />

        <select className="reciter-select" value={selectedReciter} onChange={e => setSelectedReciter(e.target.value)}>
          {RECITERS.map(r => (
            <option key={r.id} value={r.id}>{lang === 'ar' ? r.nameAr : r.nameEn}</option>
          ))}
        </select>

        <button className="btn btn-primary btn-sm" onClick={() => setAudioSurah(surah)}>
          🎧 {t.listen}
        </button>
        <button
          className={`btn btn-sm ${isDownloaded(surah.number, selectedReciter) ? 'btn-outline' : 'btn-gold'}`}
          onClick={handleDownload}
        >
          {isDownloaded(surah.number, selectedReciter) ? `✓ ${t.downloaded}` : `📥 ${t.download}`}
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => setShowProgress(true)}>
          📈{prog && <span style={{ color: 'var(--accent-lt)', marginInlineStart: 4 }}>{pct}%</span>}
        </button>
      </div>

      {/* ── Book ── */}
      <div className="mushaf-spread-wrapper mb-surah-wrapper">
        <MushafBook
          pages={[rightPageNum, leftPageNum]}
          reciterId={selectedReciter}
          showTools
          nav={{ onPrev: goPrev, onNext: goNext, canPrev: canGoPrev, canNext: canGoNext }}
        />
      </div>

      {/* ── Page dot strip ── */}
      <div className="quran-page-strip">
        {allPages.map((pg, i) => (
          <button
            key={pg}
            className={`quran-page-dot${(i === spreadIndex || i === spreadIndex + 1) ? ' active' : ''}`}
            onClick={() => { setSpreadIndex(i % 2 === 0 ? i : Math.max(0, i - 1)); }}
            title={toArabicNum(pg)}
          />
        ))}
      </div>

      {/* ── Progress modal ── */}
      {showProgress && (
        <div className="modal-overlay">
          <div className="card" style={{ width: 360, maxWidth: '90vw' }}>
            <h3 style={{ marginBottom: 16, color: 'var(--green)' }}>{t.updateProgress}</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 16 }}>
              {surah.name} — {surah.numberOfAyahs} {t.ayahs}
            </p>
            <div className="form-group">
              <label className="form-label">{t.memorizedAyahs}</label>
              <input
                type="number" className="form-input"
                min="0" max={surah.numberOfAyahs} value={memorizedCount}
                onChange={e => setMemorizedCount(Math.min(surah.numberOfAyahs, Math.max(0, +e.target.value)))}
              />
            </div>
            <div className="progress-bar" style={{ marginBottom: 16 }}>
              <div className="progress-bar-fill" style={{ width: `${(memorizedCount / surah.numberOfAyahs) * 100}%` }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveProgress}>{t.save}</button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowProgress(false)}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {audioSurah && <AudioPlayer surah={audioSurah} reciterId={selectedReciter} onClose={() => setAudioSurah(null)} />}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
