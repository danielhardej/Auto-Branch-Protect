# Auto Branch Protect

### [Install the GitHub App](https://github.com/apps/autobranchprotect)

#### A GitHub App to automatically protect the main branches in an organisation's repos.

<p align="center">
  <img src="https://github.com/danielhardej/Auto-Branch-Protect/assets/19962342/60cf7102-7aa1-41cf-baf7-6561c6781658" alt="bouncer cat protect branch">
</p>

## How to use it

It's easy! All you need to do is:

1. Install the GitHub app on your organisation's account.
2. Create a new repository in your organisation (make sure you initialise the new repository with a README.md!)
3. The GitHub app will automatically create a branch protection rule for the main branch of each new repository under your organisation.
4. The app will also automatically create an issue in the new repository, tagging the org admins and notifying them of the new branch protection rules.

## The branch protection rules

The default branch protection rules are as follows:

- Require pull request reviews before merging into `main`
- Dismiss stale pull request approvals when new commits are pushed
- Require review from Code Owners
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Require linear history
- Do not allow deletions

These rules can be modified later by an organisation owner or repository administrator, but they are set as the default to ensure that the main branch is protected from the get-go.

## Top 3 Gotchas

1. **READMEs:** Always initialise your new repo with a README.md file. Otherwise, there are no branches to protect!
2. **Private repositories are only for Team plans:** Make sure your organisation is on a [team plan](https://github.com/pricing) if you're creating a private repository. Otherwise, you won't be able to create a branch protection rule or assign reviewers for pull requests!
3. **Permissions:** Make sure you have the correct permissions to install the GitHub app on your organisation's account. You'll need to be an organisation owner or have admin permissions.

## How it works

The GitHub app is written in TypeScript and runs on the Bun runtime, and is deployed to a simple Function app on [Railway](https://railway.app).

The function app listens for GitHub webhook events, specifically repository creation events. When a webhook payload is received, the function is triggered and the app uses the [Octokit](https://github.com/octokit/octokit.js) client to make the requests to the GitHub REST API to enforce the branch protections automatically.

The function then also uses the GitHub REST API to create an issue in the new repository, tagging the organistions admins and notifying them of the new branch protection settings that were changed (or providing a reason why the branch protections failed, if not.) 

> [!IMPORTANT]  
> No repository or data is stored by the application. The app only uses the webhook payload to get the repository details, and the GitHub REST API to create the branch protection rule and issue.
> Branch Guardian does not have access to the contents of the repository, only the repository metadata, and authenticates as a GitHub App (not as a user.)

99% of the time, the branch protection rules are created with no problems. If an error occurs, it's almost always due to one of the three gotchas mentioned above and an issue will be created telling you what went wrong.

## References:

- [Building a GitHub App that responds to webhook events](https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-a-github-app-that-responds-to-webhook-events)
- [Octokit](https://github.com/octokit/octokit.js/#readme)
- [GitHub Webhooks](https://docs.github.com/en/webhooks)
- [GitHub API - Create a branch protection rule](https://docs.github.com/en/rest/reference/repos#create-a-branch-protection-rule)
- [GitHub API - Create an issue](https://docs.github.com/en/rest/reference/issues#create-an-issue)
- [GitHub API - Get a repository](https://docs.github.com/en/rest/reference/repos#get-a-repository)
- [GitHub API - Get the authenticated user](https://docs.github.com/en/rest/reference/users#get-the-authenticated-user)
