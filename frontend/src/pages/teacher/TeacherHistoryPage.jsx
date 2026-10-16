import { useEffect, useMemo, useState } from 'react';
import { Download, Pencil } from 'lucide-react';
import { toast } from 'react-toastify';
import { DataTable, Modal, PageHeader, StatusBadge } from '../../components/UI.jsx';
import { listAttendance, updateAttendance } from '../../services/dataService.js';
import { downloadCsv } from '../../utils/csv.js';

const statuses = ['Present', 'Absent', 'Late', 'On Leave'];

export default function TeacherHistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [className, setClassName] = useState('all');
  const [subject, setSubject] = useState('all');
  const [date, setDate] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  async function refresh() { setLoading(true); setError(''); try { setRows(await listAttendance()); } catch (e) { setError(e.message || 'Unable to load attendance history.'); } finally { setLoading(false); } }
  useEffect(() => { refresh(); }, []);
  const classes = [...new Set(rows.map((row) => row.className).filter(Boolean))];
  const subjects = [...new Set(rows.map((row) => row.subject).filter(Boolean))];
  const filtered = useMemo(() => rows.filter((row) => (className === 'all' || row.className === className) && (subject === 'all' || row.subject === subject) && (!date || row.date === date)), [rows, className, subject, date]);
  async function saveCorrection(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const updated = await updateAttendance(editing.id, { status: form.get('status') });
      setRows((current) => current.map((row) => row.id === editing.id ? { ...row, ...updated, status: updated?.status || form.get('status') } : row));
      toast.success('Attendance correction saved.');
      setEditing(null);
    } catch (requestError) { toast.error(requestError.message || 'Could not update attendance.'); }
    finally { setSaving(false); }
  }
  return <div className="page-content"><PageHeader eyebrow="CLASSROOM TOOLS" title="Attendance history" description="Review, filter, and export attendance submitted for your classes." action={<button className="button button-secondary" onClick={() => downloadCsv('class-attendance.csv', filtered)} disabled={!filtered.length}><Download size={16} /> Export CSV</button>} /><div className="report-filters"><span>Filters</span><select value={className} onChange={(event) => setClassName(event.target.value)}><option value="all">All classes</option>{classes.map((name) => <option key={name}>{name}</option>)}</select><select value={subject} onChange={(event) => setSubject(event.target.value)}><option value="all">All subjects</option>{subjects.map((name) => <option key={name}>{name}</option>)}</select><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div><section className="panel"><div className="panel-heading"><div><h2>Submitted records</h2><p>{filtered.length} records match your filters · corrections are subject to server authorization</p></div></div><DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'className', label: 'Class' }, { key: 'subject', label: 'Subject' }, { key: 'student', label: 'Student' }, { key: 'rollNumber', label: 'Roll number' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }]} rows={filtered} loading={loading} error={error} onRetry={refresh} rowActions={(row) => <button className="icon-button" onClick={() => setEditing(row)} aria-label={`Correct attendance for ${row.student}`}><Pencil size={15} /></button>} /></section>
    {editing && <Modal title="Correct attendance" onClose={() => !saving && setEditing(null)}><form className="record-form" onSubmit={saveCorrection}><div className="attendance-correction-context"><strong>{editing.student}</strong><span>{editing.date} · {editing.subject}</span></div><label className="field-label">Attendance status<select name="status" defaultValue={editing.status}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : 'Save correction'}</button></div></form></Modal>}
  </div>;
}
