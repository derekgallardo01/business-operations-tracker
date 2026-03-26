-- ============================================
-- Business Operations Tracker
-- Azure SQL Database Schema
-- ============================================

-- Departments
CREATE TABLE Departments (
    DepartmentID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Employees
CREATE TABLE Employees (
    EmployeeID INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Phone NVARCHAR(20) NULL,
    DepartmentID INT NOT NULL,
    Role NVARCHAR(50) NOT NULL DEFAULT 'Staff', -- Staff, Manager, Admin
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Employees_Department FOREIGN KEY (DepartmentID) REFERENCES Departments(DepartmentID)
);

-- Work Order Categories
CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

-- Work Orders
CREATE TABLE WorkOrders (
    WorkOrderID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    CategoryID INT NOT NULL,
    Priority NVARCHAR(20) NOT NULL DEFAULT 'Medium', -- Low, Medium, High, Critical
    Status NVARCHAR(30) NOT NULL DEFAULT 'New',       -- New, In Progress, On Hold, Completed, Cancelled
    RequestedByID INT NOT NULL,
    AssignedToID INT NULL,
    DueDate DATETIME2 NULL,
    CompletedDate DATETIME2 NULL,
    EstimatedHours DECIMAL(6,2) NULL,
    ActualHours DECIMAL(6,2) NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_WorkOrders_Category FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    CONSTRAINT FK_WorkOrders_RequestedBy FOREIGN KEY (RequestedByID) REFERENCES Employees(EmployeeID),
    CONSTRAINT FK_WorkOrders_AssignedTo FOREIGN KEY (AssignedToID) REFERENCES Employees(EmployeeID),
    CONSTRAINT CK_WorkOrders_Priority CHECK (Priority IN ('Low', 'Medium', 'High', 'Critical')),
    CONSTRAINT CK_WorkOrders_Status CHECK (Status IN ('New', 'In Progress', 'On Hold', 'Completed', 'Cancelled'))
);

-- Comments on Work Orders
CREATE TABLE Comments (
    CommentID INT IDENTITY(1,1) PRIMARY KEY,
    WorkOrderID INT NOT NULL,
    AuthorID INT NOT NULL,
    CommentText NVARCHAR(MAX) NOT NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Comments_WorkOrder FOREIGN KEY (WorkOrderID) REFERENCES WorkOrders(WorkOrderID) ON DELETE CASCADE,
    CONSTRAINT FK_Comments_Author FOREIGN KEY (AuthorID) REFERENCES Employees(EmployeeID)
);

-- Attachments on Work Orders
CREATE TABLE Attachments (
    AttachmentID INT IDENTITY(1,1) PRIMARY KEY,
    WorkOrderID INT NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FileURL NVARCHAR(1000) NOT NULL,
    FileSize INT NULL,
    UploadedByID INT NOT NULL,
    UploadedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Attachments_WorkOrder FOREIGN KEY (WorkOrderID) REFERENCES WorkOrders(WorkOrderID) ON DELETE CASCADE,
    CONSTRAINT FK_Attachments_UploadedBy FOREIGN KEY (UploadedByID) REFERENCES Employees(EmployeeID)
);

-- Status Change History (audit trail)
CREATE TABLE StatusHistory (
    StatusHistoryID INT IDENTITY(1,1) PRIMARY KEY,
    WorkOrderID INT NOT NULL,
    OldStatus NVARCHAR(30) NULL,
    NewStatus NVARCHAR(30) NOT NULL,
    ChangedByID INT NOT NULL,
    Notes NVARCHAR(500) NULL,
    ChangedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_StatusHistory_WorkOrder FOREIGN KEY (WorkOrderID) REFERENCES WorkOrders(WorkOrderID) ON DELETE CASCADE,
    CONSTRAINT FK_StatusHistory_ChangedBy FOREIGN KEY (ChangedByID) REFERENCES Employees(EmployeeID)
);
