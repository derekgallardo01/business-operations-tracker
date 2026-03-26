import React, { useState, useEffect, useCallback } from 'react';
import { api, WorkOrder, Comment, Employee, StatusHistoryEntry } from '../../api';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';

interface WorkOrderDetailProps {
  workOrderId: number;
  onClose: () => void;
  onUpdated: () => void;
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  'New': ['In Progress', 'Cancelled'],
  'In Progress': ['On Hold', 'Completed', 'Cancelled'],
  'On Hold': ['In Progress', 'Cancelled'],
  'Completed': [],
  'Cancelled': [],
};

type Tab = 'details' | 'comments' | 'activity';

export function WorkOrderDetail({ workOrderId, onClose, onUpdated }: WorkOrderDetailProps) {
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [hoursToLog, setHoursToLog] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.getWorkOrder(workOrderId),
      api.getComments(workOrderId),
      api.getStatusHistory(workOrderId),
      api.getEmployees(),
    ]).then(([o, c, h, e]) => {
      setOrder(o);
      setComments(c);
      setHistory(h);
      setEmployees(e);
      setAssignTo(String(e.find(emp => `${emp.firstName} ${emp.lastName}` === o.assignedToName)?.employeeID || ''));
      setLoading(false);
    }).catch(() => {
      showToast('Failed to load work order', 'error');
      setLoading(false);
    });
  }, [workOrderId, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    try {
      await api.updateWorkOrderStatus(order.workOrderID, {
        status: newStatus,
        changedByID: 1,
        notes: `Status changed to ${newStatus}`,
      });
      showToast(`Status updated to ${newStatus}`, 'success');
      loadData();
      onUpdated();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleAssign = async () => {
    if (!order || !assignTo) return;
    try {
      await api.assignWorkOrder(order.workOrderID, {
        assignedToID: Number(assignTo),
        changedByID: 1,
      });
      showToast('Work order assigned', 'success');
      loadData();
      onUpdated();
    } catch {
      showToast('Failed to assign work order', 'error');
    }
  };

  const handleLogHours = async () => {
    if (!order || !hoursToLog) return;
    try {
      await api.logHours(order.workOrderID, { hours: Number(hoursToLog) });
      showToast(`${hoursToLog} hours logged`, 'success');
      setHoursToLog('');
      loadData();
      onUpdated();
    } catch {
      showToast('Failed to log hours', 'error');
    }
  };

  const handleAddComment = async () => {
    if (!order || !newComment.trim() || !commentAuthor) return;
    try {
      await api.addComment(order.workOrderID, {
        authorID: Number(commentAuthor),
        commentText: newComment.trim(),
      });
      showToast('Comment added', 'success');
      setNewComment('');
      loadData();
    } catch {
      showToast('Failed to add comment', 'error');
    }
  };

  const handlePrint = () => {
    if (!order) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Work Order #${order.workOrderID} - ${order.title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a2e; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          .wo-id { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
          .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-right: 6px; border: 1px solid #d1d5db; }
          .badges { margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
          .description { background: #f9fafb; padding: 12px; border-radius: 6px; font-size: 14px; line-height: 1.6; }
          .grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; }
          .field label { display: block; font-size: 11px; color: #6b7280; text-transform: uppercase; }
          .field span { font-size: 14px; font-weight: 500; }
          .comment { padding: 10px; background: #f9fafb; border-radius: 6px; margin-bottom: 8px; font-size: 13px; }
          .comment strong { font-size: 12px; }
          .comment .date { font-size: 11px; color: #9ca3af; float: right; }
          .history-item { padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
          .history-item .date { font-size: 11px; color: #9ca3af; }
          .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${order.title}</h1>
        <div class="wo-id">Work Order #${order.workOrderID}</div>
        <div class="badges">
          <span class="badge">${order.status}</span>
          <span class="badge">${order.priority}</span>
          ${order.isOverdue === 1 ? '<span class="badge" style="color:#dc2626;border-color:#dc2626;">OVERDUE</span>' : ''}
        </div>
        ${order.description ? `<div class="section"><div class="section-title">Description</div><div class="description">${order.description}</div></div>` : ''}
        <div class="grid">
          <div class="field"><label>Category</label><span>${order.categoryName}</span></div>
          <div class="field"><label>Requested By</label><span>${order.requestedByName}</span></div>
          <div class="field"><label>Department</label><span>${order.requestedByDepartment}</span></div>
          <div class="field"><label>Assigned To</label><span>${order.assignedToName || 'Unassigned'}</span></div>
          <div class="field"><label>Created</label><span>${new Date(order.createdDate).toLocaleDateString()}</span></div>
          <div class="field"><label>Due Date</label><span>${order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '—'}</span></div>
          <div class="field"><label>Est. Hours</label><span>${order.estimatedHours ?? '—'}</span></div>
          <div class="field"><label>Actual Hours</label><span>${order.actualHours ?? '—'}</span></div>
        </div>
        ${comments.length > 0 ? `
          <div class="section">
            <div class="section-title">Comments (${comments.length})</div>
            ${comments.map(c => `<div class="comment"><strong>${c.authorName}</strong><span class="date">${new Date(c.createdDate).toLocaleString()}</span><p>${c.commentText}</p></div>`).join('')}
          </div>
        ` : ''}
        ${history.length > 0 ? `
          <div class="section">
            <div class="section-title">Activity Log</div>
            ${history.map(h => `<div class="history-item"><strong>${h.ChangedByName}</strong> changed status ${h.OldStatus ? `from <em>${h.OldStatus}</em>` : ''} to <em>${h.NewStatus}</em>${h.Notes ? ` — ${h.Notes}` : ''}<br><span class="date">${new Date(h.ChangedDate).toLocaleString()}</span></div>`).join('')}
          </div>
        ` : ''}
        <div class="footer">Printed on ${new Date().toLocaleString()} | Operations Tracker</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading || !order) {
    return (
      <div className="slide-panel open">
        <LoadingSpinner message="Loading work order..." />
      </div>
    );
  }

  const nextStatuses = STATUS_TRANSITIONS[order.status] || [];

  return (
    <>
      <div className="slide-panel-backdrop" onClick={onClose} />
      <div className="slide-panel open">
        <div className="panel-header">
          <div>
            <span className="panel-id">#{order.workOrderID}</span>
            <h2 className="panel-title">{order.title}</h2>
          </div>
          <div className="panel-actions">
            <button className="btn-icon" onClick={handlePrint} title="Print">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            </button>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="panel-tabs">
          <button className={activeTab === 'details' ? 'active' : ''} onClick={() => setActiveTab('details')}>Details</button>
          <button className={activeTab === 'comments' ? 'active' : ''} onClick={() => setActiveTab('comments')}>
            Comments {comments.length > 0 && <span className="tab-count">{comments.length}</span>}
          </button>
          <button className={activeTab === 'activity' ? 'active' : ''} onClick={() => setActiveTab('activity')}>
            Activity {history.length > 0 && <span className="tab-count">{history.length}</span>}
          </button>
        </div>

        <div className="panel-body">
          {activeTab === 'details' && (
            <>
              {/* Status & Priority */}
              <div className="detail-badges">
                <StatusBadge status={order.status} />
                <PriorityBadge priority={order.priority} />
                {order.isOverdue === 1 && <span className="overdue-tag">OVERDUE</span>}
                <span className={`badge ${order.openClosed.toLowerCase()}`}>{order.openClosed}</span>
              </div>

              {/* Status Transitions */}
              {nextStatuses.length > 0 && (
                <div className="detail-section">
                  <label className="detail-label">Change Status</label>
                  <div className="status-actions">
                    {nextStatuses.map(s => (
                      <button
                        key={s}
                        className={`btn btn-sm ${s === 'Completed' ? 'btn-success' : s === 'Cancelled' ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => handleStatusChange(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {order.description && (
                <div className="detail-section">
                  <label className="detail-label">Description</label>
                  <p className="detail-description">{order.description}</p>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="detail-grid">
                <div className="detail-field">
                  <label>Category</label>
                  <span>{order.categoryName}</span>
                </div>
                <div className="detail-field">
                  <label>Requested By</label>
                  <span>{order.requestedByName}</span>
                </div>
                <div className="detail-field">
                  <label>Department</label>
                  <span>{order.requestedByDepartment}</span>
                </div>
                <div className="detail-field">
                  <label>Created</label>
                  <span>{new Date(order.createdDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-field">
                  <label>Due Date</label>
                  <span>{order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '—'}</span>
                </div>
                <div className="detail-field">
                  <label>Age</label>
                  <span>{order.ageInHours != null ? `${Math.round(order.ageInHours / 24)}d ${order.ageInHours % 24}h` : '—'}</span>
                </div>
                <div className="detail-field">
                  <label>Est. Hours</label>
                  <span>{order.estimatedHours ?? '—'}</span>
                </div>
                <div className="detail-field">
                  <label>Actual Hours</label>
                  <span>{order.actualHours ?? '—'}</span>
                </div>
              </div>

              {/* Assignment */}
              <div className="detail-section">
                <label className="detail-label">Assigned To</label>
                <div className="inline-form">
                  <select value={assignTo} onChange={e => setAssignTo(e.target.value)}>
                    <option value="">Unassigned</option>
                    {employees.map(e => (
                      <option key={e.employeeID} value={e.employeeID}>{e.firstName} {e.lastName}</option>
                    ))}
                  </select>
                  <button className="btn btn-sm btn-primary" onClick={handleAssign}>Assign</button>
                </div>
              </div>

              {/* Log Hours */}
              {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                <div className="detail-section">
                  <label className="detail-label">Log Hours</label>
                  <div className="inline-form">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      placeholder="Hours"
                      value={hoursToLog}
                      onChange={e => setHoursToLog(e.target.value)}
                    />
                    <button className="btn btn-sm btn-primary" onClick={handleLogHours} disabled={!hoursToLog}>Log</button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'comments' && (
            <div className="detail-section">
              <div className="comments-list">
                {comments.length === 0 && <p className="muted-text">No comments yet</p>}
                {comments.map(c => (
                  <div key={c.commentID} className="comment">
                    <div className="comment-header">
                      <strong>{c.authorName}</strong>
                      <span className="comment-date">{new Date(c.createdDate).toLocaleString()}</span>
                    </div>
                    <p>{c.commentText}</p>
                  </div>
                ))}
              </div>
              <div className="comment-form">
                <select value={commentAuthor} onChange={e => setCommentAuthor(e.target.value)}>
                  <option value="">Select author...</option>
                  {employees.map(e => (
                    <option key={e.employeeID} value={e.employeeID}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  rows={3}
                />
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || !commentAuthor}
                >
                  Add Comment
                </button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="detail-section">
              {history.length === 0 ? (
                <p className="muted-text">No activity recorded</p>
              ) : (
                <div className="activity-timeline">
                  {history.map(h => (
                    <div key={h.StatusHistoryID} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <strong>{h.ChangedByName}</strong>
                          <span className="timeline-date">{new Date(h.ChangedDate).toLocaleString()}</span>
                        </div>
                        <p>
                          Changed status{' '}
                          {h.OldStatus && (
                            <>from <StatusBadge status={h.OldStatus} /> </>
                          )}
                          to <StatusBadge status={h.NewStatus} />
                        </p>
                        {h.Notes && <p className="timeline-notes">{h.Notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
