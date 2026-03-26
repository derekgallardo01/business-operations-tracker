import React from 'react';

export function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;
  const cls = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`badge ${cls}`}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: string | null | undefined }) {
  if (!priority) return null;
  return <span className={`badge ${priority.toLowerCase()}`}>{priority}</span>;
}
