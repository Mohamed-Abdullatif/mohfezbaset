import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RECITERS } from '../utils/reciters';

const SURAH_NAMES = {
  1:'الفاتحة',2:'البقرة',3:'آل عمران',4:'النساء',5:'المائدة',6:'الأنعام',7:'الأعراف',
  8:'الأنفال',9:'التوبة',10:'يونس',11:'هود',12:'يوسف',
};

export default function Downloads() {
  const { t, lang, user, downloads, removeDownload } = useApp();
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

  const getReciterName = (id) => {
    const r = RECITERS.find(r => r.id === id);
    return r ? (lang === 'ar' ? r.nameAr : r.nameEn) : id;
  };

  return (
    <div className="page">
      <h1 className="page-title">📥 {t.downloads}</h1>
      <p className="page-subtitle" style={{ marginBottom: 20 }}>
        {downloads.length} {t.downloaded}
      </p>

      {downloads.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📥</div>
          <h3>{t.download}</h3>
          <p>{t.feat4Desc}</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/quran')}>{t.quran}</button>
        </div>
      ) : (
        <div className="bookmark-list">
          {downloads.map((d, i) => (
            <div key={i} className="bookmark-item">
              <span className="bookmark-icon">📥</span>
              <div className="bookmark-info" style={{ cursor: 'pointer' }} onClick={() => navigate(`/surah/${d.surah_number}`)}>
                <div className="bookmark-surah">
                  {SURAH_NAMES[d.surah_number] || `${t.surah} ${d.surah_number}`}
                </div>
                <div className="bookmark-ayah">{getReciterName(d.reciter)}</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => removeDownload(d.surah_number, d.reciter)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
