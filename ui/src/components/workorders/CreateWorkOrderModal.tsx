import React, { useState, useEffect } from 'react';
import { api, Category, Employee } from '../../api';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface Props {
  categories: Category[];
  onClose: () => void;
  onCreated: () => void;
}

export function CreateWorkOrderModal({ categories, onClose, onCreated }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', categoryID: '', priority: 'Medium',
    requestedByID: '', assignedToID: '', dueDate: '', estimatedHours: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

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
      showToast('Work order created successfully', 'success');
      onCreated();
    } catch {
      showToast('Failed to create work order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New Work Order" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Title *</label>
          <input required value={form.title} onChange={set('title')} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={set('description')} />
        </div>
        <div className="form-row">
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
        </div>
        <div className="form-row">
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
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={form.dueDate} onChange={set('dueDate')} />
          </div>
          <div className="form-group">
            <label>Estimated Hours</label>
            <input type="number" step="0.5" value={form.estimatedHours} onChange={set('estimatedHours')} />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Work Order'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
