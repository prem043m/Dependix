export function dockerTemplate() {
  return {
    jobs: {
      docker: {
        "runs-on": "ubuntu-latest",
        steps: [
          {
            uses: "actions/checkout@v4",
          },
          {
            run: "docker build -t app .",
          },
        ],
      },
    },
  };
}
