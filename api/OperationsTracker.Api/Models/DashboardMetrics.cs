namespace OperationsTracker.Api.Models;

public class DashboardMetrics
{
    public int TotalWorkOrders { get; set; }
    public int NewCount { get; set; }
    public int InProgressCount { get; set; }
    public int OnHoldCount { get; set; }
    public int CompletedCount { get; set; }
    public int CancelledCount { get; set; }
    public int OverdueCount { get; set; }
    public int CriticalOpenCount { get; set; }
    public double? AvgResolutionHours { get; set; }
}

public class TeamWorkload
{
    public int EmployeeID { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int AssignedOrders { get; set; }
    public int InProgress { get; set; }
    public int CriticalItems { get; set; }
    public int Overdue { get; set; }
}
