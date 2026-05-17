import { exec } from 'child_process';

export class RenovateService {

    static run(
        repository: string
    ): Promise<string> {

        return new Promise(
            (resolve, reject) => {

                exec(

                    `npx renovate ${repository}`,

                    (
                        error,
                        stdout,
                        stderr
                    ) => {

                        if (error) {
                            reject(stderr);
                            return;
                        }

                        resolve(stdout);
                    }
                );
            }
        );
    }
}