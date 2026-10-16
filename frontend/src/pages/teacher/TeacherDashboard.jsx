import { ArrowRight, BookOpen, ClipboardCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AttendanceChart } from '../../components/Charts.jsx';
import { DataTable, EmptyState, PageHeader, StatCard, StatusBadge } from '../../components/UI.jsx';
import useResource from '../../hooks/useResource.js';
import { attendanceTrend } from '../../utils/attendance.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const classes = useResource('teacherClasses');
  const attendance = useResource('attendance');
  const today = new Date().toISOString().slice(0, 10);
  const todaysRecords = attendance.items.filter((record) => record.date === today);
  const classesRecordedToday = new Set(todaysRecords.map((record) => record.className)).size;
  const studentCount = classes.items.reduce((total, item) => total + Number(item.studentCount || 0), 0);
  const trend = attendanceTrend(attendance.items);
  return <div className="page-content"><PageHeader eyebrow={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()} title={`Good morning, ${user.name?.split(' ')[0] || 'there'}`} description="Here’s your teaching day at a glance." action={<Link className="button button-primary" to="/teacher/attendance/take"><ClipboardCheck size={16} /> Take attendance</Link>} />
    <section className="stats-grid"><StatCard label="Assigned classes" value={classes.items.length} detail="This semester" icon={BookOpen} tone="indigo" /><StatCard label="Enrolled students" value={studentCount || '—'} detail="Across assigned classes" icon={Users} tone="blue" /><StatCard label="Classes recorded today" value={classesRecordedToday} detail={`${todaysRecords.length} attendance records`} icon={ClipboardCheck} tone="amber" /><StatCard label="Classes with attendance" value={`${classesRecordedToday} / ${classes.items.length}`} detail="Based on today's records" icon={ClipboardCheck} tone="green" /></section>
    <section className="dashboard-grid dashboard-grid-main"><article className="panel chart-panel"><div className="panel-heading"><div><h2>Class attendance</h2><p>Attendance rate from submitted records</p></div><span className="chart-period">Recent classes</span></div>{trend.length ? <AttendanceChart data={trend} type="bar" dataKey="rate" xKey="day" /> : <EmptyState title="No attendance data yet" description="Submit attendance to see your class trend." />}</article><article className="panel schedule-panel"><div className="panel-heading"><div><h2>Your classes</h2><p>Currently assigned to you</p></div></div>{classes.items.length ? <div className="schedule-list">{classes.items.slice(0, 4).map((item) => <div className="schedule-item" key={item.id}><div className="schedule-time">{item.studentCount ?? '—'}<small>STUDENTS</small></div><i className="schedule-line schedule-done" /><div className="schedule-detail"><strong>{item.name}</strong><span>{item.course} · {item.semester}</span></div></div>)}</div> : <EmptyState title="No assigned classes" description="Your assigned classes will appear here." />}<Link className="panel-footer-link" to="/teacher/classes">View all classes <ArrowRight size={14} /></Link></article></section>
    <section className="panel"><div className="panel-heading"><div><h2>Recent attendance</h2><p>Latest records from your classes</p></div><Link className="text-link" to="/teacher/attendance/history">View history <ArrowRight size={14} /></Link></div><DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'student', label: 'Student' }, { key: 'rollNumber', label: 'Roll number' }, { key: 'subject', label: 'Subject' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }]} rows={attendance.items} loading={attendance.loading || classes.loading} error={attendance.error || classes.error} onRetry={attendance.refresh} /></section>
  </div>;
}
