using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using OperationsTracker.Api.Models;

namespace OperationsTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    private readonly string _connectionString;

    public DepartmentsController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    [HttpGet]
    public async Task<IActionResult> GetDepartments()
    {
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryAsync<Department>(
            "SELECT * FROM Departments WHERE IsActive = 1 ORDER BY Name");
        return Ok(result);
    }
}
