import React from 'react';

export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}
