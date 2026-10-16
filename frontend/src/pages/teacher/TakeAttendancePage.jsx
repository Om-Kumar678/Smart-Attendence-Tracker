import { useEffect, useMemo, useState } from 'react';
import { CheckCheck, Save, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { PageHeader, StatusBadge } from '../../components/UI.jsx';
import useResource from '../../hooks/useResource.js';
import { listClassStudents, saveAttendance } from '../../services/dataService.js';

const statuses = ['Present', 'Absent', 'Late', 'On Leave'];
export default function TakeAttendancePage() {
  const { items: classes } = useResource('classes');
  const { items: subjects } = useResource('subjects');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');
  const [statusMap, setStatusMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState('');
  useEffect(() => {
    if (!className) {
      setStudents([]);
      setError('');
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError('');
    listClassStudents(className).then((result) => { if (active) setStudents(result); })
      .catch((requestError) => { if (active) setError(requestError.message || 'Unable to load this class roster.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [className]);
  const selectedClass = classes.find((item) => String(item.id) === className);
  const availableSubjects = selectedClass ? subjects.filter((item) => item.className === selectedClass.name) : subjects;
  const filteredStudents = useMemo(() => students.filter((student) => `${student.name} ${student.rollNumber}`.toLowerCase().includes(search.toLowerCase())), [students, search]);
  const key = `${className}|${subject}|${date}`;
  const setStatus = (studentId, status) => { setStatusMap((current) => ({ ...current, [studentId]: status })); setSavedKey(''); };

  async function submit() {
    if (!className || !subject || !date) return toast.error('Select a class, subject, and date before saving.');
    if (!filteredStudents.length) return toast.error('There are no students to submit.');
    if (savedKey === key) return toast.info('Attendance for this class and date was already submitted.');
    const records = students.map((student) => ({ date, className: selectedClass?.name || className, subject: subjects.find((item) => String(item.id) === subject)?.name || subject, student: student.name, rollNumber: student.rollNumber, status: statusMap[student.id] || 'Present' }));
    if (!window.confirm(`Submit attendance for ${records.length} students? This action may not be reversible.`)) return;
    setSaving(true);
    try { await saveAttendance(records); setSavedKey(key); toast.success(`Attendance saved for ${records.length} students.`); }
    catch (requestError) { toast.error(requestError.message || 'Attendance could not be saved.'); }
    finally { setSaving(false); }
  }

  return <div className="page-content"><PageHeader eyebrow="CLASSROOM TOOLS" title="Take attendance" description="Mark today’s register. You can update each student before submitting." action={<button className="button button-primary" onClick={submit} disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save attendance'}</button>} />
    <section className="panel attendance-controls"><label className="field-label">Class<select value={className} disabled={saving} onChange={(event) => { setClassName(event.target.value); setSubject(''); setStatusMap({}); setSavedKey(''); }}><option value="">Select a class</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="field-label">Subject<select value={subject} disabled={saving} onChange={(event) => { setSubject(event.target.value); setSavedKey(''); }}><option value="">Select a subject</option>{availableSubjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="field-label">Date<input type="date" value={date} disabled={saving} onChange={(event) => { setDate(event.target.value); setSavedKey(''); }} /></label><div className="attendance-control-actions"><button className="button button-secondary" disabled={!students.length || loading || saving} onClick={() => { setStatusMap(Object.fromEntries(students.map((student) => [student.id, 'Present']))); setSavedKey(''); }}><CheckCheck size={16} /> Mark all present</button></div></section>
    <section className="panel attendance-roster"><div className="panel-heading"><div><h2>Student register <span className="count-pill">{students.length}</span></h2><p>Choose an attendance status for each student</p></div><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a student…" /></label></div>
      {loading ? <div className="state-panel">Loading enrolled students…</div> : error ? <div className="state-panel error-state">{error}</div> : !className ? <div className="state-panel">Choose a class to load its enrolled students.</div> : !students.length ? <div className="state-panel">No students are enrolled in this class yet.</div> : <div className="roster-list">{filteredStudents.map((student) => <div className="roster-row" key={student.id}><span className="avatar avatar-small">{student.name.split(' ').map((part) => part[0]).join('')}</span><div className="roster-name"><strong>{student.name}</strong><small>{student.rollNumber}</small></div><div className="status-options">{statuses.map((status) => <button key={status} disabled={saving} className={`status-option ${statusMap[student.id] === status ? `selected ${status.toLowerCase().replaceAll(' ', '-')}` : ''}`} onClick={() => setStatus(student.id, status)}>{status}</button>)}</div><span className="roster-current"><StatusBadge status={statusMap[student.id] || 'Present'} /></span></div>)}</div>}
      <div className="roster-footer"><span>{filteredStudents.length} of {students.length} students</span><button className="button button-primary" onClick={submit} disabled={saving || loading}><Save size={16} /> {saving ? 'Saving…' : savedKey === key ? 'Attendance saved' : 'Save attendance'}</button></div>
    </section>
  </div>;
}
