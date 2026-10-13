import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';

/* Resize image to max 300×300 and return base64 */
function resizeImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 300;
      const scale = Math.min(MAX / img.width, MAX / img.height, 1);
      const w = Math.round(img.width  * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = url;
  });
}

export default function Profile() {
  const { user, lang, t, logout, updateUser, progress, bookmarks, downloads } = useApp();
  const navigate  = useNavigate();
  const fileRef   = useRef();

  const [editing,   setEditing]   = useState(false);
  const [name,      setName]      = useState(user?.name || '');
  const [curPw,     setCurPw]     = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState('');
  const [preview,   setPreview]   = useState(user?.avatar || null);
  const [uploading, setUploading] = useState(false);

  if (!user) { navigate('/login'); return null; }

  const ar       = lang === 'ar';
  const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const totalMem = progress.reduce((s, p) => s + p.memorized_ayahs, 0);
  const done     = progress.filter(p => p.memorized_ayahs >= p.total_ayahs).length;
  const pct      = Math.round((totalMem / 6236) * 100);

  const openEdit  = () => { setName(user.name); setCurPw(''); setNewPw(''); setErr(''); setEditing(true); };
  const closeEdit = () => { setEditing(false); setErr(''); };

  /* Pick & upload avatar immediately */
  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const b64 = await resizeImage(file);
      setPreview(b64);
      const res = await axios.put('/api/auth/profile', { avatar: b64 });
      updateUser(res.data.user, res.data.token);
    } catch { setErr(ar ? 'فشل رفع الصورة' : 'Image upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  /* Remove avatar */
  const removeAvatar = async () => {
    setPreview(null);
    const res = await axios.put('/api/auth/profile', { avatar: null });
    updateUser(res.data.user, res.data.token);
  };

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true); setErr('');
    try {
      const res = await axios.put('/api/auth/profile', {
        name: name.trim(),
        currentPassword: curPw || undefined,
        newPassword:     newPw || undefined,
      });
      updateUser(res.data.user, res.data.token);
      setEditing(false);
    } catch (e) {
      setErr(e.response?.data?.message || (ar ? 'حدث خطأ' : 'Something went wrong'));
    } finally { setSaving(false); }
  };

  return (
    <div className="up-page">

      {/* Cover */}
      <div className="up-cover" />

      {/* Avatar */}
      <div className="up-avatar-wrap">
        <div className="up-avatar-circle">
          {preview
            ? <img src={preview} alt="avatar" className="up-avatar-img" />
            : <span className="up-avatar-initials">{initials}</span>
          }
          {uploading && (
            <div className="up-avatar-overlay"><span className="up-avatar-spinner" /></div>
          )}
        </div>

        {/* Edit button — bottom right */}
        <button className="up-edit-icon-btn" onClick={() => fileRef.current.click()}
          title={ar ? 'تغيير الصورة' : 'Change photo'}>
          ✎
        </button>

        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileChange} />
      </div>

      {/* Identity */}
      <div className="up-identity">
        <h1 className="up-name">{user.name}</h1>
        <p className="up-email">{user.email}</p>
        <div className="up-member-badge">
          <span className="up-member-icon">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M12 2c0 0-1.5 3-1.5 5.5S12 11 12 11s1.5-3.5 1.5-3.5S12 2 12 2z"/>
              <path d="M12 11v11"/>
              <path d="M12 14c0 0-3-1.5-4.5-1S5 15 5 15s2.5.5 4.5-.5S12 14 12 14z"/>
              <path d="M12 14c0 0 3-1.5 4.5-1S19 15 19 15s-2.5.5-4.5-.5S12 14 12 14z"/>
              <path d="M12 18c0 0-3-1.5-4.5-1S5 19 5 19s2.5.5 4.5-.5S12 18 12 18z"/>
              <path d="M12 18c0 0 3-1.5 4.5-1S19 19 19 19s-2.5.5-4.5-.5S12 18 12 18z"/>
            </svg>
          </span>
          <span>{ar ? 'عضو في المحفظ البسيط' : 'Member of Mohafez Baseet'}</span>
          {user.created_at && (
            <span className="up-member-since">
              {ar ? 'منذ' : 'since'}{' '}
              {new Date(user.created_at).toLocaleDateString(ar ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' })}
            </span>
          )}
        </div>
        {preview && !uploading && (
          <button className="up-remove-photo" onClick={removeAvatar}>
            {ar ? 'حذف الصورة' : 'Remove photo'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="up-stats-row">
        <div className="up-stat">
          <span className="up-stat-n">{pct}%</span>
          <span className="up-stat-l">{ar ? 'نسبة الحفظ' : 'Memorized'}</span>
        </div>
        <div className="up-stat-div" />
        <div className="up-stat">
          <span className="up-stat-n">{done}</span>
          <span className="up-stat-l">{ar ? 'سور مكتملة' : 'Surahs'}</span>
        </div>
        <div className="up-stat-div" />
        <div className="up-stat">
          <span className="up-stat-n">{bookmarks.length}</span>
          <span className="up-stat-l">{ar ? 'إشارات' : 'Bookmarks'}</span>
        </div>
        <div className="up-stat-div" />
        <div className="up-stat">
          <span className="up-stat-n">{downloads.length}</span>
          <span className="up-stat-l">{ar ? 'تحميلات' : 'Downloads'}</span>
        </div>
      </div>

      {/* Body */}
      <div className="up-body">

        {!editing ? (
          <div className="up-card">
            <div className="up-card-header">
              <span>{ar ? 'معلومات الحساب' : 'Account'}</span>
              <button className="up-edit-link" onClick={openEdit}>✎ {ar ? 'تعديل' : 'Edit'}</button>
            </div>
            <div className="up-field">
              <span className="up-field-label">{ar ? 'الاسم' : 'Name'}</span>
              <span className="up-field-val">{user.name}</span>
            </div>
            <div className="up-field">
              <span className="up-field-label">{ar ? 'البريد' : 'Email'}</span>
              <span className="up-field-val" style={{ fontFamily:'var(--font-en)', direction:'ltr' }}>{user.email}</span>
            </div>
            <div className="up-field" style={{ borderBottom:'none' }}>
              <span className="up-field-label">{ar ? 'رقم الحساب' : 'ID'}</span>
              <span className="up-field-val" style={{ color:'var(--text3)' }}>#{user.id}</span>
            </div>
          </div>
        ) : (
          <div className="up-card">
            <div className="up-card-header">
              <span>{ar ? 'تعديل البيانات' : 'Edit Profile'}</span>
              <button className="up-edit-link" onClick={closeEdit}>{ar ? 'إلغاء' : 'Cancel'}</button>
            </div>
            <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group" style={{ margin:0 }}>
                <label className="form-label">{ar ? 'الاسم الكامل' : 'Full Name'}</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin:0 }}>
                <label className="form-label">{ar ? 'كلمة المرور الحالية' : 'Current Password'}</label>
                <input className="form-input" type="password" autoComplete="current-password"
                  placeholder={ar ? 'اتركه فارغاً إن لم ترد التغيير' : 'Leave blank to keep current'}
                  value={curPw} onChange={e => setCurPw(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin:0 }}>
                <label className="form-label">{ar ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                <input className="form-input" type="password" autoComplete="new-password"
                  placeholder={ar ? '٦ أحرف على الأقل' : 'Min 6 characters'}
                  value={newPw} onChange={e => setNewPw(e.target.value)} />
              </div>
              {err && <p style={{ color:'#DC2626', fontSize:'.82rem', fontWeight:600, margin:0 }}>{err}</p>}
              <button className="btn btn-primary" style={{ alignSelf:'flex-start' }} onClick={save} disabled={saving}>
                {saving ? '...' : t.save}
              </button>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="up-links">
          {[
            { icon:'📖', labelAr:'ابدأ الحفظ',        labelEn:'Start Memorizing', to:'/quran'     },
            { icon:'📈', labelAr:'التقدم',              labelEn:'My Progress',      to:'/progress'  },
            { icon:'🔖', labelAr:'الإشارات المرجعية',  labelEn:'Bookmarks',        to:'/bookmarks' },
            { icon:'📥', labelAr:'التحميلات',           labelEn:'Downloads',        to:'/downloads' },
          ].map(l => (
            <button key={l.to} className="up-link-btn" onClick={() => navigate(l.to)}>
              <span className="up-link-icon">{l.icon}</span>
              <span>{ar ? l.labelAr : l.labelEn}</span>
              <span className="up-link-arrow">›</span>
            </button>
          ))}
        </div>

        <button className="up-logout" onClick={() => { logout(); navigate('/'); }}>
          {ar ? 'تسجيل الخروج' : 'Log out'}
        </button>

      </div>
    </div>
  );
}
