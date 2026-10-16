import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { DataTable, PageHeader, ProgressBar, StatusBadge } from '../../components/UI.jsx';
import { listMyAttendance } from '../../services/dataService.js';
import { downloadCsv } from '../../utils/csv.js';
import { attendancePercentage, groupAttendance } from '../../utils/attendance.js';

export default function StudentAttendancePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('all');
  const [date, setDate] = useState('');
  async function refresh() {
    setLoading(true);
    setError('');
    try { setItems(await listMyAttendance()); }
    catch (requestError) { setError(requestError.message || 'Unable to load your attendance.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);
  const subjects = [...new Set(items.map((row) => row.subject).filter(Boolean))];
  const subjectStats = useMemo(() => groupAttendance(items, 'subject'), [items]);
  const rows = useMemo(() => items.filter((row) => (subject === 'all' || row.subject === subject) && (!date || row.date === date)), [items, subject, date]);
  const now = new Date();
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstWeekday = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7;
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const dayStatuses = new Map();
  for (const record of items) {
    const [year, month, day] = (record.date || '').split('-').map(Number);
    if (year !== now.getFullYear() || month !== now.getMonth() + 1) continue;
    const status = String(record.status || '').toLowerCase();
    const current = dayStatuses.get(day);
    if (!current || status === 'absent' || (status === 'late' && current === 'present')) dayStatuses.set(day, status);
  }
  return <div className="page-content"><PageHeader eyebrow="YOUR LEARNING JOURNEY" title="My attendance" description="Keep track of the classes you’ve attended this semester." action={<button className="button button-secondary" onClick={() => downloadCsv('my-attendance.csv', rows)} disabled={!rows.length}><Download size={16} /> Export</button>} />
    {loading ? <div className="state-panel">Loading your attendance…</div> : error ? <div className="state-panel error-state">{error}</div> : subjectStats.length > 0 && <section className="subject-grid attendance-subject-grid">{subjectStats.map(({ name, records, rate }) => <article className="subject-card" key={name}><div className="subject-card-head"><span className="subject-icon">{name.slice(0, 2).toUpperCase()}</span><span className={rate < 75 ? 'subject-warning' : 'subject-rate'}>{rate}%</span></div><strong>{name}</strong><small>{records.filter((row) => ['present', 'late'].includes(String(row.status).toLowerCase())).length} attended · {records.filter((row) => ['present', 'late', 'absent'].includes(String(row.status).toLowerCase())).length} total</small><ProgressBar value={rate} /></article>)}</section>}
    <section className="panel attendance-calendar-panel"><div className="panel-heading"><div><h2>{monthName} at a glance</h2><p>Attendance by class date</p></div><div className="calendar-legend"><span><i className="calendar-present" /> Present</span><span><i className="calendar-absent" /> Absent</span><span><i className="calendar-late" /> Late</span></div></div><div className="calendar-grid">{['M','T','W','T','F','S','S'].map((day, index) => <span className="calendar-weekday" key={`${day}${index}`}>{day}</span>)}{Array.from({ length: firstWeekday }, (_, index) => <span key={`blank-${index}`} />)}{days.map((day) => { const status = dayStatuses.get(day); return <span className={`calendar-day ${status === 'present' ? 'day-present' : status === 'absent' ? 'day-absent' : status === 'late' ? 'day-late' : status === 'on leave' ? 'day-empty' : ''}`} key={day} title={status ? `Marked ${status}` : 'No attendance record'}>{day}</span>; })}</div></section>
    <div className="report-filters"><span>Attendance details</span><select value={subject} onChange={(event) => setSubject(event.target.value)}><option value="all">All subjects</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div>
    <section className="panel"><DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'subject', label: 'Subject' }, { key: 'className', label: 'Class' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }]} rows={rows} loading={loading} error={error} onRetry={refresh} /></section>
  </div>;
}
