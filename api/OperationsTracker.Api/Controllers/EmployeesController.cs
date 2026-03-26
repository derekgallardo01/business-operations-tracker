using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using OperationsTracker.Api.Models;

namespace OperationsTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly string _connectionString;

    public EmployeesController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    [HttpGet]
    public async Task<IActionResult> GetEmployees([FromQuery] bool activeOnly = true)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = activeOnly
            ? "SELECT * FROM Employees WHERE IsActive = 1 ORDER BY LastName, FirstName"
            : "SELECT * FROM Employees ORDER BY LastName, FirstName";
        var result = await connection.QueryAsync<Employee>(sql);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetEmployee(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryFirstOrDefaultAsync<Employee>(
            "SELECT * FROM Employees WHERE EmployeeID = @Id", new { Id = id });
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeRequest request)
    {
        using var connection = new SqlConnection(_connectionString);
        var id = await connection.QuerySingleAsync<int>(
            @"INSERT INTO Employees (FirstName, LastName, Email, Phone, DepartmentID, Role)
              VALUES (@FirstName, @LastName, @Email, @Phone, @DepartmentID, @Role);
              SELECT SCOPE_IDENTITY();",
            request);
        var employee = await connection.QueryFirstAsync<Employee>(
            "SELECT * FROM Employees WHERE EmployeeID = @Id", new { Id = id });
        return CreatedAtAction(nameof(GetEmployee), new { id }, employee);
    }
}
