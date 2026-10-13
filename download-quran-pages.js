const https = require('https');
const fs    = require('fs');
const path  = require('path');

const OUT_DIR    = path.join(__dirname, 'frontend/public/quran-pages');
const TOTAL      = 604;
const CONCURRENCY = 6;
const BASE_URL   = 'https://alquranpages.wordpress.com/wp-content/uploads/2016/09';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

let done = 0, failed = [];

const download = (n) => new Promise((resolve) => {
  const p    = String(n).padStart(3, '0');
  const file = path.join(OUT_DIR, `${p}.jpg`);

  if (fs.existsSync(file) && fs.statSync(file).size > 5000) {
    done++;
    process.stdout.write(`\r${done}/${TOTAL} pages`);
    return resolve();
  }

  const url = `${BASE_URL}/al-quran-page-${p}.jpg`;
  const tmp = file + '.tmp';
  const f   = fs.createWriteStream(tmp);

  const req = https.get(url, { timeout: 20000 }, (res) => {
    if (res.statusCode !== 200) {
      f.destroy(); fs.existsSync(tmp) && fs.unlinkSync(tmp);
      failed.push(n);
      done++;
      process.stdout.write(`\r${done}/${TOTAL} pages`);
      return resolve();
    }
    res.pipe(f);
    f.on('finish', () => {
      f.close(() => {
        fs.renameSync(tmp, file);
        done++;
        process.stdout.write(`\r${done}/${TOTAL} pages`);
        resolve();
      });
    });
  });

  req.on('error', () => {
    f.destroy(); fs.existsSync(tmp) && fs.unlinkSync(tmp);
    failed.push(n);
    done++;
    process.stdout.write(`\r${done}/${TOTAL} pages`);
    resolve();
  });

  req.on('timeout', () => {
    req.destroy();
  });
});

async function run() {
  console.log(`Downloading ${TOTAL} Quran pages to ${OUT_DIR}\n`);
  const pages = Array.from({ length: TOTAL }, (_, i) => i + 1);

  for (let i = 0; i < pages.length; i += CONCURRENCY) {
    const batch = pages.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(download));
  }

  console.log('\n');
  if (failed.length === 0) {
    console.log('✓ All 604 pages downloaded successfully.');
  } else {
    console.log(`⚠ Done. Failed pages (${failed.length}): ${failed.join(', ')}`);
    console.log('  Run the script again to retry failed pages.');
  }
}

run();
