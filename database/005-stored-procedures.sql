-- ============================================
-- Stored Procedures for API Layer
-- ============================================

-- Create a new work order
CREATE PROCEDURE sp_CreateWorkOrder
    @Title NVARCHAR(200),
    @Description NVARCHAR(MAX) = NULL,
    @CategoryID INT,
    @Priority NVARCHAR(20) = 'Medium',
    @RequestedByID INT,
    @AssignedToID INT = NULL,
    @DueDate DATETIME2 = NULL,
    @EstimatedHours DECIMAL(6,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO WorkOrders (Title, Description, CategoryID, Priority, Status, RequestedByID, AssignedToID, DueDate, EstimatedHours)
    VALUES (@Title, @Description, @CategoryID, @Priority, 'New', @RequestedByID, @AssignedToID, @DueDate, @EstimatedHours);

    DECLARE @NewID INT = SCOPE_IDENTITY();

    -- Log initial status
    INSERT INTO StatusHistory (WorkOrderID, OldStatus, NewStatus, ChangedByID, Notes)
    VALUES (@NewID, NULL, 'New', @RequestedByID, 'Work order created');

    SELECT * FROM vw_WorkOrders WHERE WorkOrderID = @NewID;
END;
GO

-- Update work order status
CREATE PROCEDURE sp_UpdateWorkOrderStatus
    @WorkOrderID INT,
    @NewStatus NVARCHAR(30),
    @ChangedByID INT,
    @Notes NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @OldStatus NVARCHAR(30);
    SELECT @OldStatus = Status FROM WorkOrders WHERE WorkOrderID = @WorkOrderID;

    IF @OldStatus IS NULL
    BEGIN
        RAISERROR('Work order not found.', 16, 1);
        RETURN;
    END

    UPDATE WorkOrders
    SET Status = @NewStatus,
        UpdatedDate = GETUTCDATE(),
        CompletedDate = CASE WHEN @NewStatus = 'Completed' THEN GETUTCDATE() ELSE CompletedDate END
    WHERE WorkOrderID = @WorkOrderID;

    INSERT INTO StatusHistory (WorkOrderID, OldStatus, NewStatus, ChangedByID, Notes)
    VALUES (@WorkOrderID, @OldStatus, @NewStatus, @ChangedByID, @Notes);

    SELECT * FROM vw_WorkOrders WHERE WorkOrderID = @WorkOrderID;
END;
GO

-- Assign work order to employee
CREATE PROCEDURE sp_AssignWorkOrder
    @WorkOrderID INT,
    @AssignedToID INT,
    @ChangedByID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AssigneeName NVARCHAR(201);
    SELECT @AssigneeName = FirstName + ' ' + LastName FROM Employees WHERE EmployeeID = @AssignedToID;

    UPDATE WorkOrders
    SET AssignedToID = @AssignedToID,
        UpdatedDate = GETUTCDATE(),
        Status = CASE WHEN Status = 'New' THEN 'In Progress' ELSE Status END
    WHERE WorkOrderID = @WorkOrderID;

    -- If status changed from New, log it
    IF EXISTS (SELECT 1 FROM WorkOrders WHERE WorkOrderID = @WorkOrderID AND Status = 'In Progress')
    BEGIN
        INSERT INTO StatusHistory (WorkOrderID, OldStatus, NewStatus, ChangedByID, Notes)
        VALUES (@WorkOrderID, 'New', 'In Progress', @ChangedByID, 'Assigned to ' + @AssigneeName);
    END

    SELECT * FROM vw_WorkOrders WHERE WorkOrderID = @WorkOrderID;
END;
GO

-- Add comment to work order
CREATE PROCEDURE sp_AddComment
    @WorkOrderID INT,
    @AuthorID INT,
    @CommentText NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Comments (WorkOrderID, AuthorID, CommentText)
    VALUES (@WorkOrderID, @AuthorID, @CommentText);

    UPDATE WorkOrders SET UpdatedDate = GETUTCDATE() WHERE WorkOrderID = @WorkOrderID;

    SELECT c.CommentID, c.WorkOrderID, c.CommentText, c.CreatedDate,
           e.FirstName + ' ' + e.LastName AS AuthorName
    FROM Comments c
    INNER JOIN Employees e ON c.AuthorID = e.EmployeeID
    WHERE c.CommentID = SCOPE_IDENTITY();
END;
GO

-- Get work orders with filters
CREATE PROCEDURE sp_GetWorkOrders
    @Status NVARCHAR(30) = NULL,
    @Priority NVARCHAR(20) = NULL,
    @CategoryID INT = NULL,
    @AssignedToID INT = NULL,
    @OverdueOnly BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM vw_WorkOrders
    WHERE (@Status IS NULL OR Status = @Status)
      AND (@Priority IS NULL OR Priority = @Priority)
      AND (@CategoryID IS NULL OR CategoryName = (SELECT Name FROM Categories WHERE CategoryID = @CategoryID))
      AND (@AssignedToID IS NULL OR AssignedToName = (SELECT FirstName + ' ' + LastName FROM Employees WHERE EmployeeID = @AssignedToID))
      AND (@OverdueOnly = 0 OR IsOverdue = 1)
    ORDER BY
        CASE Priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 WHEN 'Low' THEN 4 END,
        CreatedDate DESC;
END;
GO

-- Log actual hours worked
CREATE PROCEDURE sp_LogHours
    @WorkOrderID INT,
    @Hours DECIMAL(6,2)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE WorkOrders
    SET ActualHours = ISNULL(ActualHours, 0) + @Hours,
        UpdatedDate = GETUTCDATE()
    WHERE WorkOrderID = @WorkOrderID;

    SELECT WorkOrderID, EstimatedHours, ActualHours FROM WorkOrders WHERE WorkOrderID = @WorkOrderID;
END;
GO
