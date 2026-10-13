import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const SURAH_NAMES = {
  1:'الفاتحة',2:'البقرة',3:'آل عمران',4:'النساء',5:'المائدة',6:'الأنعام',7:'الأعراف',
  8:'الأنفال',9:'التوبة',10:'يونس',11:'هود',12:'يوسف',13:'الرعد',14:'إبراهيم',
  15:'الحجر',16:'النحل',17:'الإسراء',18:'الكهف',19:'مريم',20:'طه',
};

export default function Bookmarks() {
  const { t, user, bookmarks, removeBookmark } = useApp();
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

  return (
    <div className="page">
      <h1 className="page-title">🔖 {t.bookmarks}</h1>
      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔖</div>
          <h3>{t.noBookmarks}</h3>
          <p>{t.addBookmarkHint}</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/quran')}>{t.quran}</button>
        </div>
      ) : (
        <div className="bookmark-list">
          {bookmarks.map(bm => (
            <div key={bm.id} className="bookmark-item">
              <span className="bookmark-icon">🔖</span>
              <div className="bookmark-info" style={{ cursor: 'pointer' }} onClick={() => navigate(`/surah/${bm.surah_number}`)}>
                <div className="bookmark-surah">
                  {SURAH_NAMES[bm.surah_number] || `${t.surah} ${bm.surah_number}`}
                </div>
                <div className="bookmark-ayah">{t.ayah} {bm.ayah_number}</div>
                {bm.note && <div className="bookmark-note">{bm.note}</div>}
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => removeBookmark(bm.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
