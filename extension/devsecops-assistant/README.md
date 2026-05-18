# Dependix — DevSecOps Governance Extension

Dependix is a VS Code extension for enterprise DevSecOps governance and dependency intelligence.

## Features

* Repository analysis
* Security scanning
* Dependency governance
* Renovate integration
* Vulnerability correlation
* Governance recommendations
* Real-time DevSecOps insights

## Backend Requirements

Dependix requires the backend server to be running.

Default backend URL:

```txt
http://localhost:5000
```

## Commands

* Register Repository
* Run Security Scan
* Check Dependencies
* Analyze Workflow

## Architecture

```txt
VS Code Extension
        ↓
Backend APIs
        ↓
Security Orchestration
        ↓
Governance Engine
        ↓
GitHub + Renovate
```

## Tech Stack

* VS Code Extension API
* TypeScript
* Node.js
* PostgreSQL
* Prisma
* Redis
* BullMQ
* Renovate
* Snyk
* Trivy
* Gitleaks
