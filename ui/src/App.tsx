import React, { useState } from 'react';
import './App.css';
import { ToastProvider } from './components/common/Toast';
import { ThemeProvider, ThemeToggle } from './components/common/ThemeToggle';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Dashboard } from './components/dashboard/Dashboard';
import { WorkOrderList } from './components/workorders/WorkOrderList';
import { EmployeeList } from './components/employees/EmployeeList';

type Page = 'dashboard' | 'workorders' | 'employees';

const NAV_ITEMS: { key: Page; label: string; icon: React.ReactNode }[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: 'workorders',
    label: 'Work Orders',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: 'employees',
    label: 'Employees',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

const PAGE_TITLES: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of operations and team performance' },
  workorders: { title: 'Work Orders', subtitle: 'Manage and track all work orders' },
  employees: { title: 'Employees', subtitle: 'Team directory and department management' },
};

function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigateToWorkOrder = (id: number) => {
    setPage('workorders');
  };

  const { title, subtitle } = PAGE_TITLES[page];

  return (
    <ErrorBoundary>
    <ThemeProvider>
      <ToastProvider>
        <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-brand">
              <div className="sidebar-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <path d="M9 14l2 2 4-4" />
                </svg>
              </div>
              <span className="sidebar-brand-text">OpsTracker</span>
            </div>

            <nav className="sidebar-nav">
              <div className="sidebar-section-label">Main Menu</div>
              {NAV_ITEMS.map(item => (
                <button
                  key={item.key}
                  className={`sidebar-item ${page === item.key ? 'active' : ''}`}
                  onClick={() => setPage(item.key)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="sidebar-footer">
              <ThemeToggle />
              <button className="sidebar-collapse-btn" onClick={() => setSidebarCollapsed(c => !c)} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {sidebarCollapsed ? (
                    <path d="M9 18l6-6-6-6" />
                  ) : (
                    <path d="M15 18l-6-6 6-6" />
                  )}
                </svg>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="main-wrapper">
            <header className="topbar">
              <div className="topbar-left">
                <div className="page-title">
                  <h1>{title}</h1>
                  <p>{subtitle}</p>
                </div>
              </div>
              <div className="topbar-right">
                <div className="topbar-user">
                  <div className="user-avatar">DG</div>
                  <div className="user-info">
                    <span className="user-name">Derek Gallardo</span>
                    <span className="user-role">Administrator</span>
                  </div>
                </div>
              </div>
            </header>

            <main className="main" key={page}>
              {page === 'dashboard' && <Dashboard onViewWorkOrder={navigateToWorkOrder} />}
              {page === 'workorders' && <WorkOrderList />}
              {page === 'employees' && <EmployeeList />}
            </main>
          </div>
        </div>
      </ToastProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
