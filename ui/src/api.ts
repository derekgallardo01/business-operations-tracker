const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5138';

export interface WorkOrder {
  workOrderID: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  categoryName: string;
  requestedByName: string;
  requestedByEmail: string;
  requestedByDepartment: string;
  assignedToName: string | null;
  assignedToEmail: string | null;
  dueDate: string | null;
  completedDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  createdDate: string;
  updatedDate: string;
  ageInHours: number | null;
  isOverdue: number;
  openClosed: string;
}

export interface DashboardMetrics {
  totalWorkOrders: number;
  newCount: number;
  inProgressCount: number;
  onHoldCount: number;
  completedCount: number;
  cancelledCount: number;
  overdueCount: number;
  criticalOpenCount: number;
  avgResolutionHours: number;
}

export interface TeamWorkload {
  employeeID: number;
  employeeName: string;
  department: string;
  assignedOrders: number;
  inProgress: number;
  criticalItems: number;
  overdue: number;
}

export interface Employee {
  employeeID: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  departmentID: number;
  role: string;
  isActive: boolean;
  createdDate: string;
}

export interface Category {
  categoryID: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface Department {
  departmentID: number;
  name: string;
  isActive: boolean;
  createdDate: string;
}

export interface Comment {
  commentID: number;
  workOrderID: number;
  commentText: string;
  authorName: string;
  createdDate: string;
}

export interface StatusHistoryEntry {
  statusHistoryID: number;
  workOrderID: number;
  oldStatus: string | null;
  newStatus: string;
  notes: string | null;
  changedDate: string;
  changedByName: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function putJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  // Work Orders
  getWorkOrders: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return fetchJson<WorkOrder[]>(`/api/workorders${params}`);
  },
  getWorkOrder: (id: number) => fetchJson<WorkOrder>(`/api/workorders/${id}`),
  createWorkOrder: (data: unknown) => postJson<WorkOrder>('/api/workorders', data),
  updateWorkOrderStatus: (id: number, data: { status: string; changedByID: number; notes?: string }) =>
    putJson<void>(`/api/workorders/${id}/status`, data),
  assignWorkOrder: (id: number, data: { assignedToID: number; changedByID: number }) =>
    putJson<void>(`/api/workorders/${id}/assign`, data),
  logHours: (id: number, data: { hours: number }) =>
    postJson<void>(`/api/workorders/${id}/hours`, data),

  // Comments & History
  getComments: (workOrderId: number) => fetchJson<Comment[]>(`/api/workorders/${workOrderId}/comments`),
  getStatusHistory: (workOrderId: number) => fetchJson<StatusHistoryEntry[]>(`/api/workorders/${workOrderId}/history`),
  addComment: (workOrderId: number, data: { authorID: number; commentText: string }) =>
    postJson<Comment>(`/api/workorders/${workOrderId}/comments`, data),

  // Dashboard
  getDashboardMetrics: () => fetchJson<DashboardMetrics>('/api/dashboard/metrics'),
  getTeamWorkload: () => fetchJson<TeamWorkload[]>('/api/dashboard/workload'),

  // Employees
  getEmployees: () => fetchJson<Employee[]>('/api/employees'),
  getEmployee: (id: number) => fetchJson<Employee>(`/api/employees/${id}`),
  createEmployee: (data: unknown) => postJson<Employee>('/api/employees', data),

  // Categories & Departments
  getCategories: () => fetchJson<Category[]>('/api/categories'),
  getDepartments: () => fetchJson<Department[]>('/api/departments'),
};
