FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY OperationsTracker.Api/OperationsTracker.Api.csproj OperationsTracker.Api/
RUN dotnet restore OperationsTracker.Api/OperationsTracker.Api.csproj
COPY . .
WORKDIR /src/OperationsTracker.Api
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "OperationsTracker.Api.dll"]
