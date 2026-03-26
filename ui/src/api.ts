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

export const api = {
  getWorkOrders: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return fetchJson<WorkOrder[]>(`/api/workorders${params}`);
  },
  getWorkOrder: (id: number) => fetchJson<WorkOrder>(`/api/workorders/${id}`),
  createWorkOrder: (data: unknown) => postJson<WorkOrder>('/api/workorders', data),
  getDashboardMetrics: () => fetchJson<DashboardMetrics>('/api/dashboard/metrics'),
  getEmployees: () => fetchJson<Employee[]>('/api/employees'),
  getCategories: () => fetchJson<Category[]>('/api/categories'),
  getDepartments: () => fetchJson<Department[]>('/api/departments'),
};
