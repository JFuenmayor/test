# /cypress

E2E test suite for engage.

## Installation and opening the cypress application

```
pnpm cypress open
```

## Configuration

The main configuration goes in `cypress.json`. This **should** be checked into git. However, no private information should be stored there. So any API keys or anything else should be passed in via something that is **not** checked into git.

For example, you may override any environmental variables in `cypress.json` by creating your own `cypress.env.json` file. This file will override anything in the main `cypress.json` file and can be safely excluded via `.gitignore`. In addition, you may pass in environmental variables, which would be useful for docker deployments.

See https://docs.cypress.io/guides/guides/environment-variables.html

eg:

```
> cat cypress.env.json
{
  "myapiKey": "yyyyyyyyyyyyyyy"
}

```

## Run in the terminal

```
pnpm cypress run
```

## CI Run

Sends reports to the cypress.io dashboard.

```
pnpm run cur:run
```

## A run of the entire cypress testing suite is triggered on every merge of a PR into master.

The purpose for these runs are to surface bugs quickly by giving the team some timely feed back (20 mins) on that branch’s effect to areas of the application that are tested and might have been overlooked.

Notes:
These runs of the cypress testing suite will spin up localhost:3000. And therefore, are not a direct equivalent of what is available on the test.postal.dev environment.

Assertions that are written for the test.postal.dev environment (mostly tests involving the delivery repo) are wrapped in the following conditional. They will not be run via the PR trigger, but can be run on your computer by temporarily changing the cypress.json baseUrl to https://test.postal.dev.

```
onlyOn(Cypress.env('testUrl'), () => {
  ...
})
```

## The scheduled midnight Run

This run will only ever point to the test.postal.dev environment and its purpose is to test the delivery repo. But also to have a run recorded during levels of relative inactivity for engage. Backend changes during inactive periods could cause a bug and reviewing these scheduled run's results could catch them sooner.

## Test Run Results

Results can be found in the ui-testing channel in slack and in the cypress dashboard at https://app.currents.dev/projects/H4oiyq/runs.
