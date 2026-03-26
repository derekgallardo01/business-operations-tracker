import React, { useState } from 'react';
import './App.css';
import { ToastProvider } from './components/common/Toast';
import { ThemeProvider, ThemeToggle } from './components/common/ThemeToggle';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Dashboard } from './components/dashboard/Dashboard';
import { WorkOrderList } from './components/workorders/WorkOrderList';
import { EmployeeList } from './components/employees/EmployeeList';

type Page = 'dashboard' | 'workorders' | 'employees';

function App() {
  const [page, setPage] = useState<Page>('dashboard');

  const navigateToWorkOrder = (id: number) => {
    setPage('workorders');
  };

  return (
    <ErrorBoundary>
    <ThemeProvider>
      <ToastProvider>
        <div className="app">
          <header className="header">
            <div className="header-left">
              <div className="logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <path d="M9 14l2 2 4-4" />
                </svg>
              </div>
              <h1>Operations Tracker</h1>
            </div>
            <div className="header-right">
              <nav className="nav">
                {(['dashboard', 'workorders', 'employees'] as Page[]).map(p => (
                  <button
                    key={p}
                    className={page === p ? 'active' : ''}
                    onClick={() => setPage(p)}
                  >
                    {p === 'workorders' ? 'Work Orders' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </nav>
              <ThemeToggle />
            </div>
          </header>
          <main className="main" key={page}>
            {page === 'dashboard' && <Dashboard onViewWorkOrder={navigateToWorkOrder} />}
            {page === 'workorders' && <WorkOrderList />}
            {page === 'employees' && <EmployeeList />}
          </main>
          <footer className="footer">
            Operations Tracker &middot; Built with .NET 8 + React + Azure SQL
          </footer>
        </div>
      </ToastProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
