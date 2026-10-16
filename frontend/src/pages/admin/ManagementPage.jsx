import { useMemo, useRef, useState } from 'react';
import { Download, Eye, Pencil, Plus, Trash2, Upload, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { DataTable, Modal, PageHeader, StatusBadge, ConfirmDialog } from '../../components/UI.jsx';
import { entityFields } from '../../services/endpoints.js';
import { createResource, deleteResource, listClassStudents, listResource, saveClassStudents, updateResource } from '../../services/dataService.js';
import { downloadCsv } from '../../utils/csv.js';
import useResource from '../../hooks/useResource.js';

const info = {
  students: { title: 'Students', desc: 'Manage student records, enrollment, and attendance status.', singular: 'Student', icon: '👩‍🎓' },
  teachers: { title: 'Teachers', desc: 'Your faculty directory, assignments, and availability.', singular: 'Teacher', icon: '👩‍🏫' },
  classes: { title: 'Classes', desc: 'Organize classes, enrollment, and faculty assignments.', singular: 'Class', icon: '🏫' },
  subjects: { title: 'Subjects', desc: 'Manage course subjects and teaching assignments.', singular: 'Subject', icon: '📚' },
};

export default function ManagementPage({ kind, audience }) {
  const resourceKey = audience === 'teacher' && kind === 'classes' ? 'teacherClasses' : kind;
  const { items, setItems, loading, error, refresh } = useResource(resourceKey);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [enrolling, setEnrolling] = useState(null);
  const [enrollmentOptions, setEnrollmentOptions] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const uploadRef = useRef(null);
  const config = info[kind];
  const fields = entityFields[kind];
  const filtered = useMemo(() => statusFilter === 'all' ? items : items.filter((item) => item.status === statusFilter), [items, statusFilter]);
  const columns = useMemo(() => {
    const chosen = audience === 'teacher' ? fields.filter((field) => field !== 'status') : fields;
    return chosen.map((key) => ({
      key,
      label: ({ rollNumber: 'Roll number', employeeId: 'Employee ID', studentCount: 'Students', className: 'Class' })[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (first) => first.toUpperCase()),
      render: (row) => key === 'name' ? <div className="table-person"><span className="avatar avatar-small">{row.name?.split(' ').map((part) => part[0]).join('')}</span><strong>{row.name}</strong></div> : key === 'status' ? <StatusBadge status={row[key]} /> : row[key] ?? '—',
    }));
  }, [fields, audience]);

  function openEdit(item = null) { setEditing(item ? { ...item } : Object.fromEntries(fields.map((field) => [field, field === 'status' ? 'Active' : '']))); }
  async function openEnrollment(classItem) {
    setBusy(true);
    try {
      const [allStudents, enrolledStudents] = await Promise.all([listResource('students'), listClassStudents(classItem.id)]);
      setEnrollmentOptions(allStudents);
      setEnrolledIds(enrolledStudents.map((student) => String(student.id)));
      setEnrolling(classItem);
    } catch (requestError) { toast.error(requestError.message || 'Unable to load class enrollment.'); }
    finally { setBusy(false); }
  }
  async function saveEnrollment(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const ids = enrolledIds.map((id) => {
        const student = enrollmentOptions.find((item) => String(item.id) === id);
        return student?.id ?? id;
      });
      await saveClassStudents(enrolling.id, ids);
      setItems((current) => current.map((item) => item.id === enrolling.id ? { ...item, studentCount: ids.length } : item));
      setEnrolling(null);
      toast.success('Class enrollment updated.');
    } catch (requestError) { toast.error(requestError.message || 'Unable to update class enrollment.'); }
    finally { setBusy(false); }
  }
  async function save(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    if (fields.some((field) => !String(payload[field] || '').trim())) return toast.error('Please complete all required fields.');
    setBusy(true);
    try {
      if (editing.id) {
        const result = await updateResource(kind, editing.id, payload);
        setItems((current) => current.map((item) => item.id === editing.id ? { ...item, ...result } : item));
        toast.success(`${config.singular} updated.`);
      } else {
        const result = await createResource(kind, payload);
        setItems((current) => [result, ...current]);
        toast.success(`${config.singular} added.`);
      }
      setEditing(null);
    } catch (requestError) { toast.error(requestError.message || `Could not save ${config.singular.toLowerCase()}.`); }
    finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true);
    try { await deleteResource(kind, deleting.id); setItems((current) => current.filter((row) => row.id !== deleting.id)); toast.success(`${config.singular} deleted.`); setDeleting(null); }
    catch (requestError) { toast.error(requestError.message || 'Delete failed.'); }
    finally { setBusy(false); }
  }
  function importCsv(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const [headerLine, ...lines] = String(reader.result).trim().split(/\r?\n/);
        const headers = headerLine.split(',').map((cell) => cell.trim());
        const rows = lines.filter(Boolean).map((line) => Object.fromEntries(line.split(',').map((cell, index) => [headers[index], cell.trim()])));
        if (!rows.length) throw new Error('The CSV has no data rows.');
        for (const row of rows) await createResource(kind, row);
        await refresh();
        toast.success(`Imported ${rows.length} ${config.title.toLowerCase()}.`);
      } catch (importError) { toast.error(importError.message || 'Import failed.'); }
      finally { event.target.value = ''; }
    };
    reader.readAsText(file);
  }

  return <div className="page-content"><PageHeader eyebrow="CAMPUS DIRECTORY" title={audience === 'teacher' ? 'My classes' : config.title} description={audience === 'teacher' ? 'Browse the classes assigned to you.' : config.desc} action={audience !== 'teacher' && <button className="button button-primary" onClick={() => openEdit()}><Plus size={17} /> Add {config.singular.toLowerCase()}</button>} />
    {audience !== 'teacher' && <div className="management-toolbar"><div className="filter-select-wrap"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All records</option><option value="Active">Active</option><option value="On leave">On leave</option></select></div>{kind === 'students' && <><input ref={uploadRef} type="file" accept=".csv,text/csv" hidden onChange={importCsv} /><button className="button button-secondary" onClick={() => uploadRef.current?.click()}><Upload size={16} /> Import CSV</button></>}<button className="button button-secondary" onClick={() => downloadCsv(`${kind}.csv`, filtered)}><Download size={16} /> Export CSV</button></div>}
    <DataTable columns={columns} rows={filtered} loading={loading} error={error} onRetry={refresh} emptyTitle={`No ${config.title.toLowerCase()} yet`} rowActions={audience !== 'teacher' ? (row) => <div className="row-actions">{kind === 'classes' && <button className="icon-button" onClick={() => openEnrollment(row)} aria-label="Manage class enrollment"><UserPlus size={15} /></button>}<button className="icon-button" onClick={() => setViewing(row)} aria-label="View details"><Eye size={16} /></button><button className="icon-button" onClick={() => openEdit(row)} aria-label="Edit record"><Pencil size={15} /></button><button className="icon-button danger-icon" onClick={() => setDeleting(row)} aria-label="Delete record"><Trash2 size={15} /></button></div> : undefined} />
    {editing && <Modal title={`${editing.id ? 'Edit' : 'Add'} ${config.singular}`} onClose={() => !busy && setEditing(null)}><form className="record-form" onSubmit={save}>{fields.map((field) => <label className="field-label" key={field}>{({ rollNumber: 'Roll number', employeeId: 'Employee ID', studentCount: 'Enrolled students', className: 'Class name' })[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, (first) => first.toUpperCase())}{field === 'status' ? <select name={field} defaultValue={editing[field] || 'Active'}><option>Active</option><option>On leave</option><option>Inactive</option></select> : <input name={field} defaultValue={editing[field] || ''} type={field === 'email' ? 'email' : field === 'studentCount' ? 'number' : 'text'} min={field === 'studentCount' ? 0 : undefined} placeholder={`Enter ${field.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}`} required />}</label>)}<div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setEditing(null)} disabled={busy}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></div></form></Modal>}
    {enrolling && <Modal title={`Enroll students · ${enrolling.name}`} onClose={() => !busy && setEnrolling(null)}><form className="enrollment-form" onSubmit={saveEnrollment}><p>Select students who belong to this class.</p>{enrollmentOptions.length ? <div className="enrollment-list">{enrollmentOptions.map((student) => <label className="enrollment-option" key={student.id}><input type="checkbox" checked={enrolledIds.includes(String(student.id))} onChange={(event) => setEnrolledIds((current) => event.target.checked ? [...current, String(student.id)] : current.filter((id) => id !== String(student.id)))} /><span className="avatar avatar-small">{student.name.split(' ').map((part) => part[0]).join('')}</span><span><strong>{student.name}</strong><small>{student.rollNumber} · {student.course}</small></span></label>)}</div> : <p>No student records are available.</p>}<div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setEnrolling(null)} disabled={busy}>Cancel</button><button className="button button-primary" disabled={busy || !enrollmentOptions.length}>{busy ? 'Saving…' : `Save enrollment (${enrolledIds.length})`}</button></div></form></Modal>}
    {viewing && <Modal title={`${config.singular} details`} onClose={() => setViewing(null)}><div className="detail-card"><div className="detail-avatar">{viewing.name?.split(' ').map((part) => part[0]).join('')}</div><h3>{viewing.name}</h3><p>{viewing.email || viewing.code || viewing.course}</p><div className="detail-grid">{Object.entries(viewing).filter(([key]) => key !== 'id' && key !== 'name').map(([key, value]) => <div key={key}><small>{key}</small><strong>{String(value)}</strong></div>)}</div></div></Modal>}
    {deleting && <ConfirmDialog title={`Delete ${config.singular.toLowerCase()}?`} message={`This will remove ${deleting.name || deleting.code} from this directory. This action cannot be undone.`} onCancel={() => setDeleting(null)} onConfirm={remove} busy={busy} />}
  </div>;
}
