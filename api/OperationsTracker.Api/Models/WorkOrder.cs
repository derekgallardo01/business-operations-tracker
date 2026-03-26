using System.ComponentModel.DataAnnotations;

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
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 200 characters")]
    public string Title { get; set; } = string.Empty;

    [StringLength(4000, ErrorMessage = "Description cannot exceed 4000 characters")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Category is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Valid category is required")]
    public int CategoryID { get; set; }

    [Required]
    [RegularExpression("^(Low|Medium|High|Critical)$", ErrorMessage = "Priority must be Low, Medium, High, or Critical")]
    public string Priority { get; set; } = "Medium";

    [Required(ErrorMessage = "Requested by is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Valid employee is required")]
    public int RequestedByID { get; set; }

    public int? AssignedToID { get; set; }
    public DateTime? DueDate { get; set; }

    [Range(0.5, 1000, ErrorMessage = "Estimated hours must be between 0.5 and 1000")]
    public decimal? EstimatedHours { get; set; }
}

public class UpdateStatusRequest
{
    [Required(ErrorMessage = "Status is required")]
    [RegularExpression("^(New|In Progress|On Hold|Completed|Cancelled)$", ErrorMessage = "Invalid status value")]
    public string NewStatus { get; set; } = string.Empty;

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Valid employee is required")]
    public int ChangedByID { get; set; }

    [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
    public string? Notes { get; set; }
}

public class AssignWorkOrderRequest
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Valid employee is required")]
    public int AssignedToID { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Valid employee is required")]
    public int ChangedByID { get; set; }
}

public class LogHoursRequest
{
    [Required]
    [Range(0.25, 100, ErrorMessage = "Hours must be between 0.25 and 100")]
    public decimal Hours { get; set; }
}
