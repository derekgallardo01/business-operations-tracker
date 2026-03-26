import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const cls = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`badge ${cls}`}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <span className={`badge ${priority.toLowerCase()}`}>{priority}</span>;
}
