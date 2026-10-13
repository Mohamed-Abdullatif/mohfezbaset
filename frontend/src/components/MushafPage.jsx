import React, { useRef, useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { toArabicNum } from '../utils/quranApi';
import { fetchQcfPage, loadQcfFont, qcfFamily } from '../utils/qcf';
import { ayahRecord } from '../utils/quranMeta';

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
const JUZ_AR = ['','الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر','الثالث عشر','الرابع عشر','الخامس عشر','السادس عشر','السابع عشر','الثامن عشر','التاسع عشر','العشرون','الحادي والعشرون','الثاني والعشرون','الثالث والعشرون','الرابع والعشرون','الخامس والعشرون','السادس والعشرون','السابع والعشرون','الثامن والعشرون','التاسع والعشرون','الثلاثون'];

const LEGEND = [
  { rule: 'g', label: 'غنة' },
  { rule: 'i', label: 'إقلاب' },
  { rule: 'f', label: 'إخفاء' },
  { rule: 'a', label: 'إدغام بغنة' },
  { rule: 'u', label: 'إدغام بلا غنة' },
  { rule: 'q', label: 'قلقلة' },
  { rule: 'n', label: 'مد' },
  { rule: 'm', label: 'مد لازم' },
];


// Surah header: tan frame · scrollwork wings · green medallions (ayah count / order) · pointed name cartouche
const Wing = () => (
  <svg viewBox="0 0 170 112" aria-hidden="true">
    <g fill="none" stroke="#5A5A5A" strokeWidth="1.6" strokeLinecap="round">
      <path d="M8 56 C8 18 62 6 84 30 C100 48 84 70 64 60 C50 53 55 38 68 41" />
      <path d="M8 56 C8 94 62 106 84 82 C100 64 84 42 64 52 C50 59 55 74 68 71" />
      <path d="M8 56 H46" />
    </g>
    <g fill="#E07B55" stroke="#8A3F25" strokeWidth="1">
      <path d="M26 30 C46 8 82 12 94 36 C72 44 46 44 26 30Z" />
      <path d="M26 82 C46 104 82 100 94 76 C72 68 46 68 26 82Z" />
    </g>
    <g fill="#E4E4E4" stroke="#6E6E6E" strokeWidth="1.2">
      <path d="M92 56 C108 38 138 38 160 56 C138 74 108 74 92 56Z" />
      <path d="M104 56 C116 47 134 47 146 56 C134 65 116 65 104 56Z" fill="#fff" />
    </g>
    <circle cx="128" cy="56" r="4.2" fill="#E07B55" stroke="#8A3F25" strokeWidth=".8" />
    <g fill="#C9B26A"><circle cx="18" cy="26" r="3" /><circle cx="18" cy="86" r="3" /></g>
  </svg>
);

const Medallion = ({ label, value }) => (
  <span className="bn-circ">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="bnRing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B4DBB8" /><stop offset="1" stopColor="#4E9B63" /></linearGradient>
        <radialGradient id="bnCore" cx=".5" cy=".4" r=".7"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#DDEFD6" /></radialGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill="url(#bnRing)" stroke="#2F6B45" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="36" fill="url(#bnCore)" stroke="#fff" strokeWidth="2" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#3F8A59" strokeWidth="1" />
    </svg>
    <span className="bn-circ-t"><small>{label}</small><b>{value}</b></span>
  </span>
);

function SurahBanner({ surah }) {
  return (
    <div className="mb-bar">
      <span className="bn-wing"><Wing /></span>
      <Medallion label="ترتيبها" value={toArabicNum(surah.number)} />
      <span className="bn-cart">
        <svg viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <radialGradient id="bnCart" cx=".5" cy=".45" r=".75"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#D4EBCF" /></radialGradient>
          </defs>
          <path d="M3 50 C23 50 31 4 68 4 H332 C369 4 377 50 397 50 C377 50 369 96 332 96 H68 C31 96 23 50 3 50Z"
            fill="url(#bnCart)" stroke="#2F6B45" strokeWidth="7" vectorEffect="non-scaling-stroke" />
          <path d="M3 50 C23 50 31 4 68 4 H332 C369 4 377 50 397 50 C377 50 369 96 332 96 H68 C31 96 23 50 3 50Z"
            fill="none" stroke="#6DB27F" strokeWidth="3.4" vectorEffect="non-scaling-stroke" />
          <path d="M20 50 C36 50 43 17 72 17 H328 C357 17 364 50 380 50 C364 50 357 83 328 83 H72 C43 83 36 50 20 50Z"
            fill="none" stroke="#B8913D" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="bn-name">{surah.name}</span>
      </span>
      <Medallion label="آياتها" value={toArabicNum(surah.numberOfAyahs)} />
      <span className="bn-wing flip"><Wing /></span>
    </div>
  );
}

const OPEN_NAMES = { 1: 'سُورَةُ ٱلْفَاتِحَةِ', 2: 'سُورَةُ ٱلْبَقَرَةِ' };
const PHRASE_CYCLE = [0, 1, 4, -1, 3, 2, -1]; // colour index per phrase (-1 = none)

export default function MushafPage({
  pageNum, side, tajweed = true, phrases = true, variant = 'easy',
  selectedNumber, playingNumber, revealed, hideText, onAyah, fontScale = 1,
}) {
  const bodyRef = useRef(null);
  const textRef = useRef(null);
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const version = tajweed ? 'v2' : 'v1';
  const ROWS = pageNum <= 2 ? 8 : 15;       // printed lines on the page (the two opening pages have 8)
  const OPENING = pageNum <= 2;
  const ROWS_FOR_TEXT = pageNum === 1 ? 8 : 7;   // opening pages: text lines available (page 2 also has the basmalah row)
  const BANNER_ROWS = 1.4;                   // a surah banner is taller than a text line
  const GRID = OPENING ? 9 : 15 + (data ? data.banners.length * (BANNER_ROWS - 1) : 0);   // row height = text-area height / GRID

  // Exact line layout + the page's glyph font
  useEffect(() => {
    let cancelled = false;
    setData(null); setFailed(false);
    Promise.all([fetchQcfPage(pageNum), loadQcfFont(pageNum, version)])
      .then(([d]) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [pageNum, version]);

  // verse key -> ayah record (for selection / audio / centring), built locally
  const byKey = useMemo(() => {
    const m = {};
    (data ? data.keys : []).forEach(k => { m[`${k.surah}:${k.ayah}`] = ayahRecord(k.surah, k.ayah); });
    return m;
  }, [data]);

  // Build the rows (one per printed line)
  const rows = useMemo(() => {
    if (!data) return [];
    const bannerAt = {}, basmalahAt = {};
    data.banners.forEach(b => { bannerAt[b.bannerLine] = b.surah; if (b.basmalahLine) basmalahAt[b.basmalahLine] = true; });

    // phrase ids across the page (a phrase ends at a pause mark or the end of an ayah)
    let phrase = 0;
    const out = [];
    if (OPENING) {
      // Opening pages: the words flow into a few large, centred lines (like the printed design), after the basmalah row
      const flow = [];
      let phraseNo = 0;
      for (let n = 1; n <= ROWS; n++) {
        if (basmalahAt[n]) out.push({ n, type: 'basmalah' });
        else (data.lines[n] || []).forEach(w => {
          flow.push({ ...w, phrase: phraseNo });
          if (w.end || w.pause) phraseNo++;
        });
      }
      out.push({ n: 99, type: 'flow', words: flow });
      return out;
    }
    for (let n = 1; n <= ROWS; n++) {
      if (bannerAt[n]) { if (!OPENING) out.push({ n, type: 'banner', surah: bannerAt[n] }); continue; }   // opening pages carry the name in their frame
      if (basmalahAt[n]) { out.push({ n, type: 'basmalah' }); continue; }
      const words = (data.lines[n] || []).map(w => {
        const item = { ...w, phrase };
        if (w.end || w.pause) phrase++;
        return item;
      });
      // a line that closes a surah is centred instead of justified
      const last = words[words.length - 1];
      const a = last && byKey[last.verseKey];
      const center = !!(last && last.end && a && a.numberInSurah === a.surah.numberOfAyahs);
      out.push({ n, type: 'line', words, center });
    }
    return out;
  }, [data, ROWS, byKey, OPENING, pageNum]);

  // Largest glyph size at which every line fits the page width
  useLayoutEffect(() => {
    const body = bodyRef.current, text = textRef.current;
    if (!body || !text || !data) return;
    const fit = () => {
      const rowH = body.clientHeight / GRID;
      text.style.setProperty('--row', `${rowH}px`);
      const flow = text.querySelector('.mb-flow');
      if (flow) {
        // largest size whose wrapped text still fits the lines available (rows minus the basmalah row)
        const target = ROWS_FOR_TEXT;
        let size = rowH * 1.05 * fontScale;
        text.style.fontSize = `${size}px`;
        let guard = 0;
        while (size > 10 && guard++ < 80 && flow.getBoundingClientRect().height > target * rowH + 2) {
          size -= 1;
          text.style.fontSize = `${size}px`;
        }
        return;
      }
      const lines = [...text.querySelectorAll('.mb-line')];
      if (!lines.length) return;
      // measure at a large reference size, then scale linearly so the widest line exactly fills the page
      text.style.fontSize = '100px';
      const widest = Math.max(...lines.map(l => l.scrollWidth));
      const width = lines[0].clientWidth;
      let size = Math.min(rowH * 1.1 * fontScale, (100 * width) / widest * 0.995);
      text.style.fontSize = `${size}px`;
      let guard = 0;                                   // rare rounding overflow
      while (size > 8 && guard++ < 6 && lines.some(l => l.scrollWidth > l.clientWidth + 1)) {
        size -= 0.5;
        text.style.fontSize = `${size}px`;
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(body);
    return () => ro.disconnect();
  }, [data, rows, ROWS, GRID, fontScale, variant, version, ROWS_FOR_TEXT]);

  const renderWord = (w, i) => {
    const a = byKey[w.verseKey];
    const cls = [
      'mb-w',
      w.end && 'end',
      a && selectedNumber === a.number && 'selected',
      a && playingNumber === a.number && 'playing',
      a && revealed && revealed.has(a.number) && 'revealed',
    ].filter(Boolean).join(' ');
    return <span key={i} className={cls} onClick={() => a && onAyah && onAyah(a)}>{version === 'v2' ? w.v2 : w.v1}</span>;
  };

  // group consecutive words of one phrase so the colour band runs across them
  const renderLine = (row) => {
    const groups = [];
    row.words.forEach((w, i) => {
      const g = groups[groups.length - 1];
      if (g && g.phrase === w.phrase && !w.end) g.items.push([w, i]);
      else groups.push({ phrase: w.phrase, items: [[w, i]], end: w.end });
    });
    return groups.map((g, gi) => {
      const c = g.end && g.items.length === 1 ? -1 : PHRASE_CYCLE[g.phrase % PHRASE_CYCLE.length];
      return (
        <React.Fragment key={gi}>
          <span className={c >= 0 ? `ph ph-${c}` : 'ph'}>
            {g.items.map(([w, i], k) => <React.Fragment key={i}>{k > 0 ? ' ' : ''}{renderWord(w, i)}</React.Fragment>)}
          </span>{' '}
        </React.Fragment>
      );
    });
  };

  const surahInfo = (n) => ayahRecord(n, 1).surah;

  const bodyEl = (
          <div className="mb-body" ref={bodyRef}>
            {(!data && !failed) && <div className="mb-loading"><div className="spinner" /></div>}
            {failed && <div className="mb-loading mb-failed">تعذّر تحميل الصفحة</div>}
            <div
              className={`mb-text${hideText ? ' is-hidden' : ''}`} ref={textRef} dir="rtl"
              style={{ fontFamily: `'${qcfFamily(pageNum, version)}', 'Amiri Quran', serif` }}
            >
              {rows.map(row => {
                if (row.type === 'banner') return <SurahBanner key={row.n} surah={surahInfo(row.surah)} />;
                if (row.type === 'flow') return (
                  <p key="flow" className="mb-flow">
                    {(() => {
                      // keep a word and the ayah medallion that follows it on the same line
                      const tokens = [];
                      row.words.forEach((w, i) => {
                        if (w.end && tokens.length) tokens[tokens.length - 1].push([w, i]);
                        else tokens.push([[w, i]]);
                      });
                      const groups = [];
                      tokens.forEach(tok => {
                        const ph = tok[0][0].phrase;
                        const g = groups[groups.length - 1];
                        if (g && g.phrase === ph) g.tokens.push(tok);
                        else groups.push({ phrase: ph, tokens: [tok] });
                      });
                      return groups.map((g, gi) => {
                        const c = PHRASE_CYCLE[g.phrase % PHRASE_CYCLE.length];
                        return (
                          <React.Fragment key={gi}>
                            {gi > 0 ? ' ' : ''}
                            <span className={c >= 0 ? `ph ph-${c}` : 'ph'}>
                              {g.tokens.map((tok, ti) => (
                                <React.Fragment key={ti}>
                                  {ti > 0 ? ' ' : ''}
                                  <span className="nb">{tok.map(([w, i]) => renderWord(w, i))}</span>
                                </React.Fragment>
                              ))}
                            </span>
                          </React.Fragment>
                        );
                      });
                    })()}
                  </p>
                );
                if (row.type === 'basmalah') return <div key={row.n} className="mb-bismillah">{BISMILLAH}</div>;
                return <div key={row.n} className={`mb-line${row.center ? ' center' : ''}`}>{renderLine(row)}</div>;
              })}
            </div>
          </div>
  );

  if (OPENING) {
    return (
      <div className={`mb-page mb-page-${side} mb-opening op-page${tajweed ? '' : ' no-tajweed'}${phrases ? '' : ' no-phrases'} v-${variant}`}>
        <div className="op-rule" aria-hidden="true" />
        {['tl', 'tr', 'bl', 'br'].map(c => <span key={c} className={`op-corner ${c}`} aria-hidden="true" />)}
        <div className="op-name">{OPEN_NAMES[pageNum]}</div>
        <div className="op-body-wrap">{bodyEl}</div>
        <span className="op-pageno">{toArabicNum(pageNum)}</span>
      </div>
    );
  }

  return (
    <div className={`mb-page mb-page-${side}${OPENING ? ' mb-opening' : ''}${tajweed ? '' : ' no-tajweed'}${phrases ? '' : ' no-phrases'} v-${variant}`}>
      <div className="mb-ring">
        {['tl','tr','bl','br'].map(c => <span key={c} className={`mb-orn mb-corner ${c}`} />)}
        {['t','b','l','r'].map(e => <span key={e} className={`mb-orn mb-edge ${e}`} />)}
        <div className="mb-inner">
          {bodyEl}

          <span className="mb-pageno">{toArabicNum(pageNum)}</span>
          <div className="mb-legend">
            {LEGEND.map(l => (
              <span key={l.rule} className={`tj-${l.rule}`}><i />{l.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
