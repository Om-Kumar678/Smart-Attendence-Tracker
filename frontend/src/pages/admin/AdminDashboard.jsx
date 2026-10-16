import { ArrowRight, BookOpen, CalendarDays, ClipboardCheck, GraduationCap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AttendanceChart } from '../../components/Charts.jsx';
import { EmptyState, ErrorMessage, LoadingSpinner, PageHeader, ProgressBar, StatCard, StatusBadge } from '../../components/UI.jsx';
import useResource from '../../hooks/useResource.js';
import { attendancePercentage, attendanceTrend, groupAttendance } from '../../utils/attendance.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminDashboard() {
  const { user } = useAuth();
  const students = useResource('students');
  const teachers = useResource('teachers');
  const classes = useResource('classes');
  const attendance = useResource('attendance');
  const sources = [students, teachers, classes, attendance];
  const failed = sources.find((item) => item.error);
  const busy = sources.some((item) => item.loading);
  const studentRates = groupAttendance(attendance.items, 'student');
  const lowAttendance = studentRates.filter((student) => student.rate !== null && student.rate < 75);
  const trend = attendanceTrend(attendance.items);
  const average = attendancePercentage(attendance.items);
  return <div className="page-content">
    <PageHeader eyebrow={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()} title={`Good morning, ${user.name?.split(' ')[0] || 'there'}`} description="Here’s what’s happening across your campus today." action={<Link to="/admin/reports" className="button button-secondary"><CalendarDays size={16} /> View reports</Link>} />
    {busy ? <LoadingSpinner label="Loading campus overview" /> : failed ? <ErrorMessage message={failed.error} onRetry={failed.refresh} /> : <>
      <section className="stats-grid">
        <StatCard label="Total students" value={students.items.length.toLocaleString()} detail="Across all classes" icon={Users} tone="indigo" />
        <StatCard label="Faculty members" value={teachers.items.length} detail="Teaching staff" icon={GraduationCap} tone="blue" />
        <StatCard label="Active classes" value={classes.items.length} detail="Currently listed" icon={BookOpen} tone="amber" />
        <StatCard label="Attendance rate" value={average === null ? '—' : `${average}%`} detail={`${attendance.items.length} attendance records`} icon={ClipboardCheck} tone="green" />
      </section>
      <section className="dashboard-grid dashboard-grid-main">
        <article className="panel chart-panel"><div className="panel-heading"><div><h2>Attendance overview</h2><p>Daily attendance from submitted records</p></div><span className="chart-period">Recent classes</span></div>{trend.length ? <AttendanceChart data={trend} type="bar" dataKey="rate" xKey="day" height={272} /> : <EmptyState title="No attendance data yet" description="Attendance trends appear after records are submitted." />}<div className="chart-footer"><span><i className="legend-dot indigo-dot" /> Present rate</span><span><i className="legend-dot muted-dot" /> Target: 75%</span><Link to="/admin/reports">Full report <ArrowRight size={14} /></Link></div></article>
        <article className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Latest submitted attendance records</p></div></div>
          {attendance.items.length ? <div className="activity-list">{[...attendance.items].slice(-4).reverse().map((record) => <div className="activity-item" key={record.id}><span className="activity-icon purple"><ClipboardCheck size={16} /></span><div className="activity-copy"><strong>{record.student}</strong><span>{record.subject} · {record.className}</span></div><StatusBadge status={record.status} /></div>)}</div> : <EmptyState title="No recent records" description="Newly submitted attendance will appear here." />}
          <Link className="activity-link" to="/admin/reports">View attendance reports <ArrowRight size={14} /></Link>
        </article>
      </section>
      <section className="dashboard-grid dashboard-grid-lower">
        <article className="panel low-panel"><div className="panel-heading"><div><h2>Needs attention</h2><p>Students below 75% attendance</p></div><span className="attention-count">{lowAttendance.length.toString().padStart(2, '0')}</span></div>
          {lowAttendance.length ? <div className="low-list">{lowAttendance.slice(0, 4).map((student) => <div className="low-row" key={student.name}><div className="avatar avatar-soft">{student.name.split(' ').map((part) => part[0]).join('')}</div><div className="low-person"><strong>{student.name}</strong><small>{student.records.length} recorded classes</small></div><div className="low-progress"><ProgressBar value={student.rate} /></div><span className="low-percent">{student.rate}%</span></div>)}</div> : <EmptyState title="No alerts to show" description="Low-attendance alerts appear when enough records are available." />}
          <Link className="panel-footer-link" to="/admin/students">View all students <ArrowRight size={14} /></Link>
        </article>
        <article className="panel quick-panel"><div className="panel-heading"><div><h2>Quick actions</h2><p>Common tasks, right at your fingertips</p></div></div><div className="quick-actions"><QuickAction to="/admin/students" icon={Users} title="Add a student" caption="Create student profile" /><QuickAction to="/admin/teachers" icon={GraduationCap} title="Add a teacher" caption="Invite faculty member" /><QuickAction to="/admin/classes" icon={BookOpen} title="Create a class" caption="Set up a new class" /><QuickAction to="/admin/reports" icon={ClipboardCheck} title="View reports" caption="Explore attendance data" /></div></article>
      </section>
    </>}
  </div>;
}

function QuickAction({ to, icon: Icon, title, caption }) {
  return <Link to={to} className="quick-action"><span className="quick-icon"><Icon size={17} /></span><span><strong>{title}</strong><small>{caption}</small></span><ArrowRight size={15} /></Link>;
}
