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

## Top 3 Gotchas

1. **READMEs:** Always initialise your new repo with a README.md file. Otherwise, there are no branches to protect!
2. **Private repositories are only for Team plans:** Make sure your organisation is on a [team plan](https://github.com/pricing) if you're creating a private repository. Otherwise, you won't be able to create a branch protection rule or assign reviewers for pull requests!
3. **Permissions:** Make sure you have the correct permissions to install the GitHub app on your organisation's account. You'll need to be an organisation owner or have admin permissions.

## How it works

The GitHub app is written in Node.js and uses GitHub webhooks and the [Octokit](https://github.com/octokit/octokit.js) library to interact with the GitHub API.

The app uses Azure functions, which are triggered by GitHub webhooks, to create a branch protection rule for the main branch of each new repository under your organisation via the GitHub API. The GitHub API is also used to create an issue in the new repository, tagging the org admins and notifying them of the new branch protection settings that were changed (or providing a reason why the branch protections failed, if not.) 

99% of the time, the branch protection rules are created with no problems. If an error occurs, it's almost always due to one of the three gotchas mentioned above and an issue will be created telling you what went wrong.

## References:

- [Monitor GitHub events by using a webhook with Azure Functions](https://learn.microsoft.com/en-gb/training/modules/monitor-github-events-with-a-function-triggered-by-a-webhook/)
- [Azure Functions HTTP triggers and bindings overview](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-github-webhook-triggered-function)
- [Building a GitHub App that responds to webhook events](https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-a-github-app-that-responds-to-webhook-events)
- [SMEE Client](https://smee.io/)
- [Octokit](https://github.com/octokit/octokit.js/#readme)
- [Dotenv](https://www.npmjs.com/package/dotenv)
- [GitHub Webhooks](https://docs.github.com/en/webhooks)
- [GitHub API](https://docs.github.com/en/rest)
- [GitHub API - Create a branch protection rule](https://docs.github.com/en/rest/reference/repos#create-a-branch-protection-rule)
- [GitHub API - Create an issue](https://docs.github.com/en/rest/reference/issues#create-an-issue)
- [GitHub API - Get a repository](https://docs.github.com/en/rest/reference/repos#get-a-repository)
- [GitHub API - Get a user](https://docs.github.com/en/rest/reference/users#get-a-user)
- [GitHub API - Get the authenticated user](https://docs.github.com/en/rest/reference/users#get-the-authenticated-user)
- [Python - Generate secure random numbers](https://docs.python.org/3/library/secrets.html)
