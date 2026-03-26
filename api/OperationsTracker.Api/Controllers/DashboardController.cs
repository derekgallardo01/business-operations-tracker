using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using OperationsTracker.Api.Models;

namespace OperationsTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly string _connectionString;

    public DashboardController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics()
    {
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryFirstAsync<DashboardMetrics>(
            "SELECT * FROM vw_DashboardMetrics");
        return Ok(result);
    }

    [HttpGet("workload")]
    public async Task<IActionResult> GetTeamWorkload()
    {
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryAsync<TeamWorkload>(
            "SELECT * FROM vw_TeamWorkload ORDER BY AssignedOrders DESC");
        return Ok(result);
    }
}
