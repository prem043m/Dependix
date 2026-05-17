import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

export class GithubPRService {

    static async getRenovatePRs(
        owner: string,
        repo: string
    ) {

        const response =
            await octokit.pulls.list({

                owner,
                repo,

                state: 'open'
            });

        return response.data.filter(
            pr =>

            pr.user?.login ===
            'renovate[bot]'
        );
    }
}