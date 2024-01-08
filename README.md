# Auto-Branch-Protect

## A GitHub App to automatically protect the main branches in an organisation's repos.

### GitHub API Challenge

GitHub has a powerful API that enables developers to easily access GitHub data. Companies often ask us to craft solutions to their specific problems. A common request we receive is for branches to be automatically protected upon creation.

In this project, we create a simple web service that listens for organization events to know when a repository has been created. When the repository is created, please automate the protection of the main branch. Notify yourself with an @mention in an issue within the repository that outlines the protections that were added.

### The Webhook URL

In developing the app, we use https://smee.io/ to create a webhook URL. This URL is used to receive events from GitHub. The URL is then added to the GitHub App settings.

A secure webhook secret is generated with the Python command:

```bash
import secrets
secrets.token_hex(16)
```

## Writing the Code

### Installing dependencies

This app uses NPM and GitHub's Octokit module to handle webhook events and make API requests.

We install dependencies with the following steps:

1. Create a `package.json` file using the npm defaults.

```
npm init --yes
```

2. Install Octokit:

```
npm install octokit
```

3. dotenv module to read information about your app from a .env file:
```
npm install dotenv
```

## References:

- [Building a GitHub App that responds to webhook events](https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-a-github-app-that-responds-to-webhook-events)
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
