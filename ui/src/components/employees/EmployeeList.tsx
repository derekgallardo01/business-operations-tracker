import React, { useState, useEffect, useMemo } from 'react';
import { api, Employee, Department } from '../../api';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Map<number, string>>(new Map());
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [deptList, setDeptList] = useState<Department[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getEmployees(), api.getDepartments()])
      .then(([emps, depts]) => {
        setEmployees(emps);
        setDeptList(depts);
        setDepartments(new Map(depts.map(d => [d.departmentID, d.name])));
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let result = employees;
    if (deptFilter) result = result.filter(e => departments.get(e.departmentID) === deptFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q)
      );
    }
    return result;
  }, [employees, deptFilter, search, departments]);

  if (error) return <div className="error-state">Failed to load: {error}</div>;
  if (loading) return <LoadingSpinner message="Loading employees..." />;

  return (
    <>
      <div className="page-header">
        <div className="table-title-row">
          <h2>Employees</h2>
          <span className="count-badge">{filtered.length}</span>
        </div>
        <div className="filters">
          <div className="search-input">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {deptList.map(d => <option key={d.departmentID} value={d.name}>{d.name}</option>)}
          </select>
        </div>
      </div>
      <div className="card-grid">
        {filtered.map(e => (
          <div key={e.employeeID} className="employee-card">
            <div className="employee-avatar">
              {e.firstName[0]}{e.lastName[0]}
            </div>
            <div className="employee-info">
              <h3>{e.firstName} {e.lastName}</h3>
              <p className="employee-email">{e.email}</p>
              {e.phone && <p className="employee-phone">{e.phone}</p>}
              <div className="employee-meta">
                <span className="dept-badge">{departments.get(e.departmentID) || 'Unknown'}</span>
                <span className={`role-badge ${e.role.toLowerCase()}`}>{e.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
