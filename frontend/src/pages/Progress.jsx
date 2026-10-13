import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const SURAH_NAMES = {
  1:'الفاتحة',2:'البقرة',3:'آل عمران',4:'النساء',5:'المائدة',6:'الأنعام',7:'الأعراف',
  8:'الأنفال',9:'التوبة',10:'يونس',11:'هود',12:'يوسف',13:'الرعد',14:'إبراهيم',
  15:'الحجر',16:'النحل',17:'الإسراء',18:'الكهف',19:'مريم',20:'طه',21:'الأنبياء',
  22:'الحج',23:'المؤمنون',24:'النور',25:'الفرقان',26:'الشعراء',27:'النمل',28:'القصص',
  29:'العنكبوت',30:'الروم',31:'لقمان',32:'السجدة',33:'الأحزاب',34:'سبأ',35:'فاطر',
  36:'يس',37:'الصافات',38:'ص',39:'الزمر',40:'غافر',41:'فصلت',42:'الشورى',43:'الزخرف',
  44:'الدخان',45:'الجاثية',46:'الأحقاف',47:'محمد',48:'الفتح',49:'الحجرات',50:'ق',
  51:'الذاريات',52:'الطور',53:'النجم',54:'القمر',55:'الرحمن',56:'الواقعة',57:'الحديد',
  58:'المجادلة',59:'الحشر',60:'الممتحنة',61:'الصف',62:'الجمعة',63:'المنافقون',
  64:'التغابن',65:'الطلاق',66:'التحريم',67:'الملك',68:'القلم',69:'الحاقة',70:'المعارج',
  71:'نوح',72:'الجن',73:'المزمل',74:'المدثر',75:'القيامة',76:'الإنسان',77:'المرسلات',
  78:'النبأ',79:'النازعات',80:'عبس',81:'التكوير',82:'الانفطار',83:'المطففين',84:'الانشقاق',
  85:'البروج',86:'الطارق',87:'الأعلى',88:'الغاشية',89:'الفجر',90:'البلد',91:'الشمس',
  92:'الليل',93:'الضحى',94:'الشرح',95:'التين',96:'العلق',97:'القدر',98:'البينة',
  99:'الزلزلة',100:'العاديات',101:'القارعة',102:'التكاثر',103:'العصر',104:'الهمزة',
  105:'الفيل',106:'قريش',107:'الماعون',108:'الكوثر',109:'الكافرون',110:'النصر',
  111:'المسد',112:'الإخلاص',113:'الفلق',114:'الناس',
};

export default function Progress() {
  const { t, lang, user, progress, prefs, savePrefs } = useApp();
  const [goalInput, setGoalInput] = useState('');
  useEffect(() => { if (prefs) setGoalInput(String(prefs.daily_goal)); }, [prefs?.daily_goal]);
  const navigate = useNavigate();

  if (!user) return (
    <div className="page">
      <div className="empty-state">
        <div className="icon">🔒</div>
        <h3>{t.loginRequired}</h3>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/login')}>{t.login}</button>
      </div>
    </div>
  );

  const totalMemorized = progress.reduce((acc, p) => acc + p.memorized_ayahs, 0);
  const totalAyahs = 6236;
  const completedSurahs = progress.filter(p => p.memorized_ayahs >= p.total_ayahs).length;
  const overallPct = Math.round((totalMemorized / totalAyahs) * 100);

  return (
    <div className="page">
      <h1 className="page-title">📈 {t.progress}</h1>

      {prefs && (() => {
        const goal = prefs.daily_goal || 5;
        const done = prefs.today_ayahs || 0;
        const pct = Math.min(100, Math.round((done / goal) * 100));
        const saveGoal = () => {
          const n = parseInt(goalInput, 10);
          if (n >= 1 && n <= 500 && n !== goal) savePrefs({ daily_goal: n });
          else setGoalInput(String(goal));
        };
        return (
          <div className="card goal-card">
            <div className="goal-head">
              <span className="goal-title">{lang === 'ar' ? 'هدف اليوم' : "Today's goal"}</span>
              <span className="goal-streak">
                🔥 {prefs.streak} {lang === 'ar' ? (prefs.streak === 1 ? 'يوم متتالي' : 'أيام متتالية') : (prefs.streak === 1 ? 'day streak' : 'day streak')}
              </span>
            </div>
            <div className="progress-item-header">
              <span className="progress-item-count">{done} / {goal} {lang === 'ar' ? 'آيات' : 'ayahs'}</span>
              <span className="progress-item-count">{pct}%</span>
            </div>
            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>
            {done >= goal && <div className="goal-done">{lang === 'ar' ? 'ما شاء الله، أتممت هدف اليوم ✓' : 'Goal reached today ✓'}</div>}
            <div className="goal-edit">
              <span>{lang === 'ar' ? 'عدد الآيات يومياً' : 'Ayahs per day'}</span>
              <input className="form-input" type="number" min="1" max="500" value={goalInput}
                onChange={e => setGoalInput(e.target.value)} onBlur={saveGoal}
                onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()} />
            </div>
          </div>
        );
      })()}

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{overallPct}%</div>
          <div className="stat-label">{t.overallProgress}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalMemorized}</div>
          <div className="stat-label">{t.ayahs} {t.memorized}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completedSurahs}</div>
          <div className="stat-label">{t.surah} {t.memorized}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{progress.length}</div>
          <div className="stat-label">{lang => `Started`}</div>
        </div>
      </div>

      <div className="progress-bar" style={{ height: 12, marginBottom: 24, borderRadius: 6 }}>
        <div className="progress-bar-fill" style={{ width: `${overallPct}%` }} />
      </div>

      {progress.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📖</div>
          <h3>{t.startMemorizing}</h3>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/quran')}>{t.quran}</button>
        </div>
      ) : (
        <div className="progress-list">
          {[...progress].sort((a, b) => b.memorized_ayahs / b.total_ayahs - a.memorized_ayahs / a.total_ayahs).map(p => {
            const pct = Math.round((p.memorized_ayahs / p.total_ayahs) * 100);
            return (
              <div key={p.surah_number} className="progress-item" style={{ cursor: 'pointer' }} onClick={() => navigate(`/surah/${p.surah_number}`)}>
                <div className="progress-item-header">
                  <span className="progress-item-name">
                    {SURAH_NAMES[p.surah_number] || `${t.surah} ${p.surah_number}`}
                  </span>
                  <span className="progress-item-count">
                    {p.memorized_ayahs} / {p.total_ayahs} ({pct}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
