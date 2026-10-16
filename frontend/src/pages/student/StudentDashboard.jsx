import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, CalendarCheck2, CalendarX2, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AttendanceChart } from '../../components/Charts.jsx';
import { AttendanceProgress, EmptyState, PageHeader, ProgressBar, StatusBadge } from '../../components/UI.jsx';
import { monthlyAttendance, subjectsForStudent } from '../../services/mockData.js';
import { listMyAttendance } from '../../services/dataService.js';
import { MOCK_MODE } from '../../services/authService.js';
import { attendancePercentage, attendanceTrend, classesNeededForTarget, groupAttendance } from '../../utils/attendance.js';

function studentSubjects(records) {
  return groupAttendance(records, 'subject').map(({ name, records: entries, rate }) => ({
    name,
    rate,
    present: entries.filter((row) => ['present', 'late'].includes(String(row.status).toLowerCase())).length,
    total: entries.filter((row) => ['present', 'late', 'absent'].includes(String(row.status).toLowerCase())).length,
  })).filter((subject) => subject.total > 0);
}

export default function StudentDashboard() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    listMyAttendance().then(setRecords).catch((requestError) => setError(requestError.message || 'Unable to load your attendance.')).finally(() => setLoading(false));
  }, []);
  const actualSubjects = useMemo(() => studentSubjects(records), [records]);
  const displaySubjects = MOCK_MODE ? subjectsForStudent : actualSubjects;
  const trend = MOCK_MODE ? monthlyAttendance : attendanceTrend(records);
  const overall = MOCK_MODE ? 82 : attendancePercentage(records);
  const countedRecords = records.filter((record) => ['present', 'late', 'absent'].includes(String(record.status).toLowerCase()));
  const attended = MOCK_MODE ? 82 : countedRecords.filter((record) => ['present', 'late'].includes(String(record.status).toLowerCase())).length;
  const missed = MOCK_MODE ? 18 : countedRecords.filter((record) => String(record.status).toLowerCase() === 'absent').length;
  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((record) => record.date === today);
  const alerts = displaySubjects.filter((subject) => subject.rate !== null && subject.rate < 75);
  return <div className="page-content"><PageHeader eyebrow="YOUR LEARNING JOURNEY" title="Your attendance snapshot" description="A clear view of your classes and semester progress." action={<Link to="/student/attendance" className="button button-secondary">Full attendance <ArrowRight size={15} /></Link>} />
    <section className="student-hero"><div className="student-overall"><span className="hero-eyebrow">OVERALL ATTENDANCE</span><AttendanceProgress value={overall ?? 0} /><span className="hero-positive">{overall === null ? 'No attendance records yet' : `${overall}% of recorded classes`}</span></div><div className="hero-divider" /><div className="hero-stats"><div><span className="mini-stat-icon present-icon"><CalendarCheck2 size={18} /></span><span><small>Classes attended</small><strong>{attended} <em>classes</em></strong></span></div><div><span className="mini-stat-icon missed-icon"><CalendarX2 size={18} /></span><span><small>Classes missed</small><strong>{missed} <em>classes</em></strong></span></div><div><span className="mini-stat-icon today-icon"><Clock3 size={18} /></span><span><small>Today’s status</small><strong className={todayRecord?.status === 'Present' ? 'today-present' : ''}>{todayRecord?.status || 'Not recorded'}</strong></span></div></div><div className="student-target"><span>Minimum requirement</span><strong>75%</strong><div className="target-track"><i style={{ width: `${Math.min(overall ?? 0, 100)}%` }} /></div><small>{overall === null ? 'Attendance not yet recorded' : overall >= 75 ? 'You’re meeting the minimum' : 'Take action to improve your rate'}</small></div></section>
    <div className="section-title-row"><div><h2>Subject overview</h2><p>Your attendance across each subject</p></div><Link to="/student/attendance">View details <ArrowRight size={14} /></Link></div>
    {alerts.length > 0 && <section className="attendance-alert"><div className="alert-mark">!</div><div><strong>Your attendance needs a little attention</strong><p>{alerts.map((subject) => {
      const needed = classesNeededForTarget(subject.present, subject.total);
      return `${subject.name}: ${subject.rate}% — attend the next ${needed} classes in a row to reach 75%.`;
    }).join(' ')}</p></div><Link to="/student/attendance">Review <ArrowRight size={14} /></Link></section>}
    {loading ? <div className="state-panel">Loading your subject attendance…</div> : error ? <div className="state-panel error-state">{error}</div> : displaySubjects.length ? <section className="subject-grid">{displaySubjects.map((subject) => <article className="subject-card" key={subject.name}><div className="subject-card-head"><span className="subject-icon"><BookOpen size={17} /></span><span className={subject.rate < 75 ? 'subject-warning' : 'subject-rate'}>{subject.rate}%</span></div><strong>{subject.name}</strong><small>{subject.present} of {subject.total} classes attended</small><ProgressBar value={subject.rate} /></article>)}</section> : <EmptyState title="No subject attendance yet" description="Subject summaries appear after your classes submit attendance." />}
    <section className="dashboard-grid dashboard-grid-main student-lower"><article className="panel chart-panel"><div className="panel-heading"><div><h2>Monthly trend</h2><p>Your attendance rate over time</p></div><span className="chart-period">This semester</span></div>{trend.length ? <AttendanceChart data={trend} height={235} /> : <EmptyState title="No trend data yet" description="Your trend appears once attendance has been recorded." />}</article><article className="panel"><div className="panel-heading"><div><h2>Recent history</h2><p>Your latest class records</p></div></div>{error ? <div className="state-panel error-state">{error}</div> : records.length ? <div className="recent-attendance">{[...records].slice(-4).reverse().map((record) => <div key={record.id}><span className="recent-date">{new Date(`${record.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><span className="recent-subject"><strong>{record.subject}</strong><small>{record.className}</small></span><StatusBadge status={record.status} /></div>)}</div> : <EmptyState title="No attendance history" description="Your recent classes will appear here." />}<Link className="panel-footer-link" to="/student/attendance">See all attendance <ArrowRight size={14} /></Link></article></section>
  </div>;
}
