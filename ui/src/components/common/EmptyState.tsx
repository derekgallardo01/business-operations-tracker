import React from 'react';

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && <button className="btn btn-primary" onClick={action.onClick}>{action.label}</button>}
    </div>
  );
}
