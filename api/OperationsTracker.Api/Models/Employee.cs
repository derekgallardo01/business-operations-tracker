namespace OperationsTracker.Api.Models;

public class Employee
{
    public int EmployeeID { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public int DepartmentID { get; set; }
    public string Role { get; set; } = "Staff";
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class CreateEmployeeRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public int DepartmentID { get; set; }
    public string Role { get; set; } = "Staff";
}
