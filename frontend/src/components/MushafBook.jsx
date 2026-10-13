import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { fetchPage, ayahAudioUrl, toArabicNum } from '../utils/quranApi';
import { fetchQcfPage, loadQcfFont } from '../utils/qcf';
import { ayahRecord } from '../utils/quranMeta';
import Toast from './Toast';
import MushafPage from './MushafPage';

const FALLBACK_RECITER = 'ar.alafasy';
const REPEAT_OPTIONS = [1, 3, 5, 10, 0]; // 0 = loop until stopped
const FONT_MIN = 0.7, FONT_MAX = 1.3, FONT_STEP = 0.1;

const readPref = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; }
};
const writePref = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } };

export default function MushafBook({ pages, reciterId, showTools, nav }) {
  const { lang, user, addBookmark, isBookmarked, getSurahProgress, updateProgress } = useApp();
  const L = (ar, en) => (lang === 'ar' ? ar : en);

  const [ayahs, setAyahs] = useState([]);
  const [notes, setNotes] = useState({});            // ayah number -> tafsir/translation text
  const [edition, setEdition] = useState(() => readPref('study_edition', ''));
  const [hideText, setHideText] = useState(() => readPref('study_hide', false));
  const [tajweed, setTajweed] = useState(() => readPref('book_tajweed', false));
  const [phrases, setPhrases] = useState(() => readPref('book_phrases', true));
  const [variant, setVariant] = useState(() => readPref('book_variant', 'easy'));
  const [fontSize, setFontSize] = useState(() => readPref('book_font', 1));
  const [revealed, setRevealed] = useState(() => new Set());
  const [selected, setSelected] = useState(null);    // index into ayahs
  const [rangeEnd, setRangeEnd] = useState(null);    // index into ayahs
  const [repeat, setRepeat] = useState(3);
  const [playingIdx, setPlayingIdx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const audioRef = useRef(null);
  const runRef = useRef(0);          // bumped to cancel a running playback loop
  const settleRef = useRef(null);    // resolves the clip currently playing

  // ── Load the text for the open pages ──
  const pagesKey = pages.filter(Boolean).join(',');
  useEffect(() => {
    let cancelled = false;
    stop();
    setLoading(true);
    setSelected(null);
    setRangeEnd(null);
    setRevealed(new Set());
    // Ayah list for the open pages, built from the page-layout data (no extra text request)
    Promise.all(pages.filter(Boolean).map(p => fetchQcfPage(p)))
      .then(list => {
        if (cancelled) return;
        const seen = new Set();
        const out = [];
        list.forEach(d => d.keys.forEach(k => {
          const id = `${k.surah}:${k.ayah}`;
          if (!seen.has(id)) { seen.add(id); out.push(ayahRecord(k.surah, k.ayah)); }
        }));
        setAyahs(out);
      })
      .catch(() => { if (!cancelled) setAyahs([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    // Warm the cache for the neighbouring spreads so turning the page is instant
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
    const warm = idle(() => {
      const base = pages.find(Boolean);
      [base + 2, base + 3, base + 4, base + 5, base - 2, base - 1].filter(n => n >= 1 && n <= 604).forEach(n => {
        fetchQcfPage(n).catch(() => {});
        loadQcfFont(n, tajweed ? 'v2' : 'v1').catch(() => {});
      });
    });
    return () => { cancelled = true; (window.cancelIdleCallback || clearTimeout)(warm); };
  }, [pagesKey]);

  // ── Tafsir / translation ──
  useEffect(() => {
    if (!edition) { setNotes({}); return; }
    let cancelled = false;
    Promise.all(pages.filter(Boolean).map(p => fetchPage(p, edition)))
      .then(lists => {
        if (cancelled) return;
        const map = {};
        lists.flat().forEach(a => { map[a.number] = a.text; });
        setNotes(map);
      })
      .catch(() => { if (!cancelled) setNotes({}); });
    return () => { cancelled = true; };
  }, [pagesKey, edition]);

  useEffect(() => () => stop(), []);
  useEffect(() => writePref('study_edition', edition), [edition]);
  useEffect(() => writePref('study_hide', hideText), [hideText]);
  useEffect(() => writePref('book_tajweed', tajweed), [tajweed]);
  useEffect(() => writePref('book_phrases', phrases), [phrases]);
  useEffect(() => writePref('book_variant', variant), [variant]);
  useEffect(() => writePref('book_font', fontSize), [fontSize]);

  // ── Audio: play ayahs[from..to] `repeat` times ──
  function stop() {
    runRef.current++;
    if (audioRef.current) audioRef.current.pause();
    if (settleRef.current) settleRef.current();
    setPlayingIdx(null);
  }

  const playClip = (url) => new Promise(resolve => {
    const audio = audioRef.current || (audioRef.current = new Audio());
    settleRef.current = resolve;
    audio.onended = resolve;
    audio.onerror = resolve;
    audio.src = url;
    audio.play().catch(resolve);
  });

  const playOne = async (ayah) => {
    const audio = audioRef.current || (audioRef.current = new Audio());
    let failed = false;
    await new Promise(resolve => {
      settleRef.current = resolve;
      audio.onended = resolve;
      audio.onerror = () => { failed = true; resolve(); };
      audio.src = ayahAudioUrl(reciterId, ayah.number);
      audio.play().catch(() => { failed = true; resolve(); });
    });
    // Not every reciter has per-ayah files; fall back to Alafasy
    if (failed && reciterId !== FALLBACK_RECITER) await playClip(ayahAudioUrl(FALLBACK_RECITER, ayah.number));
  };

  const play = async () => {
    if (selected === null) return;
    stop();
    const run = ++runRef.current;
    const from = selected;
    const to = Math.max(from, rangeEnd ?? from);
    for (let r = 0; repeat === 0 || r < repeat; r++) {
      for (let i = from; i <= to; i++) {
        if (run !== runRef.current) return;
        setPlayingIdx(i);
        await playOne(ayahs[i]);
      }
    }
    if (run === runRef.current) setPlayingIdx(null);
  };

  // ── Interactions ──
  const onAyahClick = (ayah) => {
    const i = ayahs.findIndex(a => a.number === ayah.number);
    if (i < 0) return;
    setSelected(i);
    setRangeEnd(i);
    if (hideText) {
      setRevealed(prev => {
        const next = new Set(prev);
        next.has(ayahs[i].number) ? next.delete(ayahs[i].number) : next.add(ayahs[i].number);
        return next;
      });
    }
  };

  const current = selected !== null ? ayahs[selected] : null;

  const handleBookmark = async () => {
    if (!user) return setToast({ msg: L('سجّل الدخول أولاً', 'Please login first'), type: 'error' });
    if (isBookmarked(current.surah.number, current.numberInSurah))
      return setToast({ msg: L('الإشارة محفوظة مسبقاً', 'Already bookmarked'), type: 'error' });
    const ok = await addBookmark(current.surah.number, current.numberInSurah);
    setToast({ msg: ok ? L('تمت إضافة الإشارة ✓', 'Bookmark added ✓') : L('تعذّر الحفظ', 'Could not save'), type: ok ? 'success' : 'error' });
  };

  const handleMemorized = async () => {
    if (!user) return setToast({ msg: L('سجّل الدخول أولاً', 'Please login first'), type: 'error' });
    const { number, numberOfAyahs } = current.surah;
    const prev = getSurahProgress(number);
    const target = Math.max(current.numberInSurah, prev ? prev.memorized_ayahs : 0);
    await updateProgress(number, target, numberOfAyahs);
    setToast({ msg: L(`تم تسجيل الحفظ حتى الآية ${toArabicNum(current.numberInSurah)} ✓`, `Memorized up to ayah ${current.numberInSurah} ✓`), type: 'success' });
  };

  const rangeChoices = useMemo(
    () => (selected === null ? [] : ayahs.map((a, i) => ({ a, i })).filter(({ i }) => i >= selected)),
    [ayahs, selected]
  );

  const playingNumber = playingIdx !== null && ayahs[playingIdx] ? ayahs[playingIdx].number : null;
  const selectedNumber = current ? current.number : null;
  const [rightPage, leftPage] = pages;

  const renderPage = (num, side) => num ? (
    <MushafPage
      key={num} pageNum={num} side={side}
      selectedNumber={selectedNumber} playingNumber={playingNumber}
      revealed={revealed} hideText={hideText} fontScale={fontSize} tajweed={tajweed} phrases={phrases} variant={variant}
      onAyah={onAyahClick}
    />
  ) : <div className={`mb-page mb-page-${side} mb-blank`} />;

  return (
    <div className="mb-wrap">
      <div className="mb-stage">
        {/* A Mushaf turns right-to-left in every language: left arrow = next page, right arrow = previous */}
        <button className={`mb-arrow${!nav.canNext ? ' disabled' : ''}`} onClick={nav.onNext} aria-label="next page"><span className="mb-chev flip"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 4.5l7.5 7.5L9 19.5" /></svg></span></button>

        <div className="mb-spread" key={pagesKey}>
          {renderPage(leftPage, 'left')}
          <div className="mb-spine" />
          {renderPage(rightPage, 'right')}
        </div>

        <button className={`mb-arrow${!nav.canPrev ? ' disabled' : ''}`} onClick={nav.onPrev} aria-label="previous page"><span className="mb-chev"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 4.5l7.5 7.5L9 19.5" /></svg></span></button>
      </div>

      {showTools && (
    <section className="study-panel">
      {/* ── Toolbar ── */}
      <div className="study-toolbar">
        {/* display */}
        <select className="study-select" value={variant} onChange={e => setVariant(e.target.value)} title={L('شكل الصفحة', 'Page style')}>
          <option value="easy">{L('مصحف ميسر', 'Easy Mushaf')}</option>
          <option value="classic">{L('مصحف مزخرف', 'Ornate Mushaf')}</option>
        </select>

        <button className={`study-chip${phrases ? ' on' : ''}`} onClick={() => setPhrases(v => !v)}>
          🖍 {L('تلوين العبارات', 'Phrase colors')}
        </button>

        <button className={`study-chip${tajweed ? ' on' : ''}`} onClick={() => setTajweed(v => !v)}>
          🎨 {L('ألوان التجويد', 'Tajweed colors')}
        </button>

        <span className="study-sep" />

        {/* memorize & study */}
        <button className={`study-chip${hideText ? ' on' : ''}`} onClick={() => { setHideText(v => !v); setRevealed(new Set()); }}>
          {hideText ? '🙈' : '👁'} {L('وضع الحفظ', 'Memorize mode')}
        </button>

        <select className="study-select" value={edition} onChange={e => setEdition(e.target.value)} title={L('التفسير', 'Tafsir')}>
          <option value="">{L('بدون تفسير', 'No tafsir')}</option>
          <option value="ar.muyassar">{L('التفسير الميسر', 'Tafsir Al-Muyassar')}</option>
          <option value="en.sahih">{L('ترجمة إنجليزية', 'English translation')}</option>
        </select>

        <span className="study-sep" />

        {/* text size */}
        <div className="study-font">
          <button className="study-chip" onClick={() => setFontSize(f => Math.max(FONT_MIN, +(f - FONT_STEP).toFixed(2)))} aria-label="smaller">A−</button>
          <button className="study-chip" onClick={() => setFontSize(f => Math.min(FONT_MAX, +(f + FONT_STEP).toFixed(2)))} aria-label="larger">A+</button>
        </div>
      </div>

      {/* ── Selected ayah ── */}
      {ayahs.length > 0 && (
        <div className="study-actions">
          {!current ? (
            <p className="study-hint">{L('اضغط على أي آية لتشغيلها وتكرارها وقراءة تفسيرها', 'Tap any ayah to play it, repeat it and read its tafsir')}</p>
          ) : (
            <>
              <div className="study-actions-title">
                {current.surah.name} · {L('آية', 'Ayah')} {lang === 'ar' ? toArabicNum(current.numberInSurah) : current.numberInSurah}
              </div>

              <div className="study-actions-row">
                <label className="study-label">
                  {L('إلى آية', 'To ayah')}
                  <select className="study-select" value={rangeEnd ?? selected} onChange={e => setRangeEnd(+e.target.value)}>
                    {rangeChoices.map(({ a, i }) => (
                      <option key={a.number} value={i}>{lang === 'ar' ? toArabicNum(a.numberInSurah) : a.numberInSurah}</option>
                    ))}
                  </select>
                </label>

                <label className="study-label">
                  {L('التكرار', 'Repeat')}
                  <select className="study-select" value={repeat} onChange={e => setRepeat(+e.target.value)}>
                    {REPEAT_OPTIONS.map(n => (
                      <option key={n} value={n}>{n === 0 ? '∞' : `${n}×`}</option>
                    ))}
                  </select>
                </label>

                {playingIdx === null
                  ? <button className="btn btn-primary btn-sm" onClick={play}>▶ {L('تشغيل', 'Play')}</button>
                  : <button className="btn btn-outline btn-sm" onClick={stop}>■ {L('إيقاف', 'Stop')}</button>}
                <button className="btn btn-outline btn-sm" onClick={handleBookmark}>🔖 {L('إشارة', 'Bookmark')}</button>
                <button className="btn btn-outline btn-sm" onClick={handleMemorized}>✓ {L('حفظت إلى هنا', 'Memorized to here')}</button>
              </div>

              {edition && (
                <div className="study-note" dir={edition.startsWith('en') ? 'ltr' : 'rtl'}>
                  {notes[current.number] || L('جاري تحميل التفسير...', 'Loading...')}
                </div>
              )}
            </>
          )}
        </div>
      )}

    </section>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
