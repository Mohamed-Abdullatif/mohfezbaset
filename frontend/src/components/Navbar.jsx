import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { t, lang, setLang, theme, setTheme, user, logout } = useApp();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const initials = user
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '';

  const handleLogout = () => { setDropOpen(false); logout(); navigate('/'); };

  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <img className="brand-mark" src={`${import.meta.env.BASE_URL}logo-mark.webp`} alt="" width="40" height="38" />
        <span>{t.appName}</span>
      </NavLink>

      <div className="navbar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>{t.home}</NavLink>
        <NavLink to="/quran" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{t.quran}</NavLink>
        {user && <>
          <NavLink to="/bookmarks" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{t.bookmarks}</NavLink>
          <NavLink to="/progress" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{t.progress}</NavLink>
          <NavLink to="/downloads" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{t.downloads}</NavLink>
        </>}
      </div>

      <div className="navbar-actions">
        {/* Theme toggle */}
        <button className="btn-icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={t.darkMode}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Language toggle */}
        <button className="lang-btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} title="Switch language">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {user ? (
          /* ── User avatar + dropdown ── */
          <div className="nav-user" ref={dropRef}>
            <button className="nav-avatar" onClick={() => setDropOpen(o => !o)} title={user.name}>
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="nav-avatar-img" />
                : <span className="nav-avatar-initials">{initials}</span>
              }
            </button>

            {dropOpen && (
              <div className="nav-dropdown">
                {/* User info header */}
                <div className="nav-drop-header">
                  <div className="nav-drop-avatar">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : initials
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="nav-drop-name">{user.name}</div>
                    <div className="nav-drop-email">{user.email}</div>
                    <div className="nav-drop-badge">
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                        <path d="M12 2c0 0-1.5 3-1.5 5.5S12 11 12 11s1.5-3.5 1.5-3.5S12 2 12 2z" />
                        <path d="M12 11v11M12 14c0 0-3-1.5-4.5-1S5 15 5 15s2.5.5 4.5-.5S12 14 12 14zM12 14c0 0 3-1.5 4.5-1S19 15 19 15s-2.5.5-4.5-.5S12 14 12 14zM12 18c0 0-3-1.5-4.5-1S5 19 5 19s2.5.5 4.5-.5S12 18 12 18zM12 18c0 0 3-1.5 4.5-1S19 19 19 19s-2.5.5-4.5-.5S12 18 12 18z" />
                      </svg>
                      {lang === 'ar' ? 'عضو في المحفظ البسيط' : 'Member'}
                    </div>
                  </div>
                </div>

                <div className="nav-drop-divider" />

                <button className="nav-drop-item" onClick={() => { setDropOpen(false); navigate('/profile'); }}>
                  <span className="nav-drop-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                  </span>
                  <span>{lang === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
                </button>
                <button className="nav-drop-item" onClick={() => { setDropOpen(false); navigate('/progress'); }}>
                  <span className="nav-drop-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                  </span>
                  <span>{t.progress}</span>
                </button>
                <button className="nav-drop-item" onClick={() => { setDropOpen(false); navigate('/bookmarks'); }}>
                  <span className="nav-drop-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                  </span>
                  <span>{t.bookmarks}</span>
                </button>
                <button className="nav-drop-item" onClick={() => { setDropOpen(false); navigate('/mushaf'); }}>
                  <span className="nav-drop-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                  </span>
                  <span>{lang === 'ar' ? 'المصحف' : 'Mushaf'}</span>
                </button>

                <div className="nav-drop-divider" />

                <button className="nav-drop-item nav-drop-danger" onClick={handleLogout}>
                  <span className="nav-drop-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  </span>
                  <span>{t.logout}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-outline btn-sm">{t.login}</NavLink>
            <NavLink to="/register" className="btn btn-primary btn-sm">{t.register}</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
