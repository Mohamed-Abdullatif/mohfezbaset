// Madinah Mushaf layout: exact line numbers + per-page glyph fonts (King Fahd Complex "QCF"), served by Quran.com
const API = 'https://api.quran.com/api/v4/verses/by_page';
const FONT_URL = (version, page) => `https://verses.quran.com/fonts/quran/hafs/${version}/woff2/p${page}.woff2`;
const PAUSE = /[ۖ-ۜ]/;

const pages = new Map();
const fonts = new Map();

// One page as { lines: { [lineNo]: word[] }, bismillahLines, bannerLines } (cached)
export function fetchQcfPage(page) {
  if (!pages.has(page)) {
    const url = `${API}/${page}?words=true&per_page=300&word_fields=code_v1,code_v2,line_number,page_number,char_type_name,text_uthmani`;
    const req = fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(json => parse(json.verses, page))
      .catch(err => { pages.delete(page); throw err; });
    pages.set(page, req);
  }
  return pages.get(page);
}

function parse(verses, page) {
  const lines = {};
  const banners = [];   // surahs that start on this page
  const keys = [];      // verses that have words on this page, in order
  verses.forEach(v => {
    const [surah, ayah] = v.verse_key.split(':').map(Number);
    const words = v.words.filter(w => w.page_number === page);
    if (words.length) keys.push({ surah, ayah });
    words.forEach((w, i) => {
      (lines[w.line_number] = lines[w.line_number] || []).push({
        v1: w.code_v1, v2: w.code_v2,
        end: w.char_type_name === 'end',
        pause: PAUSE.test(w.text_uthmani || ''),
        verseKey: v.verse_key, surah, ayah,
        lastOfVerse: i === words.length - 1,
      });
    });
    // A surah that starts on this page gets a banner (and a basmalah row, except Al-Fatiha and At-Tawbah)
    if (ayah === 1 && words.length && v.words[0].page_number === page) {
      const first = words[0].line_number;
      const hasBasmalah = surah !== 1 && surah !== 9;
      banners.push({ surah, bannerLine: first - (hasBasmalah ? 2 : 1), basmalahLine: hasBasmalah ? first - 1 : null });
    }
  });
  const v0 = verses[0] || {};
  return { lines, banners, keys, meta: { hizb: v0.hizb_number, juz: v0.juz_number } };
}

// Load the glyph font for a page ("v1" = plain black, "v2" = tajweed-coloured). Resolves when ready.
export function loadQcfFont(page, version = 'v1') {
  const key = `${version}:${page}`;
  if (!fonts.has(key)) {
    const family = `QCF${version}_P${page}`;
    const face = new FontFace(family, `url(${FONT_URL(version, page)}) format('woff2')`);
    fonts.set(key, face.load().then(f => { document.fonts.add(f); return family; })
      .catch(err => { fonts.delete(key); throw err; }));
  }
  return fonts.get(key);
}

export const qcfFamily = (page, version) => `QCF${version}_P${page}`;
