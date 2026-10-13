import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const LINKS_AR = [
  { to: '/',          label: 'الرئيسية' },
  { to: '/quran',     label: 'القرآن الكريم' },
  { to: '/bookmarks', label: 'الإشارات' },
  { to: '/progress',  label: 'التقدم' },
  { to: '/downloads', label: 'التحميلات' },
];
const LINKS_EN = [
  { to: '/',          label: 'Home' },
  { to: '/quran',     label: 'Quran' },
  { to: '/bookmarks', label: 'Bookmarks' },
  { to: '/progress',  label: 'Progress' },
  { to: '/downloads', label: 'Downloads' },
];

export default function Footer() {
  const { lang, t } = useApp();
  const { pathname } = useLocation();

  if (pathname.startsWith('/surah/')) return null;

  const links = lang === 'ar' ? LINKS_AR : LINKS_EN;
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          
          <img className="brand-mark brand-mark-sm" src={`${import.meta.env.BASE_URL}logo-mark.webp`} alt="" width="30" height="28" />
          <span className="footer-app-name">{t.appName}</span>
        </div>

        {/* Quran verse */}
        <p className="footer-verse" dir="rtl">
          وَرَتِّلِ ٱلۡقُرۡءَانَ تَرۡتِيلٗا
        </p>

        {/* Nav links */}
        <nav className="footer-nav">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className="footer-link">
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom line */}
        <div className="footer-bottom">
          <span>© {year} {t.appName}</span>
          <span className="footer-dot">·</span>
          <span>{lang === 'ar' ? 'حفظ القرآن الكريم بطريقة ميسرة' : 'Quran memorization made simple'}</span>
          <span className="footer-dot">·</span>
          <span>{lang === 'ar' ? 'بواسطة' : 'By'} <strong style={{ color: 'var(--green)', fontWeight: 700 }}>{lang === 'ar' ? 'محمد عبد اللطيف' : 'Mohamed Abdullatif'}</strong></span>
        </div>

      </div>
    </footer>
  );
}
