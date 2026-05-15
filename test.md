http://localhost:5000/repositories

{
  "repoUrl": "https://github.com/expressjs/express"
}

http://localhost:5000/pipelines/uuid/generate

{
  "message": "Pipeline generated",

  "pipeline": {
    "id": "uuid",

    "name": "Node.js Pipeline",

    "yamlContent": "name: Node.js CI\n..."
  }
}