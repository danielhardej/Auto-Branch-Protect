import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

export default async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        // Validate required data is present in the request
        const githubEvent = req.headers['x-github-event'];
        const githubAction = req.body.action;
        const installationId = req.body.installation?.id;
        const orgLogin = req.body.organization?.login;

        if (!githubEvent || !githubAction || !installationId || !orgLogin) {
            if (githubEvent !== 'repository' && githubAction !== 'created') {
                context.log(`Request is not a repository creation event. GitHub Event: ${githubEvent}, Action: ${githubAction}, Installation ID: ${installationId}, Organization: ${orgLogin}`);
                context.res = {
                    status: 400,
                    body: `Request is not a repository creation event. GitHub Event: ${githubEvent}, Action: ${githubAction}, Installation ID: ${installationId}, Organization: ${orgLogin}`
                };
                return;
            }
            context.log(githubEvent, githubAction, installationId, orgLogin);
            context.log.error("Request is missing required GitHub event, action, installation ID, or organization login.");
            context.res = {
                status: 400,
                body: `Request is missing required GitHub event, action, installation ID, or organization login. GitHub Event: ${githubEvent}, Action: ${githubAction}, Installation ID: ${installationId}, Organization: ${orgLogin}`
            };
            return;
        }

        context.log(`JavaScript HTTP trigger function processed a request. GitHub Event: ${githubEvent}, Action: ${githubAction}, Installation ID: ${installationId}`);

        // Validate environment variables are set
        const vaultName = process.env.KEY_VAULT_NAME;
        const keyName = process.env.KEY_NAME;
        const appId = process.env.APP_ID;

        if (!vaultName || !keyName || !appId) {
            context.log.error("Server is missing required environment configuration.");
            context.res = {
                status: 500,
                body: "Server is missing required environment configuration.",
            };
            return;
        }

        const vaultURL = `https://${vaultName}.vault.azure.net`;
        const credential = new DefaultAzureCredential();
        const client = new SecretClient(vaultURL, credential);
        const secretBundle = await client.getSecret(keyName);
        const privateKeyString = Buffer.from(secretBundle.value, 'base64').toString('ascii');

        const octokit = new Octokit({
            authStrategy: createAppAuth,
            auth: { appId, privateKey: privateKeyString, installationId },
        });

        const adminMembers = await octokit.rest.orgs.listMembers({
            org: orgLogin,
            role: 'admin',
        });
        const adminHandles = adminMembers.data.map(member => '@' + member.login).join(' ');
        const owner = req.body.repository.owner.login;
        const repo = req.body.repository.name;
        const sender = req.body.sender.login;
        const branch = req.body.repository.default_branch;

        try {
            await octokit.rest.repos.updateBranchProtection({
                owner: owner,
                repo: repo,
                branch: branch,
                required_status_checks: null,
                enforce_admins: true,
                required_pull_request_reviews: {
                    dismissal_restrictions: {},
                    dismiss_stale_reviews: true,
                    require_code_owner_reviews: true,
                    required_approving_review_count: 1,
                },
                restrictions: null,
                required_linear_history: true,
                allow_force_pushes: false,
                allow_deletions: false,
            });
            context.log("Branch protection updated for: " + req.body.repository.full_name);
            try {
                await octokit.rest.issues.create({
                    owner: owner,
                    repo: repo,
                    title: "Main branch protections",
                    body: `Hi admins (${adminHandles}),\n\n` +
                        `This new repository was created by @${sender}. The main branch has automatically been protected with the following settings:\n` +
                        `- [x] Require linear history: true\n` +
                        `- [x] Allow force pushes: false\n` +
                        `- [x] Allow deletions: false\n` +
                        `- [x] Require pull request reviews: true\n` +
                        `- [x] Dismiss stale pull request approvals when new commits are pushed: true\n` +
                        `- [x] Require review from Code Owners: true\n` +
                        `- [x] Required approving reviews: 1\n` +
                        `- [x] Allow teams: true`
                });
                context.log("New issue successfully created.")
            } catch (error) {
                context.log.error(`Error creating issue: ${error}`);
            }
            context.res = {
                status: 200,
                body: `Repository creation event received for: ${repo}. Branch protections updated.`
            };
        } catch (error) {
            if (error.status === 404) {
                context.log.error(`${error}: Branch "${branch}" not found in repository ${repo}`);
            } else {
                context.log.error(`Error updating branch protection: ${error}`);
            }
            context.res = {
                status: 200,
                body: `[ERROR] Branch protections not updated. Repository creation event received for: ${repo}.`
            };
            try {
                await octokit.rest.issues.create({
                    owner: owner,
                    repo: repo,
                    title: "[WARNING] Main branch unprotected",
                    body: `Hi admins (${adminHandles})!,\n\n This new repository was created by @${sender}, but **the main branch has not been automatically been protected!**\n\n` +
                            `Error: ${error}\n\n` +
                            `**Please remember to protect the main branch!**`
                });
                context.log("Warning issue successfully created.")
            } catch (error) {
                context.log.error(`Error creating warning issue: ${error}`);
            }
        }
    } catch (error) {
        context.log.error(`Error: ${error.message}`);
        context.res = {
            status: 500,
            body: `Error: ${error.message}`,
        };
    }
};