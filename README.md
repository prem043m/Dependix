# Dependix

## Universal Automated Dependency Management & DevSecOps Governance Platform

Dependix is an enterprise-grade DevSecOps governance platform built around a VS Code Extension + Distributed Backend architecture.

The platform provides:

* automated dependency governance
* security correlation
* repository analysis
* Renovate integration
* vulnerability orchestration
* CI/CD governance overlays
* distributed security scanning
* real-time DevSecOps insights directly inside VS Code

---     

# Architecture Overview

Dependix is NOT a traditional web dashboard platform.

The system follows:

```text
VS Code Extension
        ↓
Backend APIs
        ↓
Governance Engine
        ↓
Security Orchestration
        ↓
GitHub + Renovate + CI/CD
```

The platform acts as:

* DevSecOps governance overlay
* security intelligence layer
* dependency governance engine

NOT:

* CI/CD replacement platform
* workflow-overwriting system

---

# Core Features

## Repository Management

* GitHub repository registration
* repository metadata collection
* recursive repository analysis
* stack detection

Supported stacks:

* Node.js
* Python
* Java
* Docker

---

## Dependency Governance

Integrated with:

* Renovate

Capabilities:

* dependency update analysis
* governance evaluation
* update classification
* dependency risk scoring
* pull request governance
* security correlation

---

## Security Orchestration

Integrated scanners:

* Snyk
* Trivy
* Gitleaks
* OSV advisory enrichment

Capabilities:

* vulnerability scanning
* dependency scanning
* secret detection
* security correlation
* governance recommendations

---

## Governance Engine

Features:

* merge/block recommendations
* governance scoring
* CI/CD health analysis
* security correlation
* dependency risk evaluation

---

## Async Distributed Scanning

Built using:

* Redis
* BullMQ
* background workers

Capabilities:

* distributed scans
* retry handling
* scheduled scans
* scalable orchestration

---

## VS Code Extension

The VS Code extension provides:

### Sidebar Panels

* repositories
* vulnerabilities
* dependency governance
* scan history
* governance alerts

### Features

* live backend integration
* real-time scan visibility
* pull request governance
* dependency intelligence
* security correlation
* scan orchestration

---

# Tech Stack

## Backend

* Node.js
* TypeScript
* Express
* PostgreSQL
* Prisma
* Redis
* BullMQ
* Socket.IO
* Octokit

## Extension

* VS Code Extension API
* TypeScript
* TreeViews
* Webviews

## Security Tools

* Snyk
* Trivy
* Gitleaks
* Renovate

---

# Final Architecture

```text
project/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── api/
│   │   ├── database/
│   │   ├── github/
│   │   ├── governance/
│   │   ├── queue/
│   │   ├── realtime/
│   │   ├── renovate/
│   │   ├── security/
│   │   └── services/
│
├── extension/
│   ├── src/
│   │   ├── commands/
│   │   ├── providers/
│   │   ├── services/
│   │   ├── webviews/
│   │   ├── models/
│   │   └── utils/
│
└── docs/
```

---

# Setup Guide

# 1. Clone Repository

```bash
git clone <repo-url>
cd Dependix
```

---

# 2. Backend Setup

## Install Dependencies

```bash
cd backend
npm install
```

---

## Configure Environment Variables

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/devsecops"

REDIS_HOST=localhost
REDIS_PORT=6379

GITHUB_TOKEN=your_github_token

SNYK_TOKEN=your_snyk_token
```

---

# 3. PostgreSQL Setup

Create database:

```sql
CREATE DATABASE devsecops;
```

---

# 4. Prisma Setup

Generate Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

---

# 5. Redis Setup

Start Redis locally.

Example using Docker:

```bash
docker run -p 6379:6379 redis
```

---

# 6. Start Backend

```bash
npm run dev
```

Expected:

```text
Server running on port 5000
```

---

# 7. Start Worker

Open another terminal:

```bash
npm run worker
```

This starts:

* BullMQ workers
* security orchestration
* distributed scans

---

# 8. Extension Setup

```bash
cd extension/devsecops-assistant
npm install
```

---

# 9. Run Extension

Open extension folder in VS Code.

Press:

```text
F5
```

This launches:

```text
Extension Development Host
```

---

# How Dependix Works

## Repository Flow

```text
Register Repository
        ↓
Repository Analysis
        ↓
Stack Detection
        ↓
Dependency Governance
        ↓
Security Correlation
        ↓
Governance Evaluation
        ↓
VS Code Insights
```

---

# Dependency Governance Flow

```text
Renovate PR
        ↓
Security Scanning
        ↓
CI/CD Analysis
        ↓
Governance Engine
        ↓
Risk Evaluation
        ↓
Merge Recommendation
```

---

# CI/CD Philosophy

Dependix does NOT aggressively overwrite workflows.

Rules:

* existing CI/CD is respected
* existing GitHub Actions are analyzed
* governance overlays existing pipelines
* workflows are NOT overwritten

If no CI/CD exists:

* only minimal optional recommendations are generated
* no direct workflow injection occurs

---

# Security Correlation

Dependix correlates:

* dependency updates
* vulnerabilities
* CI/CD checks
* governance rules
* pull request state

This allows:

* intelligent governance decisions
* merge recommendations
* risk-aware dependency management

---

# Available Commands

## Backend

```bash
npm run dev
npm run worker
```

---

## Prisma

```bash
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

---

# Troubleshooting

## Prisma EPERM Error

If Windows locks Prisma query engine:

```powershell
taskkill /F /IM node.exe
```

Then:

```bash
npx prisma generate
```

---

## Redis Connection Issues

Verify Redis is running:

```bash
redis-cli ping
```

Expected:

```text
PONG
```

---

## Extension Not Loading

Ensure backend is running on:

```text
http://localhost:5000
```

---

# Current Status

Implemented:

* repository registration
* repository analysis
* stack detection
* governance engine
* security orchestration
* distributed scan queues
* Renovate integration
* VS Code extension
* real-time backend communication

---

# Future Enhancements

Planned:

* advanced governance policies
* historical vulnerability analytics
* enterprise RBAC
* remediation intelligence
* advanced CI/CD correlation
* SARIF support
* Kubernetes scanning

---

# Important Design Principles

Dependix is designed around:

* enterprise-safe automation
* governance-first architecture
* non-intrusive DevSecOps
* extension-first UX
* scalable distributed orchestration

---

# License

MIT License
