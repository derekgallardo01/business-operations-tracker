using System.ComponentModel.DataAnnotations;
using FluentAssertions;
using OperationsTracker.Api.Models;

namespace OperationsTracker.Tests;

public class ValidationTests
{
    private static List<ValidationResult> ValidateModel(object model)
    {
        var results = new List<ValidationResult>();
        var context = new ValidationContext(model);
        Validator.TryValidateObject(model, context, results, validateAllProperties: true);
        return results;
    }

    [Fact]
    public void CreateWorkOrder_ValidRequest_PassesValidation()
    {
        var request = new CreateWorkOrderRequest
        {
            Title = "Fix broken pipe",
            CategoryID = 1,
            Priority = "High",
            RequestedByID = 1,
        };

        var results = ValidateModel(request);
        results.Should().BeEmpty();
    }

    [Fact]
    public void CreateWorkOrder_MissingTitle_FailsValidation()
    {
        var request = new CreateWorkOrderRequest
        {
            Title = "",
            CategoryID = 1,
            RequestedByID = 1,
        };

        var results = ValidateModel(request);
        results.Should().Contain(r => r.MemberNames.Contains("Title"));
    }

    [Fact]
    public void CreateWorkOrder_TitleTooShort_FailsValidation()
    {
        var request = new CreateWorkOrderRequest
        {
            Title = "ab",
            CategoryID = 1,
            RequestedByID = 1,
        };

        var results = ValidateModel(request);
        results.Should().Contain(r => r.MemberNames.Contains("Title"));
    }

    [Fact]
    public void CreateWorkOrder_InvalidPriority_FailsValidation()
    {
        var request = new CreateWorkOrderRequest
        {
            Title = "Valid title",
            CategoryID = 1,
            Priority = "Urgent",
            RequestedByID = 1,
        };

        var results = ValidateModel(request);
        results.Should().Contain(r => r.MemberNames.Contains("Priority"));
    }

    [Theory]
    [InlineData("Low")]
    [InlineData("Medium")]
    [InlineData("High")]
    [InlineData("Critical")]
    public void CreateWorkOrder_ValidPriorities_PassValidation(string priority)
    {
        var request = new CreateWorkOrderRequest
        {
            Title = "Valid title",
            CategoryID = 1,
            Priority = priority,
            RequestedByID = 1,
        };

        var results = ValidateModel(request);
        results.Where(r => r.MemberNames.Contains("Priority")).Should().BeEmpty();
    }

    [Fact]
    public void CreateWorkOrder_InvalidCategoryID_FailsValidation()
    {
        var request = new CreateWorkOrderRequest
        {
            Title = "Valid title",
            CategoryID = 0,
            RequestedByID = 1,
        };

        var results = ValidateModel(request);
        results.Should().Contain(r => r.MemberNames.Contains("CategoryID"));
    }

    [Fact]
    public void CreateWorkOrder_EstimatedHoursTooLow_FailsValidation()
    {
        var request = new CreateWorkOrderRequest
        {
            Title = "Valid title",
            CategoryID = 1,
            RequestedByID = 1,
            EstimatedHours = 0.1m,
        };

        var results = ValidateModel(request);
        results.Should().Contain(r => r.MemberNames.Contains("EstimatedHours"));
    }

    [Fact]
    public void UpdateStatus_InvalidStatus_FailsValidation()
    {
        var request = new UpdateStatusRequest
        {
            NewStatus = "Done",
            ChangedByID = 1,
        };

        var results = ValidateModel(request);
        results.Should().Contain(r => r.MemberNames.Contains("NewStatus"));
    }

    [Theory]
    [InlineData("New")]
    [InlineData("In Progress")]
    [InlineData("On Hold")]
    [InlineData("Completed")]
    [InlineData("Cancelled")]
    public void UpdateStatus_ValidStatuses_PassValidation(string status)
    {
        var request = new UpdateStatusRequest
        {
            NewStatus = status,
            ChangedByID = 1,
        };

        var results = ValidateModel(request);
        results.Where(r => r.MemberNames.Contains("NewStatus")).Should().BeEmpty();
    }

    [Fact]
    public void LogHours_ZeroHours_FailsValidation()
    {
        var request = new LogHoursRequest { Hours = 0 };

        var results = ValidateModel(request);
        results.Should().Contain(r => r.MemberNames.Contains("Hours"));
    }

    [Fact]
    public void LogHours_NegativeHours_FailsValidation()
    {
        var request = new LogHoursRequest { Hours = -5 };

        var results = ValidateModel(request);
        results.Should().Contain(r => r.MemberNames.Contains("Hours"));
    }

    [Fact]
    public void LogHours_ValidHours_PassesValidation()
    {
        var request = new LogHoursRequest { Hours = 2.5m };

        var results = ValidateModel(request);
        results.Should().BeEmpty();
    }

    [Fact]
    public void AssignWorkOrder_InvalidEmployeeID_FailsValidation()
    {
        var request = new AssignWorkOrderRequest
        {
            AssignedToID = 0,
            ChangedByID = 1,
        };

        var results = ValidateModel(request);
        results.Should().Contain(r => r.MemberNames.Contains("AssignedToID"));
    }

    [Fact]
    public void UpdateStatus_NotesTooLong_FailsValidation()
    {
        var request = new UpdateStatusRequest
        {
            NewStatus = "Completed",
            ChangedByID = 1,
            Notes = new string('x', 501),
        };

        var results = ValidateModel(request);
        results.Should().Contain(r => r.MemberNames.Contains("Notes"));
    }
}
