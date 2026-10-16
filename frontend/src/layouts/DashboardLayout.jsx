import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, Navbar } from '../components/DashboardChrome.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mockMode } = useAuth();
  return <div className="app-shell"><Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} /><div className="main-shell"><Navbar onMenuClick={() => setMobileOpen(true)} />{mockMode && <div className="demo-banner"><span>●</span> Demo data · Sample records only. Changes reset when you refresh.</div>}<main className="main-content">{children || <Outlet />}</main></div></div>;
}
