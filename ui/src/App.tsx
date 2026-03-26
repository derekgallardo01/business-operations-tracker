import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { api, WorkOrder, DashboardMetrics, Employee, Category } from './api';

type Page = 'dashboard' | 'workorders' | 'employees';

function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div className="app">
      <header className="header">
        <h1>Operations Tracker</h1>
        <nav className="nav">
          <button className={page === 'dashboard' ? 'active' : ''} onClick={() => setPage('dashboard')}>Dashboard</button>
          <button className={page === 'workorders' ? 'active' : ''} onClick={() => setPage('workorders')}>Work Orders</button>
          <button className={page === 'employees' ? 'active' : ''} onClick={() => setPage('employees')}>Employees</button>
        </nav>
      </header>
      <main className="main">
        {page === 'dashboard' && <Dashboard />}
        {page === 'workorders' && <WorkOrders />}
        {page === 'employees' && <Employees />}
      </main>
    </div>
  );
}

function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<WorkOrder[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getDashboardMetrics(), api.getWorkOrders()])
      .then(([m, wo]) => { setMetrics(m); setRecentOrders(wo.slice(0, 5)); })
      .catch(e => setError(e.message));
  }, []);

  if (error) return <div className="error">Failed to load: {error}</div>;
  if (!metrics) return <div className="loading">Loading...</div>;

  return (
    <>
      <div className="metrics-grid">
        <div className="metric-card info"><div className="label">Total</div><div className="value">{metrics.totalWorkOrders}</div></div>
        <div className="metric-card info"><div className="label">New</div><div className="value">{metrics.newCount}</div></div>
        <div className="metric-card warning"><div className="label">In Progress</div><div className="value">{metrics.inProgressCount}</div></div>
        <div className="metric-card"><div className="label">On Hold</div><div className="value">{metrics.onHoldCount}</div></div>
        <div className="metric-card success"><div className="label">Completed</div><div className="value">{metrics.completedCount}</div></div>
        <div className="metric-card alert"><div className="label">Overdue</div><div className="value">{metrics.overdueCount}</div></div>
        <div className="metric-card alert"><div className="label">Critical Open</div><div className="value">{metrics.criticalOpenCount}</div></div>
        <div className="metric-card"><div className="label">Avg Resolution (hrs)</div><div className="value">{metrics.avgResolutionHours}</div></div>
      </div>

      <div className="table-container">
        <div className="table-header"><h2>Recent Work Orders</h2></div>
        <WorkOrderTable orders={recentOrders} />
      </div>
    </>
  );
}

function WorkOrders() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    const filters: Record<string, string> = {};
    if (statusFilter) filters.status = statusFilter;
    if (priorityFilter) filters.priority = priorityFilter;
    api.getWorkOrders(filters).then(setOrders).catch(e => setError(e.message));
  }, [statusFilter, priorityFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.getCategories().then(setCategories); }, []);

  if (error) return <div className="error">Failed to load: {error}</div>;

  return (
    <>
      <div className="table-container">
        <div className="table-header">
          <h2>Work Orders ({orders.length})</h2>
          <div className="filters">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option>New</option>
              <option>In Progress</option>
              <option>On Hold</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New</button>
          </div>
        </div>
        <WorkOrderTable orders={orders} />
      </div>

      {showCreate && (
        <CreateWorkOrder
          categories={categories}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </>
  );
}

function WorkOrderTable({ orders }: { orders: WorkOrder[] }) {
  if (!orders.length) return <div className="loading">No work orders found</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Category</th>
          <th>Assigned To</th>
          <th>Due Date</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {orders.map(o => (
          <tr key={o.workOrderID}>
            <td>{o.workOrderID}</td>
            <td>{o.title}</td>
            <td><span className={`badge ${o.priority.toLowerCase()}`}>{o.priority}</span></td>
            <td><span className={`badge ${o.status.toLowerCase().replace(' ', '-')}`}>{o.status}</span></td>
            <td>{o.categoryName}</td>
            <td>{o.assignedToName || '—'}</td>
            <td>
              {o.dueDate ? new Date(o.dueDate).toLocaleDateString() : '—'}
              {o.isOverdue === 1 && <span className="overdue"> OVERDUE</span>}
            </td>
            <td>{o.openClosed}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CreateWorkOrder({ categories, onClose, onCreated }: {
  categories: Category[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', categoryID: '', priority: 'Medium',
    requestedByID: '', assignedToID: '', dueDate: '', estimatedHours: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { api.getEmployees().then(setEmployees); }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createWorkOrder({
        title: form.title,
        description: form.description,
        categoryID: Number(form.categoryID),
        priority: form.priority,
        requestedByID: Number(form.requestedByID),
        assignedToID: form.assignedToID ? Number(form.assignedToID) : null,
        dueDate: form.dueDate || null,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : null,
      });
      onCreated();
    } catch {
      alert('Failed to create work order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-panel" onClick={e => e.stopPropagation()}>
        <h2>New Work Order</h2>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Title *</label>
            <input required value={form.title} onChange={set('title')} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={set('description')} />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select required value={form.categoryID} onChange={set('categoryID')}>
              <option value="">Select...</option>
              {categories.map(c => <option key={c.categoryID} value={c.categoryID}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select value={form.priority} onChange={set('priority')}>
              <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
            </select>
          </div>
          <div className="form-group">
            <label>Requested By *</label>
            <select required value={form.requestedByID} onChange={set('requestedByID')}>
              <option value="">Select...</option>
              {employees.map(e => <option key={e.employeeID} value={e.employeeID}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Assign To</label>
            <select value={form.assignedToID} onChange={set('assignedToID')}>
              <option value="">Unassigned</option>
              {employees.map(e => <option key={e.employeeID} value={e.employeeID}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={form.dueDate} onChange={set('dueDate')} />
          </div>
          <div className="form-group">
            <label>Estimated Hours</label>
            <input type="number" step="0.5" value={form.estimatedHours} onChange={set('estimatedHours')} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Map<number, string>>(new Map());
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getEmployees(), api.getDepartments()])
      .then(([emps, depts]) => {
        setEmployees(emps);
        setDepartments(new Map(depts.map(d => [d.departmentID, d.name])));
      })
      .catch(e => setError(e.message));
  }, []);

  if (error) return <div className="error">Failed to load: {error}</div>;
  if (!employees.length) return <div className="loading">Loading...</div>;

  return (
    <div className="card-grid">
      {employees.map(e => (
        <div key={e.employeeID} className="employee-card">
          <h3>{e.firstName} {e.lastName}</h3>
          <p>{e.email}</p>
          {e.phone && <p>{e.phone}</p>}
          <p>{departments.get(e.departmentID) || 'Unknown'}</p>
          <span className={`role-badge ${e.role.toLowerCase()}`}>{e.role}</span>
        </div>
      ))}
    </div>
  );
}

export default App;
