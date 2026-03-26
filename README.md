# Business Operations Tracker

A .NET 8 Web API for tracking business operations, backed by Azure SQL Database with Managed Identity authentication.

## Tech Stack

- **API**: .NET 8, Dapper, Swagger/OpenAPI
- **Database**: Azure SQL Database
- **Auth**: Azure Managed Identity (Active Directory Default)

## Azure Infrastructure

| Resource | Name | Region |
|----------|------|--------|
| Resource Group | `rg-operations-tracker` | — |
| App Service | `rg-operations-tracker-app` | West US 2 |
| App Service Plan | `ASP-rgoperationstracker-aa1b` | West US 2 |
| SQL Server | `rg-operations-tracker-server-2` | West US 2 |
| SQL Database | `rg-operations-tracker-sql-db` | West US 2 |

## Connection

The API uses **Managed Identity** — no passwords stored in config. The App Service's system-assigned identity has `db_datareader` and `db_datawriter` roles on the database.

Connection string (in `appsettings.json`):
```
Server=rg-operations-tracker-server-2.database.windows.net;Database=rg-operations-tracker-sql-db;Authentication=Active Directory Default;Encrypt=True;TrustServerCertificate=False;
```

For local development, authenticate via `az login` — the `Active Directory Default` auth uses your Azure CLI credentials automatically.

## Project Structure

```
business-operations-tracker/
├── api/
│   └── OperationsTracker.Api/       # .NET 8 Web API
├── database/
│   ├── 001-create-tables.sql
│   ├── 002-create-indexes.sql
│   ├── 003-create-views.sql
│   ├── 004-seed-data.sql
│   └── 005-stored-procedures.sql
└── business-operations-tracker.sln
```

## Getting Started

### Prerequisites
- .NET 8 SDK
- Azure CLI (`az login` for local DB access)

### Run Locally
```bash
cd api/OperationsTracker.Api
dotnet run
```

### Deploy to Azure
```bash
cd api/OperationsTracker.Api
dotnet publish -c Release -o ./publish
az webapp deploy --name rg-operations-tracker-app --resource-group rg-operations-tracker --src-path ./publish
```
