namespace OperationsTracker.Api.Models;

public class WorkOrder
{
    public int WorkOrderID { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "Medium";
    public string Status { get; set; } = "New";
    public string? CategoryName { get; set; }
    public string? RequestedByName { get; set; }
    public string? RequestedByEmail { get; set; }
    public string? RequestedByDepartment { get; set; }
    public string? AssignedToName { get; set; }
    public string? AssignedToEmail { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public decimal? EstimatedHours { get; set; }
    public decimal? ActualHours { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
    public int? AgeInHours { get; set; }
    public int IsOverdue { get; set; }
    public string? OpenClosed { get; set; }
}

public class CreateWorkOrderRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryID { get; set; }
    public string Priority { get; set; } = "Medium";
    public int RequestedByID { get; set; }
    public int? AssignedToID { get; set; }
    public DateTime? DueDate { get; set; }
    public decimal? EstimatedHours { get; set; }
}

public class UpdateStatusRequest
{
    public string NewStatus { get; set; } = string.Empty;
    public int ChangedByID { get; set; }
    public string? Notes { get; set; }
}

public class AssignWorkOrderRequest
{
    public int AssignedToID { get; set; }
    public int ChangedByID { get; set; }
}

public class LogHoursRequest
{
    public decimal Hours { get; set; }
}
