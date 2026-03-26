-- ============================================
-- Sample Data for Demo
-- ============================================

-- Departments
INSERT INTO Departments (Name) VALUES
('Operations'),
('IT'),
('Facilities'),
('Human Resources'),
('Finance');

-- Employees
INSERT INTO Employees (FirstName, LastName, Email, Phone, DepartmentID, Role) VALUES
('Sarah', 'Mitchell', 'sarah.mitchell@company.com', '305-555-0101', 1, 'Manager'),
('James', 'Rodriguez', 'james.rodriguez@company.com', '305-555-0102', 2, 'Manager'),
('Emily', 'Chen', 'emily.chen@company.com', '305-555-0103', 3, 'Staff'),
('Michael', 'Thompson', 'michael.thompson@company.com', '305-555-0104', 1, 'Staff'),
('Lisa', 'Patel', 'lisa.patel@company.com', '305-555-0105', 2, 'Staff'),
('David', 'Kim', 'david.kim@company.com', '305-555-0106', 4, 'Manager'),
('Maria', 'Garcia', 'maria.garcia@company.com', '305-555-0107', 5, 'Staff'),
('Robert', 'Johnson', 'robert.johnson@company.com', '305-555-0108', 3, 'Manager'),
('Amanda', 'Williams', 'amanda.williams@company.com', '305-555-0109', 1, 'Staff'),
('Kevin', 'Brown', 'kevin.brown@company.com', '305-555-0110', 2, 'Staff');

-- Categories
INSERT INTO Categories (Name, Description) VALUES
('Maintenance', 'Equipment repairs, preventive maintenance, and facility upkeep'),
('IT Support', 'Hardware, software, network, and system issues'),
('Facilities', 'Building services, cleaning, HVAC, lighting, and space management'),
('Safety', 'Safety inspections, hazard reports, and compliance items'),
('Procurement', 'Purchase requests, vendor coordination, and supply orders'),
('General', 'Miscellaneous operational requests');

-- Work Orders - mix of statuses, priorities, and dates
INSERT INTO WorkOrders (Title, Description, CategoryID, Priority, Status, RequestedByID, AssignedToID, DueDate, CompletedDate, EstimatedHours, ActualHours, CreatedDate, UpdatedDate) VALUES
-- Completed orders
('Replace HVAC filter - Building A', 'Quarterly HVAC filter replacement for the main office building. Filters are in storage room B2.', 1, 'Medium', 'Completed', 4, 3, '2026-03-10', '2026-03-08', 2.0, 1.5, '2026-03-01', '2026-03-08'),
('Setup new employee laptop - D. Kim', 'Configure laptop with standard software suite, VPN access, and email. Employee starts Monday.', 2, 'High', 'Completed', 6, 5, '2026-03-05', '2026-03-04', 3.0, 2.5, '2026-03-02', '2026-03-04'),
('Fix broken door lock - Conference Room 3', 'Lock mechanism is jammed. Room cannot be secured. Key card reader also not responding.', 3, 'High', 'Completed', 1, 8, '2026-03-07', '2026-03-06', 1.5, 2.0, '2026-03-03', '2026-03-06'),
('Monthly safety inspection - Warehouse', 'Complete monthly safety walkthrough and file report. Check fire extinguishers, exits, and signage.', 4, 'Medium', 'Completed', 8, 3, '2026-03-15', '2026-03-14', 4.0, 3.5, '2026-03-05', '2026-03-14'),
('Order office supplies - Q1 restock', 'Restock printer paper, toner cartridges, pens, and sticky notes for all departments.', 5, 'Low', 'Completed', 7, 9, '2026-03-12', '2026-03-10', 1.0, 1.0, '2026-03-06', '2026-03-10'),

-- In Progress orders
('Network switch upgrade - Floor 2', 'Replace aging network switch with new managed switch. Coordinate with vendors for after-hours install.', 2, 'High', 'In Progress', 2, 5, '2026-03-28', NULL, 6.0, NULL, '2026-03-15', '2026-03-20'),
('Repaint lobby walls', 'Lobby walls showing wear. Needs fresh coat of paint in approved corporate colors (Sherwin-Williams SW7015).', 3, 'Low', 'In Progress', 1, 8, '2026-04-05', NULL, 12.0, NULL, '2026-03-18', '2026-03-22'),
('Repair loading dock hydraulic lift', 'Hydraulic lift making grinding noise and operating slowly. Vendor quote already approved.', 1, 'Critical', 'In Progress', 4, 3, '2026-03-26', NULL, 8.0, NULL, '2026-03-20', '2026-03-23'),

-- New orders
('Install security cameras - Parking Lot B', 'Add 4 cameras covering north and east sides of parking lot B. Cabling and NVR setup included.', 4, 'High', 'New', 8, NULL, '2026-04-10', NULL, 16.0, NULL, '2026-03-22', '2026-03-22'),
('Migrate shared drive to SharePoint', 'Move department shared drives to SharePoint Online. Preserve folder structure and permissions.', 2, 'Medium', 'New', 2, NULL, '2026-04-15', NULL, 20.0, NULL, '2026-03-23', '2026-03-23'),
('Replace breakroom microwave', 'Breakroom microwave stopped working. Need to purchase and install replacement.', 3, 'Low', 'New', 9, NULL, '2026-04-01', NULL, 0.5, NULL, '2026-03-24', '2026-03-24'),
('Annual fire extinguisher inspection', 'Schedule vendor for annual inspection and certification of all fire extinguishers across campus.', 4, 'High', 'New', 8, NULL, '2026-04-08', NULL, 6.0, NULL, '2026-03-24', '2026-03-24'),

-- On Hold
('Upgrade ERP module - Inventory', 'Upgrade inventory module to v4.2. Waiting on vendor license key and migration guide.', 2, 'Medium', 'On Hold', 7, 10, '2026-04-01', NULL, 10.0, NULL, '2026-03-10', '2026-03-18'),
('Renovate 2nd floor restrooms', 'Full restroom renovation approved in Q1 budget. Waiting on contractor schedule.', 3, 'Low', 'On Hold', 1, 8, '2026-05-01', NULL, 40.0, NULL, '2026-03-01', '2026-03-15'),

-- Overdue
('Fix parking gate sensor', 'Entry gate sensor not detecting vehicles. Staff manually raising gate. Urgent.', 1, 'Critical', 'In Progress', 4, 3, '2026-03-20', NULL, 3.0, NULL, '2026-03-12', '2026-03-18'),

-- Cancelled
('Order standing desks - Marketing', 'Standing desk request for marketing team. Budget not approved for Q1.', 5, 'Low', 'Cancelled', 6, NULL, '2026-03-30', NULL, 2.0, NULL, '2026-03-08', '2026-03-12');

-- Comments
INSERT INTO Comments (WorkOrderID, AuthorID, CommentText, CreatedDate) VALUES
(1, 3, 'Filters picked up from storage. Starting replacement now.', '2026-03-07 09:30:00'),
(1, 3, 'All filters replaced. System running normally.', '2026-03-08 11:00:00'),
(6, 5, 'New switch arrived. Scheduling install for Saturday evening to minimize downtime.', '2026-03-20 14:00:00'),
(6, 2, 'Approved. Please notify all Floor 2 users about the 2-hour downtime window.', '2026-03-20 15:30:00'),
(8, 3, 'Vendor on site. Hydraulic fluid needs full replacement — adding to scope.', '2026-03-23 10:00:00'),
(8, 1, 'Approved additional scope. This is blocking shipping operations.', '2026-03-23 10:45:00'),
(13, 10, 'Vendor confirmed license key shipping next week. Pushed timeline.', '2026-03-18 09:00:00'),
(15, 3, 'Sensor module ordered. Expected delivery March 24.', '2026-03-18 16:00:00'),
(15, 4, 'Gate is now stuck open — security risk. Can we get a temp fix?', '2026-03-19 08:00:00');

-- Status History
INSERT INTO StatusHistory (WorkOrderID, OldStatus, NewStatus, ChangedByID, Notes, ChangedDate) VALUES
(1, 'New', 'In Progress', 3, 'Starting filter replacement', '2026-03-07 09:00:00'),
(1, 'In Progress', 'Completed', 3, 'All filters replaced', '2026-03-08 11:00:00'),
(2, 'New', 'In Progress', 5, 'Laptop imaging started', '2026-03-03 10:00:00'),
(2, 'In Progress', 'Completed', 5, 'Laptop configured and delivered', '2026-03-04 16:00:00'),
(6, 'New', 'In Progress', 5, 'Switch procurement approved', '2026-03-20 10:00:00'),
(8, 'New', 'In Progress', 3, 'Vendor contacted for emergency repair', '2026-03-22 08:00:00'),
(13, 'New', 'In Progress', 10, 'Started module assessment', '2026-03-12 09:00:00'),
(13, 'In Progress', 'On Hold', 10, 'Waiting on vendor license key', '2026-03-18 09:00:00'),
(16, 'New', 'Cancelled', 6, 'Budget not approved for Q1', '2026-03-12 11:00:00');
