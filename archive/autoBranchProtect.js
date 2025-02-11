module.exports = async function (context, req) {
    const eventType = req.headers['x-github-event'];
    const eventAction = req.body.action;
    context.log(`JavaScript HTTP trigger function processed a request. Event: ${eventType} ${eventAction}`);
    const { Octokit } = require("@octokit/rest");
    // const { createAppAuth } = require("@octokit/auth-app");
    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    // const octokit = new Octokit({
    //     authStrategy: createAppAuth,
    //     auth: {
    //         appId: process.env.APP_ID,
    //         privateKey: process.env.PRIVATE_KEY,
    //         installationId: req.body.installation.id, // Get the installation ID from the webhook payload
    //     },
    // });
    if (req.body.action === 'created'){
        context.log("Repository creation event received for: " + req.body.repository.full_name);
        const owner = req.body.repository.owner.login;
        const repo = req.body.repository.name;
        const sender = req.body.sender.login;
        const orgName = req.body.organization.login;
        const members = await octokit.rest.orgs.listMembers({
            org: orgName,
            role: 'admin',
        });
        const admins = members.data.map(member => '@' + member.login).join(' ');
        const branch = req.body.repository.default_branch;

        try {
            await octokit.rest.repos.getBranch({
                owner: owner,
                repo: repo,
                branch: branch,
            });

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
                    body: `Hi admins (${admins}),\n This new repository was created by @${sender}. The main branch has automatically been protected with the following settings:\n\n` +
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

            context.res = { body: "Repository creation event received for: " + req.body.repository.full_name + ". Branch protections updated."};

        } catch (error) {
            if (error.status === 404) {
                context.log.error(`${error}: Branch "${branch}" not found in repository ${repo}`);
            } else {
                context.log.error(`Error updating branch protection: ${error}`);
            }

            context.res = { body: "[ERROR] Branch protections not updated. Repository creation event received for: " + req.body.repository.full_name};

            try {
                await octokit.rest.issues.create({
                    owner: owner,
                    repo: repo,
                    title: "[WARNING] Main branch unprotected",
                    body: `Hi admins (${admins})!,\n\n This new repository was created by @${sender}, but **the main branch has not been automatically been protected!**\n\n` +
                            `Error: ${error}\n\n` +
                            `**Please remember to protect the main branch!**`
                });
                context.log("Warning issue successfully created.")
            } catch (error) {
                context.log.error(`Error creating warning issue: ${error}`);
            }
        } 
    }
    else {
        context.res = { body: "No repository created. No branch protection rules enforced" };
        context.log("No repository created.")
    }
};