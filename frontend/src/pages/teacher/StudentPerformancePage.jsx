import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { AttendanceChart } from '../../components/Charts.jsx';
import { EmptyState, PageHeader, ProgressBar, StatusBadge } from '../../components/UI.jsx';
import useResource from '../../hooks/useResource.js';
import { downloadCsv } from '../../utils/csv.js';
import { attendancePercentage, attendanceTrend, groupAttendance } from '../../utils/attendance.js';

export default function StudentPerformancePage() {
  const students = useResource('students');
  const attendance = useResource('attendance');
  const classes = useResource('teacherClasses');
  const assignedCourses = new Set(classes.items.map((item) => item.course).filter(Boolean));
  const assignedStudents = assignedCourses.size ? students.items.filter((item) => assignedCourses.has(item.course)) : students.items;
  const classNames = new Set(classes.items.map((item) => item.name));
  const records = attendance.items.filter((item) => !classNames.size || classNames.has(item.className));
  const byStudent = useMemo(() => groupAttendance(records, 'student'), [records]);
  const ratesByName = new Map(byStudent.map((group) => [group.name, group]));
  const low = byStudent.filter((item) => item.rate !== null && item.rate < 75);
  const average = attendancePercentage(records);
  const trend = attendanceTrend(records);
  const loading = students.loading || attendance.loading || classes.loading;
  const error = students.error || attendance.error || classes.error;
  function retry() { students.refresh(); attendance.refresh(); classes.refresh(); }
  const exportRows = assignedStudents.map((student) => ({ name: student.name, rollNumber: student.rollNumber, attendance: ratesByName.get(student.name)?.rate ?? 'No records' }));
  return <div className="page-content"><PageHeader eyebrow="STUDENT SUCCESS" title="Student performance" description="Monitor individual attendance and spot students who may need support." action={<button className="button button-secondary" onClick={() => downloadCsv('student-performance.csv', exportRows)} disabled={!exportRows.length}><Download size={16} /> Export CSV</button>} />
    <div className="stats-grid"><article className="stat-card"><span className="stat-label">Students in your classes</span><strong className="stat-value">{assignedStudents.length}</strong><div className="stat-foot">Across assigned classes</div></article><article className="stat-card"><span className="stat-label">Below 75% threshold</span><strong className="stat-value">{low.length}</strong><div className="stat-foot">Consider reaching out</div></article><article className="stat-card"><span className="stat-label">Class average</span><strong className="stat-value">{average === null ? '—' : `${average}%`}</strong><div className="stat-foot">Based on recorded attendance</div></article></div>
    <article className="panel chart-panel"><div className="panel-heading"><div><h2>Historical attendance trend</h2><p>Daily class attendance based on submitted records</p></div></div>{trend.length ? <AttendanceChart data={trend} height={230} /> : <EmptyState title="No trend data yet" description="Your students’ trend appears after attendance is submitted." />}</article>
    <section className="panel performance-panel"><div className="panel-heading"><div><h2>Attendance by student</h2><p>Students under 75% are highlighted for follow-up</p></div></div>{loading ? <div className="state-panel">Loading student performance…</div> : error ? <div className="state-panel error-state">{error}<button className="button button-secondary button-small" onClick={retry}>Try again</button></div> : <div className="performance-list">{assignedStudents.map((student) => {
      const recordGroup = ratesByName.get(student.name);
      const rate = recordGroup?.rate ?? null;
      const subjects = recordGroup ? groupAttendance(recordGroup.records, 'subject').map((item) => `${item.name} ${item.rate}%`).join(' · ') : 'No attendance records';
      return <div className="performance-row" key={student.id}><span className="avatar avatar-small">{student.name.split(' ').map((part) => part[0]).join('')}</span><div className="performance-name"><strong>{student.name}</strong><small>{student.rollNumber} · {subjects}</small></div><div className="performance-bar"><ProgressBar value={rate ?? 0} /></div><strong className={rate !== null && rate < 75 ? 'low-percent' : 'normal-percent'}>{rate === null ? '—' : `${rate}%`}</strong>{rate !== null && rate < 75 && <StatusBadge status="Needs attention" />}</div>;
    })}</div>}</section>
  </div>;
}
