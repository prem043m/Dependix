# Automated Security & Dependency Governance

An automated platform designed to simplify DevSecOps by providing instant security scanning, stack detection, and CI/CD pipeline generation for GitHub repositories.

## 🚀 Key Features

- **Automated Stack Detection**: Automatically identifies project language (Node.js, Python, Go, Java) and package managers.
- **Multi-Tool Security Orchestration**: Runs **Snyk**, **Trivy**, and **Gitleaks** in parallel to find vulnerabilities and secrets.
- **Dynamic CI Generation**: Generates optimized GitHub Actions workflows based on the detected stack.
- **Policy Enforcement**: Evaluates scan results against security policies (e.g., block on critical vulnerabilities).

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18+)
- **Docker & Docker Compose**
- **Git**
- **Security CLIs** (Optional but recommended for full local functionality):
  - [Snyk CLI](https://docs.snyk.io/snyk-cli/install-the-snyk-cli) (`npm install -g snyk`)
  - [Trivy](https://aquasecurity.github.io/trivy/latest/getting-started/installation/)
  - [Gitleaks](https://github.com/gitleaks/gitleaks#installing)

---

## ⚙️ Setup Instructions

### 1. Database Setup
Spin up the PostgreSQL database using Docker Compose:
```bash
docker compose up -d
```

### 2. Backend Installation
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend` directory (or update the existing one):
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/devsecops"
GITHUB_TOKEN=your_github_personal_access_token
```
> [!TIP]
> A GitHub token is required for repository analysis and workflow generation.

### 4. Sync Database Schema
Apply the Prisma schema to your local database:
```bash
npx prisma db push
```

### 5. Start the Server
Run the development server:
```bash
npm run dev
```
The server will be running at `http://localhost:5000`.

---

## 📖 API Usage Guide

### 1. Register and Analyze a Repository
Automatically detects the stack and generates a CI pipeline.

**Request:**
- **URL**: `POST /repositories`
- **Body**:
  ```json
  {
    "repoUrl": "https://github.com/expressjs/express"
  }
  ```

**Example (Windows/curl.exe):**
```powershell
curl.exe -X POST http://localhost:5000/repositories -H "Content-Type: application/json" -d '{\"repoUrl\": \"https://github.com/expressjs/express\"}'
```

### 2. Run Security Scan
Triggers Snyk, Trivy, and Gitleaks scans on the repository.

**Request:**
- **URL**: `POST /security/:repositoryId/run`

**Example (Windows/curl.exe):**
```powershell
curl.exe -X POST http://localhost:5000/security/YOUR_REPO_ID_HERE/run
```

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Dockerized)
- **Security Tools**: Snyk, Trivy, Gitleaks
- **Integrations**: GitHub REST API (Octokit)
