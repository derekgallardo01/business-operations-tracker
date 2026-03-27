# Infrastructure — Business Operations Tracker

## Monthly Cost: ~$100-145/month idle

## Quick Shutdown
```powershell
# WARNING: This resource group is shared with ai-document-processor and docuchat projects
az group delete --name rg-operations-tracker --yes --no-wait
```

## Azure Resources

**Resource Group:** `rg-operations-tracker` (eastus)

| Resource | Type | SKU | Monthly Cost |
|----------|------|-----|-------------|
| rg-operations-tracker-server-2 | SQL Server | Entra auth | $0 |
| rg-operations-tracker-sql-db | SQL Database | GP_S_Gen5 (Serverless) | $5-50 (auto-pauses when idle) |
| ASP-rgoperationstracker-aa1b | App Service Plan | **P0v4 (PremiumV4)** | **~$75** |
| rg-operations-tracker-app | Web App | on P0v4 plan | included |
| stopstrackerdg | Storage Account | Standard_RAGRS | ~$1 |
| Application Insights Smart Detection | Alert Rule | N/A | $0 |

### Shared Resources (also in this resource group)
These belong to other projects but share the same SQL Server:

| Resource | Used By | SKU | Monthly Cost |
|----------|---------|-----|-------------|
| docuchat-db | docuchat | Standard S0 | ~$15 |
| ai-document-processor-db | ai-document-processor | Basic | ~$5 |
| doc-intel-dg | ai-document-processor | Form Recognizer F0 (Free) | $0 |

## Cost Saving Tips
- **Downgrade App Service Plan** from P0v4 ($75/month) to B1 ($13/month) for development: `az appservice plan update --name ASP-rgoperationstracker-aa1b --resource-group rg-operations-tracker --sku B1`
- The GP_S_Gen5 SQL database auto-pauses when idle ($0 when paused, resumes on first connection)

## Recreation Steps

```powershell
# 1. Create resource group
az group create --name rg-operations-tracker --location eastus

# 2. Create SQL Server (Entra-only auth)
az sql server create --name rg-operations-tracker-server-2 --resource-group rg-operations-tracker --location eastus --enable-ad-only-auth --external-admin-principal-type User --external-admin-sid <YOUR-USER-OBJECT-ID> --external-admin-name <YOUR-NAME>

# 3. Create SQL Database (use serverless for auto-pause)
az sql db create --server rg-operations-tracker-server-2 --resource-group rg-operations-tracker --name rg-operations-tracker-sql-db --compute-model Serverless --edition GeneralPurpose --family Gen5 --capacity 1 --auto-pause-delay 60

# 4. Create App Service Plan (B1 instead of P0v4 to save money)
az appservice plan create --name ASP-rgoperationstracker-aa1b --resource-group rg-operations-tracker --sku B1 --is-linux

# 5. Create Web App
az webapp create --name rg-operations-tracker-app --resource-group rg-operations-tracker --plan ASP-rgoperationstracker-aa1b --runtime "DOTNETCORE:8.0"

# 6. Create Storage Account
az storage account create --name stopstrackerdg --resource-group rg-operations-tracker --sku Standard_RAGRS --location eastus

# 7. Add SQL firewall rule for your IP
az sql server firewall-rule create --resource-group rg-operations-tracker --server rg-operations-tracker-server-2 --name AllowMyIP --start-ip-address <YOUR-IP> --end-ip-address <YOUR-IP>

# 8. Run SQL schema scripts from the repo
# 9. Deploy app code: dotnet publish + az webapp deploy
```
