import dotenv from "dotenv";
import {App} from "octokit";
import {createNodeMiddleware} from "@octokit/webhooks";
import http from "http";

dotenv.config();

const appId = process.env.APP_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;
const privateKey = process.env.PRIVATE_KEY_PATH;

const app = new App({
  appId: appId,
  privateKey: privateKey,
  webhooks: {
    secret: webhookSecret
  },
});

// This function will create branch protections for the main branch of a repository when it is created and create a new issue with a message
// describing the protections that have been applied
async function handleRepoCreated({ octokit, payload }) {
    console.log(`Received a repository creation event for ${payload.repository.full_name}`);

    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;

    try {
        // Protect the main branch of the repository
        if (payload.repository.owner.type === "Organization") {
            await octokit.request("PUT /repos/{owner}/{repo}/branches/{branch}/protection", {
                owner: owner,
                repo: repo,
                branch: "main",
                headers: {
                    "x-github-api-version": "2022-11-28",
                },
                required_status_checks: null,
                enforce_admins: null,
                required_pull_request_reviews: {
                    dismiss_stale_reviews: true,
                    require_code_owner_reviews: true,
                    required_approving_review_count: 1,
                    allow_teams: true,
                },
                restrictions: null,
                required_linear_history: true,
                allow_force_pushes: false,
                allow_deletions: false,
            });

            await octokit.request("POST /repos/{owner}/{repo}/issues", {
                owner: owner,
                repo: repo,
                title: "Main branch protection",
                body: `@${owner}, the main branch has been protected with the following settings:\n\n- Require linear history: true\n- Allow force pushes: false\n- Allow deletions: false\n- Require pull request reviews: true\n- Dismiss stale pull request approvals when new commits are pushed: true\n- Require review from Code Owners: true\n- Required approving reviews: 1\n- Allow teams: true`,
            });
        }
        else {
            await octokit.request("PUT /repos/{owner}/{repo}/branches/{branch}/protection", {
                owner: owner,
                repo: repo,
                branch: "main",
                headers: {
                    "x-github-api-version": "2022-11-28",
                },
                required_status_checks: null,
                enforce_admins: null,
                required_pull_request_reviews: null,
                restrictions: null,
                required_linear_history: true,
                allow_force_pushes: false,
                allow_deletions: false,
            });

            // Create a new issue outlining the protections
            await octokit.request("POST /repos/{owner}/{repo}/issues", {
                owner: owner,
                repo: repo,
                title: "Main branch protection",
                body: `@${owner}, the main branch has been protected with the following settings:\n\n- Require linear history: true\n- Allow force pushes: false\n- Allow deletions: false`,
            });

            // assign issue to the owner of the repository
            await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/assignees", {
                owner: owner,
                repo: repo,
                issue_number: 1,
                assignees: [owner],
            });
        }
        
        console.log(`Successfully protected the main branch of ${payload.repository.full_name} and created a new issue`);

    } catch (error) {
        if (error.response) {
            console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`)
        }
        console.error(error)
    }
}

app.webhooks.on("repository.created", handleRepoCreated);

app.webhooks.onError((error) => {
    if (error.name === "AggregateError") {
        console.error(`Error processing request: ${error.event}`);
    } else {
        console.error(error);
    }
});

const port = 3000;
const host = 'localhost';
const path = "/api/webhook";
const localWebhookUrl = `http://${host}:${port}${path}`;

const middleware = createNodeMiddleware(app.webhooks, {path});

http.createServer(middleware).listen(port, () => {
    console.log(`Server is listening for events at: ${localWebhookUrl}`);
    console.log('Press Ctrl + C to quit.')
});