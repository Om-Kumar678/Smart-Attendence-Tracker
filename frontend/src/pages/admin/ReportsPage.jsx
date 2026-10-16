import { useMemo, useState } from 'react';
import { Download, FileBarChart, Filter } from 'lucide-react';
import { AttendanceChart } from '../../components/Charts.jsx';
import { DataTable, EmptyState, PageHeader, StatCard, StatusBadge } from '../../components/UI.jsx';
import useResource from '../../hooks/useResource.js';
import { downloadCsv } from '../../utils/csv.js';
import { attendanceTrend } from '../../utils/attendance.js';

export default function ReportsPage() {
  const { items, loading, error, refresh } = useResource('attendance');
  const [period, setPeriod] = useState('Monthly');
  const [classFilter, setClassFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const classes = [...new Set(items.map((row) => row.className).filter(Boolean))];
  const subjects = [...new Set(items.map((row) => row.subject).filter(Boolean))];
  const students = [...new Set(items.map((row) => row.student).filter(Boolean))];
  const rows = useMemo(() => {
    const latestDate = items.map((row) => row.date).filter(Boolean).sort().at(-1);
    const lowerBound = latestDate && period !== 'Semester' ? new Date(`${latestDate}T00:00:00`) : null;
    if (lowerBound && period === 'Weekly') lowerBound.setDate(lowerBound.getDate() - 6);
    if (lowerBound && period === 'Monthly') lowerBound.setMonth(lowerBound.getMonth() - 1);
    return items.filter((row) =>
      (classFilter === 'all' || row.className === classFilter) &&
      (subjectFilter === 'all' || row.subject === subjectFilter) &&
      (studentFilter === 'all' || row.student === studentFilter) &&
      (!dateFilter || row.date === dateFilter) &&
      (!lowerBound || new Date(`${row.date}T00:00:00`) >= lowerBound) &&
      (period !== 'Daily' || row.date === latestDate)
    );
  }, [items, classFilter, subjectFilter, studentFilter, dateFilter, period]);
  const summary = useMemo(() => ['Present', 'Absent', 'Late', 'On Leave'].map((status) => [status, rows.filter((row) => row.status === status).length]), [rows]);
  const chartData = attendanceTrend(rows);
  return <div className="page-content"><PageHeader eyebrow="INSIGHTS & ANALYTICS" title="Attendance reports" description="Understand attendance patterns across your campus." action={<button className="button button-secondary" onClick={() => downloadCsv('attendance-report.csv', rows)}><Download size={16} /> Export CSV</button>} />
    <div className="report-filters"><span><Filter size={16} /> Filter report</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Semester</option></select><select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}><option value="all">All classes</option>{classes.map((name) => <option key={name}>{name}</option>)}</select><select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option value="all">All subjects</option>{subjects.map((name) => <option key={name}>{name}</option>)}</select><select value={studentFilter} onChange={(event) => setStudentFilter(event.target.value)}><option value="all">All students</option>{students.map((name) => <option key={name}>{name}</option>)}</select><input type="date" aria-label="Filter by date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} /></div>
    <section className="stats-grid report-stats">{summary.map(([status, count]) => <StatCard key={status} label={status} value={count} icon={FileBarChart} tone={status === 'Present' ? 'green' : status === 'Absent' ? 'amber' : status === 'Late' ? 'blue' : 'indigo'} detail={`${period.toLowerCase()} records`} />)}</section>
    <article className="panel chart-panel report-chart"><div className="panel-heading"><div><h2>Attendance trend</h2><p>Average daily attendance rate</p></div><span className="chart-period">{period}</span></div>{chartData.length ? <AttendanceChart data={chartData} height={280} /> : <EmptyState title="No records for this report" description="Adjust the filters or submit attendance to see a trend." />}</article>
    <section className="panel"><div className="panel-heading report-table-heading"><div><h2>Attendance records</h2><p>Detailed records for the selected class</p></div></div><DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'student', label: 'Student' }, { key: 'rollNumber', label: 'Roll number' }, { key: 'className', label: 'Class' }, { key: 'subject', label: 'Subject' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }]} rows={rows} loading={loading} error={error} onRetry={refresh} /></section>
  </div>;
}
