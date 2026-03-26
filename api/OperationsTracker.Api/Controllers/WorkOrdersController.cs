using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using OperationsTracker.Api.Models;

namespace OperationsTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkOrdersController : ControllerBase
{
    private readonly string _connectionString;

    public WorkOrdersController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    [HttpGet]
    public async Task<IActionResult> GetWorkOrders(
        [FromQuery] string? status = null,
        [FromQuery] string? priority = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? assignedToId = null,
        [FromQuery] bool overdueOnly = false)
    {
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryAsync<WorkOrder>(
            "sp_GetWorkOrders",
            new { Status = status, Priority = priority, CategoryID = categoryId, AssignedToID = assignedToId, OverdueOnly = overdueOnly },
            commandType: System.Data.CommandType.StoredProcedure);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetWorkOrder(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryFirstOrDefaultAsync<WorkOrder>(
            "SELECT * FROM vw_WorkOrders WHERE WorkOrderID = @Id",
            new { Id = id });
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateWorkOrder([FromBody] CreateWorkOrderRequest request)
    {
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryFirstAsync<WorkOrder>(
            "sp_CreateWorkOrder",
            new
            {
                request.Title,
                request.Description,
                request.CategoryID,
                request.Priority,
                request.RequestedByID,
                request.AssignedToID,
                request.DueDate,
                request.EstimatedHours
            },
            commandType: System.Data.CommandType.StoredProcedure);
        return CreatedAtAction(nameof(GetWorkOrder), new { id = result.WorkOrderID }, result);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryFirstOrDefaultAsync<WorkOrder>(
            "sp_UpdateWorkOrderStatus",
            new { WorkOrderID = id, request.NewStatus, request.ChangedByID, request.Notes },
            commandType: System.Data.CommandType.StoredProcedure);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{id}/assign")]
    public async Task<IActionResult> AssignWorkOrder(int id, [FromBody] AssignWorkOrderRequest request)
    {
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryFirstOrDefaultAsync<WorkOrder>(
            "sp_AssignWorkOrder",
            new { WorkOrderID = id, request.AssignedToID, request.ChangedByID },
            commandType: System.Data.CommandType.StoredProcedure);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{id}/hours")]
    public async Task<IActionResult> LogHours(int id, [FromBody] LogHoursRequest request)
    {
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryFirstOrDefaultAsync(
            "sp_LogHours",
            new { WorkOrderID = id, request.Hours },
            commandType: System.Data.CommandType.StoredProcedure);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetComments(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryAsync<Comment>(
            @"SELECT c.CommentID, c.WorkOrderID, c.CommentText, c.CreatedDate,
                     e.FirstName + ' ' + e.LastName AS AuthorName
              FROM Comments c
              INNER JOIN Employees e ON c.AuthorID = e.EmployeeID
              WHERE c.WorkOrderID = @Id
              ORDER BY c.CreatedDate DESC",
            new { Id = id });
        return Ok(result);
    }

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(int id, [FromBody] AddCommentRequest request)
    {
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryFirstAsync<Comment>(
            "sp_AddComment",
            new { WorkOrderID = id, request.AuthorID, request.CommentText },
            commandType: System.Data.CommandType.StoredProcedure);
        return CreatedAtAction(nameof(GetComments), new { id }, result);
    }
}
