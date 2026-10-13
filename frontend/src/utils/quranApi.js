import axios from 'axios';

const cache = new Map();

// One page of ayahs for an edition (default: Uthmani text). Cached per session.
export function fetchPage(page, edition = 'quran-tajweed') {
  const key = `${edition}:${page}`;
  if (!cache.has(key)) {
    const req = axios.get(`/quran-api/v1/page/${page}/${edition}`)
      .then(res => res.data.data.ayahs)
      .catch(err => { cache.delete(key); throw err; });
    cache.set(key, req);
  }
  return cache.get(key);
}

// First page of a hizb (1-60)
export async function hizbStartPage(hizb) {
  const quarter = (hizb - 1) * 4 + 1;
  const res = await axios.get(`/quran-api/v1/hizbQuarter/${quarter}/quran-uthmani`);
  return res.data.data.ayahs[0].page;
}

// Parse tajweed markup: "[g[نّ]" or "[f:197[عًا]" -> [{ text, rule }]
export function parseTajweed(text) {
  const out = [];
  const re = /\[([a-z])(?::\d+)?\[([^\]]*)\]/g;
  let last = 0, m;
  const t = text.replace(/^\uFEFF/, '');
  while ((m = re.exec(t))) {
    if (m.index > last) out.push({ text: t.slice(last, m.index), rule: null });
    out.push({ text: m[2], rule: m[1] });
    last = re.lastIndex;
  }
  if (last < t.length) out.push({ text: t.slice(last), rule: null });
  return out;
}

export const hizbOfQuarter = (q) => Math.ceil(q / 4);

// Per-ayah audio (global ayah number). Falls back to Alafasy when a reciter has no ayah files.
export const ayahAudioUrl = (reciterId, ayahNumber) =>
  `https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayahNumber}.mp3`;

export const localDay = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const toArabicNum = (n) => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

// Short page-turn sound, synthesized (no asset needed)
let audioCtx;
export function playFlipSound() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const len = Math.floor(audioCtx.sampleRate * 0.12);
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    const src = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    filter.type = 'bandpass'; filter.frequency.value = 2200;
    gain.gain.value = 0.18;
    src.buffer = buf;
    src.connect(filter).connect(gain).connect(audioCtx.destination);
    src.start();
  } catch { /* sound is optional */ }
}
