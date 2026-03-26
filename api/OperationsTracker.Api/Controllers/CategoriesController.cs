using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using OperationsTracker.Api.Models;

namespace OperationsTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly string _connectionString;

    public CategoriesController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryAsync<Category>(
            "SELECT * FROM Categories WHERE IsActive = 1 ORDER BY Name");
        return Ok(result);
    }
}
