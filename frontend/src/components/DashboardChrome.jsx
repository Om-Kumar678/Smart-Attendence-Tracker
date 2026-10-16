import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, Search, X, LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardCheck, BarChart3, CalendarDays, UserRound, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const nav = {
  admin: [
    ['Overview', '/admin/dashboard', LayoutDashboard], ['Students', '/admin/students', Users], ['Teachers', '/admin/teachers', GraduationCap],
    ['Classes', '/admin/classes', Layers], ['Subjects', '/admin/subjects', BookOpen], ['Reports', '/admin/reports', BarChart3],
  ],
  teacher: [
    ['Overview', '/teacher/dashboard', LayoutDashboard], ['My classes', '/teacher/classes', Layers], ['Take attendance', '/teacher/attendance/take', ClipboardCheck],
    ['Attendance history', '/teacher/attendance/history', CalendarDays], ['Students', '/teacher/students', Users],
  ],
  student: [
    ['Overview', '/student/dashboard', LayoutDashboard], ['My attendance', '/student/attendance', CalendarDays], ['My profile', '/student/profile', UserRound],
  ],
};

export function Sidebar({ mobileOpen, onClose }) {
  const { user } = useAuth();
  const roleNav = nav[user.role] || [];
  const roleTitle = `${user.role[0].toUpperCase()}${user.role.slice(1)} workspace`;
  return <>
    {mobileOpen && <button className="sidebar-scrim" onClick={onClose} aria-label="Close navigation" />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><ClipboardCheck size={20} /></span><span>attendly<span className="brand-dot">.</span></span><button className="sidebar-close icon-button" onClick={onClose} aria-label="Close navigation"><X size={19} /></button></div>
      <div className="workspace-label">WORKSPACE</div><div className="workspace-select"><span className="workspace-avatar">N</span><span><strong>Northstar College</strong><small>{roleTitle}</small></span><ChevronDown size={15} /></div>
      <nav className="side-nav">{roleNav.map(([label, path, Icon]) => <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{label}</span>{label === 'Take attendance' && <i className="nav-dot" />}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-icon">✦</span><strong>Need a hand?</strong><p>Explore the quick guide to get started.</p><button onClick={() => window.alert('Ask your college administrator for help with Attendly.')}>Open help center <span>→</span></button></div><div className="sidebar-version">ATTENDLY CAMPUS · 2026</div></div>
    </aside>
  </>;
}

export function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTargets = nav[user.role] || [];
  const matches = searchValue.trim()
    ? searchTargets.filter(([label]) => label.toLowerCase().includes(searchValue.trim().toLowerCase()))
    : [];
  function goToResult(path) {
    navigate(path);
    setSearchValue('');
    setSearchOpen(false);
  }
  const page = location.pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') || 'dashboard';
  const heading = page === 'dashboard' ? 'Overview' : page.replace(/\b\w/g, (letter) => letter.toUpperCase());
  return <header className="topbar"><button className="icon-button menu-toggle" onClick={onMenuClick} aria-label="Open navigation"><Menu size={20} /></button><div className="topbar-title">{heading}</div><div className="global-search-wrap"><label className="global-search"><Search size={16} /><input placeholder="Search pages…" aria-label="Search pages" value={searchValue} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearchValue(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => { if (event.key === 'Enter' && matches[0]) goToResult(matches[0][1]); if (event.key === 'Escape') setSearchOpen(false); }} /><kbd>↵</kbd></label>{searchOpen && searchValue && <div className="search-results">{matches.length ? matches.map(([label, path, Icon]) => <button key={path} onMouseDown={(event) => event.preventDefault()} onClick={() => goToResult(path)}><Icon size={15} />{label}</button>) : <span>No pages found</span>}</div>}</div>
    <div className="topbar-actions"><div className="dropdown-wrap"><button className="icon-button notification-button" onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }} aria-label="Notifications"><Bell size={18} /><i /></button>{notificationsOpen && <div className="popover notification-popover"><strong>You're all caught up</strong><p>New attendance updates will show here.</p></div>}</div>
      <div className="dropdown-wrap"><button className="profile-trigger" onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }}><span className="avatar">{user.initials || user.name?.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span className="profile-copy"><strong>{user.name}</strong><small>{user.role}</small></span><ChevronDown size={15} /></button>{profileOpen && <div className="popover profile-popover"><div className="profile-popover-name">{user.name}</div><div className="profile-popover-email">{user.email}</div><button onClick={() => { logout(); navigate('/login'); }}><LogOut size={15} /> Sign out</button></div>}</div>
    </div>
  </header>;
}
