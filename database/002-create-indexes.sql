-- ============================================
-- Indexes for Performance
-- ============================================

-- Work Orders - most common queries
CREATE NONCLUSTERED INDEX IX_WorkOrders_Status ON WorkOrders(Status) INCLUDE (Title, Priority, AssignedToID, DueDate);
CREATE NONCLUSTERED INDEX IX_WorkOrders_AssignedTo ON WorkOrders(AssignedToID) INCLUDE (Status, Priority, DueDate);
CREATE NONCLUSTERED INDEX IX_WorkOrders_RequestedBy ON WorkOrders(RequestedByID) INCLUDE (Status, CreatedDate);
CREATE NONCLUSTERED INDEX IX_WorkOrders_Category ON WorkOrders(CategoryID);
CREATE NONCLUSTERED INDEX IX_WorkOrders_Priority ON WorkOrders(Priority, Status);
CREATE NONCLUSTERED INDEX IX_WorkOrders_DueDate ON WorkOrders(DueDate) WHERE Status NOT IN ('Completed', 'Cancelled');
CREATE NONCLUSTERED INDEX IX_WorkOrders_CreatedDate ON WorkOrders(CreatedDate DESC);

-- Comments
CREATE NONCLUSTERED INDEX IX_Comments_WorkOrder ON Comments(WorkOrderID, CreatedDate DESC);

-- Attachments
CREATE NONCLUSTERED INDEX IX_Attachments_WorkOrder ON Attachments(WorkOrderID);

-- Status History
CREATE NONCLUSTERED INDEX IX_StatusHistory_WorkOrder ON StatusHistory(WorkOrderID, ChangedDate DESC);

-- Employees
CREATE NONCLUSTERED INDEX IX_Employees_Department ON Employees(DepartmentID) WHERE IsActive = 1;
