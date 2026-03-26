import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api, WorkOrder, Category } from '../../api';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { CreateWorkOrderModal } from './CreateWorkOrderModal';
import { WorkOrderDetail } from './WorkOrderDetail';
import { useToast } from '../common/Toast';
import { useWorkOrderSignalR } from '../../useWorkOrderSignalR';

type SortField = 'workOrderID' | 'title' | 'priority' | 'status' | 'dueDate' | 'createdDate';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

function exportToCsv(orders: WorkOrder[]) {
  const headers = ['ID', 'Title', 'Priority', 'Status', 'Category', 'Requested By', 'Assigned To', 'Due Date', 'Created', 'Est Hours', 'Actual Hours', 'Overdue'];
  const rows = orders.map(o => [
    o.workOrderID,
    `"${o.title.replace(/"/g, '""')}"`,
    o.priority,
    o.status,
    o.categoryName,
    o.requestedByName,
    o.assignedToName || '',
    o.dueDate ? new Date(o.dueDate).toLocaleDateString() : '',
    new Date(o.createdDate).toLocaleDateString(),
    o.estimatedHours ?? '',
    o.actualHours ?? '',
    o.isOverdue === 1 ? 'Yes' : 'No',
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `work-orders-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function WorkOrderList() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('workOrderID');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    const filters: Record<string, string> = {};
    if (statusFilter) filters.status = statusFilter;
    if (priorityFilter) filters.priority = priorityFilter;
    api.getWorkOrders(filters)
      .then(data => { setOrders(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [statusFilter, priorityFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.getCategories().then(setCategories); }, []);
  useWorkOrderSignalR(load);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th className="sortable" onClick={() => handleSort(field)}>
      {children}
      {sortField === field && <span className="sort-arrow">{sortDir === 'asc' ? ' \u25B2' : ' \u25BC'}</span>}
    </th>
  );

  const filtered = useMemo(() => {
    let result = orders;

    if (categoryFilter) {
      result = result.filter(o => o.categoryName === categoryFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.categoryName.toLowerCase().includes(q) ||
        (o.assignedToName && o.assignedToName.toLowerCase().includes(q)) ||
        o.requestedByName.toLowerCase().includes(q) ||
        String(o.workOrderID).includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'workOrderID': cmp = a.workOrderID - b.workOrderID; break;
        case 'title': cmp = a.title.localeCompare(b.title); break;
        case 'priority': cmp = (PRIORITY_ORDER[a.priority] || 0) - (PRIORITY_ORDER[b.priority] || 0); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'dueDate': cmp = (a.dueDate || '').localeCompare(b.dueDate || ''); break;
        case 'createdDate': cmp = a.createdDate.localeCompare(b.createdDate); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [orders, categoryFilter, search, sortField, sortDir]);

  if (error) return <div className="error-state">Failed to load: {error}</div>;

  return (
    <>
      <div className="table-container">
        <div className="table-header">
          <div className="table-title-row">
            <h2>Work Orders</h2>
            <span className="count-badge">{filtered.length}</span>
          </div>
          <div className="filters">
            <div className="search-input">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search work orders..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option>New</option><option>In Progress</option><option>On Hold</option>
              <option>Completed</option><option>Cancelled</option>
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.categoryID} value={c.name}>{c.name}</option>)}
            </select>
            <button className="btn btn-outline" onClick={() => { exportToCsv(filtered); showToast(`Exported ${filtered.length} work orders`, 'success'); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: 4, verticalAlign: 'middle'}}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Order</button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No work orders found"
            message={search || statusFilter || priorityFilter || categoryFilter ? 'Try adjusting your filters' : 'Create your first work order to get started'}
            action={!search && !statusFilter ? { label: '+ Create Work Order', onClick: () => setShowCreate(true) } : undefined}
          />
        ) : (
          <table>
            <thead>
              <tr>
                <SortHeader field="workOrderID">ID</SortHeader>
                <SortHeader field="title">Title</SortHeader>
                <SortHeader field="priority">Priority</SortHeader>
                <SortHeader field="status">Status</SortHeader>
                <th>Category</th>
                <th>Assigned To</th>
                <SortHeader field="dueDate">Due Date</SortHeader>
                <SortHeader field="createdDate">Created</SortHeader>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr
                  key={o.workOrderID}
                  onClick={() => setSelectedId(o.workOrderID)}
                  className={`clickable-row ${selectedId === o.workOrderID ? 'selected-row' : ''}`}
                >
                  <td>#{o.workOrderID}</td>
                  <td className="title-cell">
                    {o.title}
                    {o.isOverdue === 1 && <span className="overdue-tag">OVERDUE</span>}
                  </td>
                  <td><PriorityBadge priority={o.priority} /></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{o.categoryName}</td>
                  <td>{o.assignedToName || <span className="muted-text">Unassigned</span>}</td>
                  <td>{o.dueDate ? new Date(o.dueDate).toLocaleDateString() : '—'}</td>
                  <td>{new Date(o.createdDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <CreateWorkOrderModal
          categories={categories}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}

      {selectedId && (
        <WorkOrderDetail
          workOrderId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={load}
        />
      )}
    </>
  );
}
