import React, { useState, useEffect, useCallback } from 'react';
import { api, DashboardMetrics, TeamWorkload, WorkOrder } from '../../api';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useWorkOrderSignalR } from '../../useWorkOrderSignalR';

export function Dashboard({ onViewWorkOrder }: { onViewWorkOrder: (id: number) => void }) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [workload, setWorkload] = useState<TeamWorkload[]>([]);
  const [recentOrders, setRecentOrders] = useState<WorkOrder[]>([]);
  const [error, setError] = useState('');

  const loadData = useCallback(() => {
    Promise.all([api.getDashboardMetrics(), api.getTeamWorkload(), api.getWorkOrders()])
      .then(([m, w, wo]) => {
        setMetrics(m);
        setWorkload(w);
        setRecentOrders(wo.slice(0, 8));
      })
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useWorkOrderSignalR(loadData);

  if (error) return <div className="error-state">Failed to load dashboard: {error}</div>;
  if (!metrics) return <LoadingSpinner message="Loading dashboard..." />;

  const statusData = [
    { label: 'New', count: metrics.newCount, color: '#3b82f6' },
    { label: 'In Progress', count: metrics.inProgressCount, color: '#f59e0b' },
    { label: 'On Hold', count: metrics.onHoldCount, color: '#8b5cf6' },
    { label: 'Completed', count: metrics.completedCount, color: '#10b981' },
    { label: 'Cancelled', count: metrics.cancelledCount, color: '#6b7280' },
  ];
  const totalForBar = statusData.reduce((sum, d) => sum + d.count, 0);

  return (
    <>
      <div className="section-title">Overview</div>
      <div className="metrics-grid">
        <MetricCard label="Total Orders" value={metrics.totalWorkOrders} variant="info" />
        <MetricCard label="New" value={metrics.newCount} variant="info" />
        <MetricCard label="In Progress" value={metrics.inProgressCount} variant="warning" />
        <MetricCard label="Completed" value={metrics.completedCount} variant="success" />
      </div>

      <div className="section-title">Alerts</div>
      <div className="metrics-grid">
        <MetricCard label="Overdue" value={metrics.overdueCount} variant="alert" />
        <MetricCard label="Critical Open" value={metrics.criticalOpenCount} variant="alert" />
        <MetricCard label="On Hold" value={metrics.onHoldCount} variant="" />
        <MetricCard label="Avg Resolution" value={`${metrics.avgResolutionHours}h`} variant="" />
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card flex-2">
          <div className="card-header">
            <h3>Status Distribution</h3>
          </div>
          <div className="status-bar">
            {statusData.map(d => d.count > 0 && (
              <div
                key={d.label}
                className="status-bar-segment"
                style={{ flex: d.count, backgroundColor: d.color }}
                title={`${d.label}: ${d.count}`}
              />
            ))}
          </div>
          <div className="status-bar-legend">
            {statusData.map(d => (
              <div key={d.label} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: d.color }} />
                <span className="legend-label">{d.label}</span>
                <span className="legend-value">{d.count} ({totalForBar ? Math.round((d.count / totalForBar) * 100) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card flex-1">
          <div className="card-header">
            <h3>Team Workload</h3>
          </div>
          {workload.length === 0 ? (
            <p className="muted-text">No workload data</p>
          ) : (
            <div className="workload-list">
              {workload.map(w => {
                const maxOrders = Math.max(...workload.map(x => x.assignedOrders), 1);
                return (
                  <div key={w.employeeID} className="workload-item">
                    <div className="workload-info">
                      <span className="workload-name">{w.employeeName}</span>
                      <span className="workload-dept">{w.department}</span>
                    </div>
                    <div className="workload-bar-container">
                      <div
                        className="workload-bar"
                        style={{ width: `${(w.assignedOrders / maxOrders) * 100}%` }}
                      />
                      <span className="workload-count">{w.assignedOrders}</span>
                    </div>
                    {(w.criticalItems > 0 || w.overdue > 0) && (
                      <div className="workload-flags">
                        {w.criticalItems > 0 && <span className="flag-critical">{w.criticalItems} critical</span>}
                        {w.overdue > 0 && <span className="flag-overdue">{w.overdue} overdue</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3>Recent Work Orders</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(o => (
              <tr key={o.workOrderID} onClick={() => onViewWorkOrder(o.workOrderID)} className="clickable-row">
                <td>#{o.workOrderID}</td>
                <td className="title-cell">
                  {o.title}
                  {o.isOverdue === 1 && <span className="overdue-tag">OVERDUE</span>}
                </td>
                <td><PriorityBadge priority={o.priority} /></td>
                <td><StatusBadge status={o.status} /></td>
                <td>{o.assignedToName || <span className="muted-text">Unassigned</span>}</td>
                <td>{o.dueDate ? new Date(o.dueDate).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MetricCard({ label, value, variant }: { label: string; value: string | number; variant: string }) {
  return (
    <div className={`metric-card ${variant}`}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}
