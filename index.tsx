// Bun v1.2 runtime
import { Hono } from "hono@4";
import { cors } from "hono/cors";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

const app = new Hono();

app.post("/", async (c) => {
  const githubEvent = c.req.header("x-github-event");
  const body = await c.req.json();
  const githubAction = body.action;
  const installationId = body.installation.id;

  if (!githubEvent) {
    return c.json("Missing GitHub event header", 400);
  }

  if (body.action === "created") {
    console.log("Repository creation event received");

    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.BRANCHGUARDIAN_APP_ID,
        privateKey: process.env.BRANCHGUARDIAN_PRIVATE_KEY,
        installationId: installationId,
      },
    });

    console.log(`Octokit authenticated for installation: ${installationId}`);

    const owner = body.repository.owner.login;
    const repo = body.repository.name;
    const sender = body.sender.login;
    const orgName = body.organization.login;
    const members = await octokit.rest.orgs.listMembers({
      org: orgName,
      role: "admin",
    });
    const admins = members.data.map((member) => "@" + member.login).join(" ");
    const branch = body.repository.default_branch;

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

      console.log(
        "Branch protection updated for: " + body.repository.full_name
      );

      try {
        await octokit.rest.issues.create({
          owner: owner,
          repo: repo,
          title: "[UPDATE] Main branch protections",
          body:
            `Hi admins ${admins}!,\n This new repository was created by @${sender}.\n` +
            `The main branch has automatically been protected with the following settings:\n\n` +
            `- [x] Require linear history: true\n` +
            `- [x] Allow force pushes: false\n` +
            `- [x] Allow deletions: false\n` +
            `- [x] Require pull request reviews: true\n` +
            `- [x] Dismiss stale pull request approvals when new commits are pushed: true\n` +
            `- [x] Require review from Code Owners: true\n` +
            `- [x] Required approving reviews: 1\n` +
            `- [x] Allow teams: true\n\n` +
            `View your branch protection settings here: https://github.com/${body.repository.full_name}/settings/branches`,
        });
        console.log("New issue successfully created.");
      } catch (error) {
        console.error(`Error creating issue: ${error}`);
      }
    } catch (error) {
      console.error(`Error updating branch protection: ${error}`);
      try {
        await octokit.rest.issues.create({
          owner: owner,
          repo: repo,
          title: "[WARNING] Main branch unprotected",
          body: `Hi admins (${admins})!,\n\n This new repository was created by @${sender}, but **the main branch has not been automatically been protected!**\n\n` +
                `Reason:\n\n ${error}\n\n` +
                `**Please remember to protect your main branch!**` +
                `View your branch protection settings here: https://github.com/${body.repository.full_name}/settings/branches`,
      });
        console.log("Warning issue successfully created.")
      } catch (error) {
        console.error(`Error creating issue: ${error}`);
      }
    }
  } else {
    console.log(
      `GitHub event webhook receieved: ${githubEvent}, Action: ${githubAction}`
    );
    console.info("No repository creation events. No changes made");
    return c.json(
      `GitHub event webhook receieved: ${githubEvent}, Action: ${githubAction}. No repository creation events. No changes made`,
      200
    );
  }
  return c.json(`Branch protections successfully updated for ${body.repository.full_name}`, 200);
});

Bun.serve({
  port: import.meta.env.PORT ?? 3000,
  fetch: app.fetch,
});