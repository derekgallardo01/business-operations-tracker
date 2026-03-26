-- ============================================
-- Views for Power App & Power BI
-- ============================================

-- Main Work Order view with all related names
CREATE VIEW vw_WorkOrders AS
SELECT
    wo.WorkOrderID,
    wo.Title,
    wo.Description,
    wo.Priority,
    wo.Status,
    wo.DueDate,
    wo.CompletedDate,
    wo.EstimatedHours,
    wo.ActualHours,
    wo.CreatedDate,
    wo.UpdatedDate,
    c.Name AS CategoryName,
    req.FirstName + ' ' + req.LastName AS RequestedByName,
    req.Email AS RequestedByEmail,
    req.DepartmentID AS RequestedByDepartmentID,
    reqDept.Name AS RequestedByDepartment,
    asgn.FirstName + ' ' + asgn.LastName AS AssignedToName,
    asgn.Email AS AssignedToEmail,
    -- Calculated fields for Power BI
    CASE
        WHEN wo.Status = 'Completed' THEN DATEDIFF(HOUR, wo.CreatedDate, wo.CompletedDate)
        WHEN wo.Status = 'Cancelled' THEN NULL
        ELSE DATEDIFF(HOUR, wo.CreatedDate, GETUTCDATE())
    END AS AgeInHours,
    CASE
        WHEN wo.Status IN ('Completed', 'Cancelled') THEN 0
        WHEN wo.DueDate IS NULL THEN 0
        WHEN wo.DueDate < GETUTCDATE() THEN 1
        ELSE 0
    END AS IsOverdue,
    CASE
        WHEN wo.Status IN ('Completed', 'Cancelled') THEN 'Closed'
        ELSE 'Open'
    END AS OpenClosed
FROM WorkOrders wo
INNER JOIN Categories c ON wo.CategoryID = c.CategoryID
INNER JOIN Employees req ON wo.RequestedByID = req.EmployeeID
INNER JOIN Departments reqDept ON req.DepartmentID = reqDept.DepartmentID
LEFT JOIN Employees asgn ON wo.AssignedToID = asgn.EmployeeID;
GO

-- Dashboard summary view for Power BI
CREATE VIEW vw_DashboardMetrics AS
SELECT
    COUNT(*) AS TotalWorkOrders,
    SUM(CASE WHEN Status = 'New' THEN 1 ELSE 0 END) AS NewCount,
    SUM(CASE WHEN Status = 'In Progress' THEN 1 ELSE 0 END) AS InProgressCount,
    SUM(CASE WHEN Status = 'On Hold' THEN 1 ELSE 0 END) AS OnHoldCount,
    SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedCount,
    SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) AS CancelledCount,
    SUM(CASE WHEN Status NOT IN ('Completed', 'Cancelled') AND DueDate < GETUTCDATE() THEN 1 ELSE 0 END) AS OverdueCount,
    SUM(CASE WHEN Status NOT IN ('Completed', 'Cancelled') AND Priority = 'Critical' THEN 1 ELSE 0 END) AS CriticalOpenCount,
    AVG(CASE WHEN Status = 'Completed' THEN CAST(DATEDIFF(HOUR, CreatedDate, CompletedDate) AS FLOAT) END) AS AvgResolutionHours
FROM WorkOrders;
GO

-- Work orders by category for Power BI charts
CREATE VIEW vw_WorkOrdersByCategory AS
SELECT
    c.Name AS CategoryName,
    wo.Status,
    wo.Priority,
    COUNT(*) AS OrderCount,
    AVG(CASE WHEN wo.Status = 'Completed' THEN CAST(DATEDIFF(HOUR, wo.CreatedDate, wo.CompletedDate) AS FLOAT) END) AS AvgResolutionHours
FROM WorkOrders wo
INNER JOIN Categories c ON wo.CategoryID = c.CategoryID
GROUP BY c.Name, wo.Status, wo.Priority;
GO

-- Team workload view
CREATE VIEW vw_TeamWorkload AS
SELECT
    e.EmployeeID,
    e.FirstName + ' ' + e.LastName AS EmployeeName,
    d.Name AS Department,
    COUNT(wo.WorkOrderID) AS AssignedOrders,
    SUM(CASE WHEN wo.Status = 'In Progress' THEN 1 ELSE 0 END) AS InProgress,
    SUM(CASE WHEN wo.Priority = 'Critical' THEN 1 ELSE 0 END) AS CriticalItems,
    SUM(CASE WHEN wo.DueDate < GETUTCDATE() AND wo.Status NOT IN ('Completed', 'Cancelled') THEN 1 ELSE 0 END) AS Overdue
FROM Employees e
INNER JOIN Departments d ON e.DepartmentID = d.DepartmentID
LEFT JOIN WorkOrders wo ON e.EmployeeID = wo.AssignedToID AND wo.Status NOT IN ('Completed', 'Cancelled')
WHERE e.IsActive = 1
GROUP BY e.EmployeeID, e.FirstName, e.LastName, d.Name;
GO
