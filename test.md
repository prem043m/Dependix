# Automated Security Governance - Test Plan

## 1. Repository Registration
**POST** `http://localhost:5000/repositories`
```json
{
  "repoUrl": "https://github.com/expressjs/express"
}
```

## 2. Trigger Background Security Scan
**POST** `http://localhost:5000/security/YOUR_REPO_ID/run`
**Expected Response:**
```json
{
  "message": "Security scan queued",
  "jobId": "1"
}
```

## 3. Check Scan Status
**GET** `http://localhost:5000/jobs/JOB_ID`
**Expected Response (when done):**
```json
{
  "id": "1",
  "state": "completed",
  "progress": 100,
  "result": { ... }
}
```

## 4. Governance Evaluation
**POST** `http://localhost:5000/governance/YOUR_REPO_ID/evaluate`
**Body:**
```json
{
  "pullNumber": 42
}
```

## 5. Compliance Summary
**GET** `http://localhost:5000/governance/summary`
