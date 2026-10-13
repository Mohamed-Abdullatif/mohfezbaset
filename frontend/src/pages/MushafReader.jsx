import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RECITERS } from '../utils/reciters';
import AudioPlayer from '../components/AudioPlayer';
import MushafBook from '../components/MushafBook';
import { hizbStartPage, playFlipSound } from '../utils/quranApi';
import { fetchQcfPage } from '../utils/qcf';
import './mushaf-reader.css';

const TOTAL_PAGES = 604;

const toArabicNum = (n) => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

const SURAH_START = [0,1,2,50,77,106,128,151,177,187,208,221,235,249,255,262,267,282,293,305,312,322,332,342,350,359,367,377,385,396,404,411,415,418,428,434,440,446,453,458,467,477,483,489,496,499,502,507,511,515,518,520,523,526,528,531,534,537,542,545,549,551,553,554,556,558,560,562,564,566,568,570,572,574,575,577,578,580,582,583,585,586,587,587,589,590,591,591,592,593,594,595,595,596,596,597,597,598,598,599,599,600,600,601,601,601,602,602,602,603,603,603,604,604,604];
const SURAH_AR   = ['','الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];
const SURAH_EN   = ['','Al-Fatiha','Al-Baqarah','Al-Imran','An-Nisa',"Al-Ma'idah","Al-An'am","Al-A'raf",'Al-Anfal','At-Tawbah','Yunus','Hud','Yusuf',"Ar-Ra'd",'Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf','Maryam','Ta-Ha','Al-Anbiya','Al-Hajj',"Al-Mu'minun",'An-Nur','Al-Furqan',"Ash-Shu'ara",'An-Naml','Al-Qasas','Al-Ankabut','Ar-Rum','Luqman','As-Sajdah','Al-Ahzab','Saba','Fatir','Ya-Sin','As-Saffat','Sad','Az-Zumar','Ghafir','Fussilat','Ash-Shura','Az-Zukhruf','Ad-Dukhan','Al-Jathiyah','Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf','Adh-Dhariyat','At-Tur','An-Najm','Al-Qamar','Ar-Rahman',"Al-Waqi'ah",'Al-Hadid','Al-Mujadilah','Al-Hashr','Al-Mumtahanah','As-Saf',"Al-Jumu'ah",'Al-Munafiqun','At-Taghabun','At-Talaq','At-Tahrim','Al-Mulk','Al-Qalam','Al-Haqqah',"Al-Ma'arij",'Nuh','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyamah','Al-Insan','Al-Mursalat','An-Naba',"An-Nazi'at",'Abasa','At-Takwir','Al-Infitar','Al-Mutaffifin','Al-Inshiqaq','Al-Buruj','At-Tariq',"Al-A'la",'Al-Ghashiyah','Al-Fajr','Al-Balad','Ash-Shams','Al-Layl','Ad-Duha','Ash-Sharh','At-Tin','Al-Alaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-Adiyat',"Al-Qari'ah",'At-Takathur','Al-Asr','Al-Humazah','Al-Fil','Quraish',"Al-Ma'un",'Al-Kawthar','Al-Kafirun','An-Nasr','Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas'];

const JUZ_PAGES = [0,1,22,42,62,82,102,121,142,162,182,201,222,242,262,282,302,322,342,362,382,402,422,442,462,482,502,522,542,562,582];
const JUZ_AR    = ['','الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر','الثالث عشر','الرابع عشر','الخامس عشر','السادس عشر','السابع عشر','الثامن عشر','التاسع عشر','العشرون','الحادي والعشرون','الثاني والعشرون','الثالث والعشرون','الرابع والعشرون','الخامس والعشرون','السادس والعشرون','السابع والعشرون','الثامن والعشرون','التاسع والعشرون','الثلاثون'];

function getSurahFromPage(p) { let s=1; for(let i=1;i<=114;i++){if(SURAH_START[i]<=p)s=i;} return s; }
function getJuzFromPage(p)   { let j=1; for(let i=1;i<=30;i++){if(JUZ_PAGES[i]<=p)j=i;} return j; }

export default function MushafReader() {
  const navigate = useNavigate();
  const { lang, user, prefs, savePrefs } = useApp();

  // rightPage is always odd (1,3,5,...) — right side of the open book
  const [rightPage, setRightPage] = useState(() => {
    const saved = parseInt(localStorage.getItem('mushaf_last_page'), 10);
    return saved && saved >= 1 && saved <= TOTAL_PAGES ? saved : 1;
  });
  const [showSurahMenu, setShowSurahMenu] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0].id);
  const [audioActive, setAudioActive] = useState(false);
  const [jumpVal, setJumpVal] = useState('');
  const [showStudy, setShowStudy] = useState(() => localStorage.getItem('mushaf_study') !== '0');
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('mushaf_sound') === '1');
  const [hizb, setHizb] = useState(null);

  const touchStart = useRef(null);

  const leftPage   = rightPage + 1 <= TOTAL_PAGES ? rightPage + 1 : null;
  const canNext    = rightPage + 2 <= TOTAL_PAGES;
  const canPrev    = rightPage > 1;
  const surahNum   = getSurahFromPage(rightPage);
  const juzNum     = getJuzFromPage(rightPage);

  // Remember the reading position (browser, plus the account when logged in)
  useEffect(() => {
    localStorage.setItem('mushaf_last_page', rightPage);
    if (!user) return;
    const timer = setTimeout(() => savePrefs({ last_page: rightPage }), 800);
    return () => clearTimeout(timer);
  }, [rightPage]);

  // First visit on this device: resume from the account's saved page
  const resumedRef = useRef(false);
  useEffect(() => {
    if (resumedRef.current || !prefs || localStorage.getItem('mushaf_last_page')) return;
    resumedRef.current = true;
    if (prefs.last_page > 1) setRightPage(prefs.last_page % 2 === 0 ? prefs.last_page - 1 : prefs.last_page);
  }, [prefs]);

  useEffect(() => { localStorage.setItem('mushaf_study', showStudy ? '1' : '0'); }, [showStudy]);
  useEffect(() => { localStorage.setItem('mushaf_sound', soundOn ? '1' : '0'); }, [soundOn]);

  // Current hizb, from the first ayah of the spread's last page (a hizb often starts mid-spread)
  useEffect(() => {
    let cancelled = false;
    fetchQcfPage(leftPage || rightPage)
      .then(d => { if (!cancelled && d.meta.hizb) setHizb(d.meta.hizb); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [rightPage, leftPage]);

  const flip = () => { if (soundOn) playFlipSound(); };
  const goNext = () => { if (canNext) { flip(); setRightPage(p => p + 2); } };
  const goPrev = () => { if (canPrev) { flip(); setRightPage(p => p - 2); } };

  const jumpToPage = (n) => {
    const p = Math.max(1, Math.min(TOTAL_PAGES, n));
    flip();
    setRightPage(p % 2 === 0 ? p - 1 : p);
   
  };

  const jumpToHizb = async (n) => {
    try { jumpToPage(await hizbStartPage(n)); } catch { /* offline */ }
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  goNext();
      if (e.key === 'ArrowRight') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rightPage]);

  // Swipe
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 60) dx < 0 ? goNext() : goPrev();
    touchStart.current = null;
  };

  const surahObj = { number: surahNum, name: SURAH_AR[surahNum], englishName: SURAH_EN[surahNum] };

  return (
    <div className="mr-root" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      onClick={() => showSurahMenu && setShowSurahMenu(false)}>

      {/* ── Header ── */}
      <div className="mr-header">
        <button className="mr-back-btn" onClick={() => navigate('/quran')}>
          ← {lang === 'ar' ? 'القرآن' : 'Quran'}
        </button>

        <div className="mr-header-center">
          {/* Surah selector */}
          <div className="surah-selector-wrap" onClick={e => e.stopPropagation()}>
            <button className="surah-selector-trigger mr-trigger" onClick={() => setShowSurahMenu(v => !v)}>
              <span>{SURAH_AR[surahNum]}</span>
              <span style={{ opacity:.5, fontSize:'.7rem' }}>▾</span>
            </button>
            {showSurahMenu && (
              <div className="surah-dropdown">
                {Array.from({ length: 114 }, (_, i) => i + 1).map(n => (
                  <button key={n}
                    className={`surah-dropdown-item${n === surahNum ? ' active' : ''}`}
                    onClick={() => { jumpToPage(SURAH_START[n]); setShowSurahMenu(false); }}>
                    <span className="sd-num">{toArabicNum(n)}</span>
                    <span className="sd-name">{SURAH_AR[n]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <select className="mr-select" value={juzNum} onChange={e => jumpToPage(JUZ_PAGES[+e.target.value])}
            title={lang === 'ar' ? 'الجزء' : 'Juz'}>
            {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
              <option key={j} value={j}>{lang === 'ar' ? `الجزء ${JUZ_AR[j]}` : `Juz ${j}`}</option>
            ))}
          </select>

          <select className="mr-select" value={hizb ?? ''} onChange={e => jumpToHizb(+e.target.value)}
            title={lang === 'ar' ? 'الحزب' : 'Hizb'}>
            {hizb === null && <option value="">{lang === 'ar' ? 'الحزب' : 'Hizb'}</option>}
            {Array.from({ length: 60 }, (_, i) => i + 1).map(h => (
              <option key={h} value={h}>{lang === 'ar' ? `الحزب ${toArabicNum(h)}` : `Hizb ${h}`}</option>
            ))}
          </select>

          <span className="mr-badge">
            {lang === 'ar'
              ? `${toArabicNum(rightPage)}${leftPage ? ` ـ ${toArabicNum(leftPage)}` : ''} / ٦٠٤`
              : `${rightPage}${leftPage ? `–${leftPage}` : ''} / 604`}
          </span>
        </div>

        <div className="mr-header-right" onClick={e => e.stopPropagation()}>
          {/* Page jump */}
          <input
            type="number" min="1" max="604"
            placeholder={lang === 'ar' ? 'صفحة' : 'Page'}
            value={jumpVal}
            onChange={e => setJumpVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && jumpVal) { jumpToPage(+jumpVal); setJumpVal(''); } }}
            className="mr-jump"
          />
          {/* Reciter + listen */}
          <select className="mr-reciter" value={selectedReciter} onChange={e => setSelectedReciter(e.target.value)}>
            {RECITERS.map(r => <option key={r.id} value={r.id}>{lang === 'ar' ? r.nameAr : r.nameEn}</option>)}
          </select>
          <button className="mr-listen-btn" onClick={() => setAudioActive(true)} title={lang === 'ar' ? 'استماع' : 'Listen'}>🎧</button>
          <button className={`mr-listen-btn${showStudy ? ' on' : ''}`} onClick={() => setShowStudy(v => !v)}
            title={lang === 'ar' ? 'أدوات الحفظ والتفسير' : 'Memorize & tafsir tools'}>📝</button>
          <button className={`mr-listen-btn${soundOn ? ' on' : ''}`} onClick={() => setSoundOn(v => !v)}
            title={lang === 'ar' ? 'صوت تقليب الصفحة' : 'Page-flip sound'}>{soundOn ? '🔔' : '🔕'}</button>
        </div>
      </div>

      {/* ── Book ── */}
      <MushafBook
        pages={[rightPage, leftPage]}
        reciterId={selectedReciter}
        showTools={showStudy}
        nav={{ onPrev: goPrev, onNext: goNext, canPrev, canNext }}
      />

      {/* ── Progress bar ── */}
      <div className="mr-progress">
        <div className="mr-progress-fill" style={{ width: `${(rightPage / TOTAL_PAGES) * 100}%` }} />
      </div>

      {audioActive && (
        <AudioPlayer surah={surahObj} reciterId={selectedReciter} onClose={() => setAudioActive(false)} />
      )}
    </div>
  );
}
