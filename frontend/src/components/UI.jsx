import { useMemo, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight, AlertCircle, Inbox, LoaderCircle } from 'lucide-react';

export function PageHeader({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{action && <div className="heading-action">{action}</div>}</div>;
}

export function StatCard({ label, value, change, icon: Icon, tone = 'indigo', detail }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19} /></div><span className="stat-label">{label}</span><div className="stat-value">{value}</div><div className="stat-foot"><span className={change?.startsWith('-') ? 'negative' : 'positive'}>{change}</span><span>{detail}</span></div></article>;
}

export function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase().replaceAll(' ', '-');
  return <span className={`status-badge ${key}`}>{status || 'Unknown'}</span>;
}

export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return <label className="search-box"><Search size={16} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />{value && <button className="icon-button compact" onClick={() => onChange('')} aria-label="Clear search"><X size={14} /></button>}</label>;
}

export function ProgressBar({ value, label }) {
  const rate = Math.min(100, Math.max(0, Number(value) || 0));
  return <div className="progress-wrap">{label && <div className="progress-label"><span>{label}</span><strong>{rate}%</strong></div>}<div className="progress-track"><span className={rate < 75 ? 'low' : ''} style={{ width: `${rate}%` }} /></div></div>;
}

export function AttendanceProgress({ value }) {
  const rate = Math.max(0, Math.min(100, Number(value) || 0));
  return <div className="attendance-ring" style={{ '--progress': `${rate * 3.6}deg` }}><div className="ring-center"><strong>{rate}%</strong><span>Attendance</span></div></div>;
}

export function LoadingSpinner({ label = 'Loading data' }) {
  return <div className="state-panel"><LoaderCircle className="spin" size={24} /><span>{label}…</span></div>;
}
export function LoadingSkeleton({ rows = 5, columns = 5 }) {
  return <div className="table-card skeleton-table" aria-label="Loading records">
    <div className="skeleton-toolbar"><span className="skeleton-line short" /><span className="skeleton-line medium" /></div>
    {Array.from({ length: rows }, (_, row) => <div className="skeleton-row" key={row}>{Array.from({ length: columns }, (_, column) => <span className={`skeleton-line ${column === 0 ? 'medium' : 'short'}`} key={column} />)}</div>)}
  </div>;
}
export function ErrorMessage({ message, onRetry }) {
  return <div className="state-panel error-state"><AlertCircle size={22} /><span>{message}</span>{onRetry && <button className="button button-secondary button-small" onClick={onRetry}>Try again</button>}</div>;
}
export function EmptyState({ title = 'Nothing here yet', description = 'Try changing your filters or add a new record.' }) {
  return <div className="empty-state"><span className="empty-icon"><Inbox size={22} /></span><strong>{title}</strong><span>{description}</span></div>;
}

export function DataTable({ columns, rows, loading, error, onRetry, rowActions, searchable = true, emptyTitle }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: '', direction: 'asc' });
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const matches = normalized ? rows.filter((row) => columns.some((column) => String(column.value ? column.value(row) : row[column.key] ?? '').toLowerCase().includes(normalized))) : rows;
    if (!sort.key) return matches;
    const column = columns.find((item) => item.key === sort.key);
    return [...matches].sort((left, right) => {
      const a = column?.value ? column.value(left) : left[sort.key];
      const b = column?.value ? column.value(right) : right[sort.key];
      const numericA = Number(a);
      const numericB = Number(b);
      const compared = a !== '' && b !== '' && Number.isFinite(numericA) && Number.isFinite(numericB)
        ? numericA - numericB
        : String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true, sensitivity: 'base' });
      return sort.direction === 'asc' ? compared : -compared;
    });
  }, [rows, columns, query, sort]);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  if (loading) return <LoadingSkeleton columns={columns.length + Number(Boolean(rowActions))} />;
  if (error) return <ErrorMessage message={error} onRetry={onRetry} />;
  return <div className="table-card">
    {searchable && <div className="table-toolbar"><span>{filtered.length} records</span><SearchBar value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search this list…" /></div>}
    {filtered.length === 0 ? <EmptyState title={emptyTitle || (rows.length ? 'No matching records' : 'No records found')} /> : <>
      <div className="table-scroll"><table><thead><tr>{columns.map((column) => <th key={column.key}><button className="table-sort" onClick={() => setSort((current) => ({ key: column.key, direction: current.key === column.key && current.direction === 'asc' ? 'desc' : 'asc' }))}>{column.label}{sort.key === column.key && <span>{sort.direction === 'asc' ? ' ↑' : ' ↓'}</span>}</button></th>)}{rowActions && <th className="actions-cell">Actions</th>}</tr></thead>
      <tbody>{pageRows.map((row, index) => <tr key={row.id ?? index}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : column.value ? column.value(row) : row[column.key] ?? '—'}</td>)}{rowActions && <td className="actions-cell">{rowActions(row)}</td>}</tr>)}</tbody></table></div>
      <div className="pagination"><span>Showing {filtered.length ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(filtered.length, safePage * pageSize)} of {filtered.length}</span><div><button className="icon-button" aria-label="Previous page" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16} /></button><span className="page-number">{safePage} / {pages}</span><button className="icon-button" aria-label="Next page" disabled={safePage >= pages} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button></div></div>
    </>}
  </div>;
}

export function Modal({ title, children, onClose, wide = false }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}><header className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></header>{children}</section></div>;
}

export function ConfirmDialog({ title, message, onConfirm, onCancel, busy = false }) {
  return <Modal title={title} onClose={onCancel}><div className="confirm-content"><p>{message}</p><div className="form-actions"><button className="button button-secondary" onClick={onCancel} disabled={busy}>Cancel</button><button className="button button-danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Delete record'}</button></div></div></Modal>;
}
