# Auto-Branch-Protect

### [Install the GitHub App](https://github.com/apps/autobranchprotect)

## A GitHub App to automatically protect the main branches in an organisation's repos.

### GitHub API Challenge

The challenge description is as follows:

> GitHub has a powerful API that enables developers to easily access GitHub data. Companies often ask us to craft solutions to their specific problems. A common request we receive is for branches to be automatically protected upon creation.
>
> In this project, we create a simple web service that listens for organization events to know when a repository has been created. When the repository is created, please automate the protection of the main branch. Notify yourself with an @mention in an issue within the repository that outlines the protections that were added.

### Solving the Problem

My initial thought was to use a GitHub Action to protect the main branch.

However, this had two pitfalls:

 1. GitHub Actions are not triggered by the `repository.created` event.
 2. The Action would not exist in the repository by default, unless a template repository was used.

So instead I created a GitHub App that listens for the `repository.created` event.

When the event is received, we use the GitHub API to protect the main branch and then create an issue in the repository.

## Running the App

1. Install the app using the public link: https://github.com/apps/autobranchprotect

2. Open a Codespace or clone the repository and run the app locally. For now, will use our computer or codespace as a server.

3. Start the app server with the following command in the terminal in your Codespace or computer:

```bash
npx smee -u https://smee.io/ZWyucxpozGme49M t http://localhost:3000/api/webhook
```

4. In a new terminal window, run the app:

```bash
npm run server
```

5. Test it out! While your Codespace is open and the app server is running, [create a new repository](https://github.com/new) in the account in which the app is installed to check the app is working.

## Writing the Code and Building the App

### The Webhook URL

In developing the app, we use https://smee.io/ to create a webhook URL. This URL is used to receive events from GitHub. The URL is then added to the GitHub App settings.

A secure webhook secret is generated with the Python command:

```bash
import secrets
secrets.token_hex(16)
```

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
