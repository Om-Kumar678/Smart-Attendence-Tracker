import { useState } from 'react';
import { LockKeyhole, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../components/UI.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { changePassword, updateStudentProfile } from '../../services/authService.js';

export default function StudentProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  async function saveProfile(event) {
    event.preventDefault();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) return toast.error('Enter a valid name and email address.');
    try { const updated = await updateStudentProfile({ name, email }); updateUser(updated); toast.success('Profile updated.'); }
    catch (error) { toast.error(error.message || 'Unable to update your profile.'); }
  }
  async function submitPasswordChange(event) {
    event.preventDefault();
    if (passwords.current.length < 6 || passwords.next.length < 8) return toast.error('Enter your current password and a new password of at least 8 characters.');
    if (passwords.next !== passwords.confirm) return toast.error('The new passwords do not match.');
    try { await changePassword({ currentPassword: passwords.current, newPassword: passwords.next }); toast.success('Password updated.'); setPasswords({ current: '', next: '', confirm: '' }); }
    catch (error) { toast.error(error.message || 'Unable to update your password.'); }
  }
  return <div className="page-content"><PageHeader eyebrow="YOUR ACCOUNT" title="My profile" description="Manage your personal details and account security." /><div className="profile-layout"><section className="panel profile-card"><div className="profile-banner" /><div className="profile-photo-wrap"><span className="profile-photo">{user.initials || user.name.split(' ').map((part) => part[0]).join('')}</span></div><h2>{user.name}</h2><p>{user.title || 'Student · Northstar College'}</p><div className="profile-id-card"><div><small>ROLL NUMBER</small><strong>{user.rollNumber || 'Not provided'}</strong></div><div><small>COURSE & SEMESTER</small><strong>{[user.course, user.semester].filter(Boolean).join(' · ') || 'Not provided'}</strong></div><div><small>CLASS</small><strong>{user.className || 'Not provided'}</strong></div></div></section>
    <div className="profile-forms"><form className="panel profile-form" onSubmit={saveProfile}><div className="panel-heading"><div><h2>Personal information</h2><p>Update the details associated with your account.</p></div></div><label className="field-label">Full name<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label className="field-label">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label className="field-label">Course<input value={user.course || 'Not provided'} disabled /></label><div className="form-actions"><button className="button button-primary"><Save size={16} /> Save profile</button></div></form>
      <form className="panel profile-form" onSubmit={submitPasswordChange}><div className="panel-heading"><div><h2><LockKeyhole size={17} /> Change password</h2><p>Use a strong password you don’t use elsewhere.</p></div></div>{[['current','Current password'],['next','New password'],['confirm','Confirm new password']].map(([key,label]) => <label className="field-label" key={key}>{label}<input type="password" value={passwords[key]} onChange={(event) => setPasswords((old) => ({ ...old, [key]: event.target.value }))} required /></label>)}<div className="form-actions"><button className="button button-secondary">Update password</button></div></form>
    </div></div></div>;
}
