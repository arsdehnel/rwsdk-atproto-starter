# rwsdk + AT Protocol Starter

A step-by-step walkthrough of creating a starter kit for building [AT Protocol](https://atproto.com) applications on [RedwoodSDK](https://rwsdk.dev) and [Cloudflare Workers](https://developers.cloudflare.com/workers).

This is the companion code for a [blog series](https://arsdehnel.com/posts) that walks through building a local development environment for an AT Protocol app from scratch — reading public records, authenticating with OAuth, writing to your PDS, and eventually running your own AppView that indexes records from other users.

## Where this branch is at

Take a look [the series overview](https://arsdehnel.github.io/rwsdk-atproto-starter/) for a complete picture of things. Right now you're on code for [Step 5: Tap Sync](https://arsdehnel.com/posts/rwsdk-atp-s1-p5-tap-sync).

## Prerequisites

- [Node.js](https://nodejs.org) 26.x
- [pnpm](https://pnpm.io)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is fine for development)
- [Docker](https://docs.docker.com/get-docker)

## Getting started

```sh
git clone https://github.com/arsdehnel/rwsdk-atproto-starter
cd rwsdk-atproto-starter
git checkout post/series-1/05-tap-sync
pnpm install
pnpm docker:up
pnpm migrate:dev
pnpm dev
```

`docker:up` starts postgres, plc, pds, maildev, and a one-shot init container that creates three test accounts. Once the worker is running, log in with any one of them:
- `alice.devnet.test` / `alice-devnet-pass`
- `bob.devnet.test` / `bob-devnet-pass`
- `carol.devnet.test` / `carol-devnet-pass`

To watch the init container seed the accounts:

```sh
docker compose logs -f init
```

**Stopping the local docker setup**

```sh
pnpm docker:down
```

> **Note:** `docker:down` uses `-v`, which removes the PDS data volume. Test accounts are recreated automatically on the next `pnpm docker:up`.

**Resetting the local D1 database**

Each `pnpm docker:up` run recreates the local ATP accounts with new DIDs. Since the D1 statuses table is keyed by DID, restarting the docker setup leaves stale rows behind. Clear the local Miniflare state and re-run migrations to start fresh:

```sh
rm -rf .wrangler/state/v3/d1 && pnpm migrate:dev
```

## Deploying

This app supports three named environments: `integration`, `staging`, and `production`. Each is a separate Cloudflare Worker with its own D1 database, KV namespace, and secrets.

### First-time setup per environment

Run these steps once for each environment you want to deploy to. Replace `{env}` with `integration`, `staging`, or `production`.

**1. Create infrastructure**

```sh
wrangler d1 create rwsdk-atproto-starter-{env}
wrangler kv namespace create KV_OAUTH_STATE --env {env}
```

**2. Update `wrangler.jsonc`**

Replace the placeholder IDs in the `env.{env}` section with the IDs from the commands above, and set `APP_URL` to the actual deployed URL for that environment. The default workers.dev URL is:

```
https://rwsdk-atproto-starter-{env}.{your-account}.workers.dev
```

**3. Set secrets**

```sh
wrangler secret put BROWSER_SESSION_SIGNING_KEY --env {env}
wrangler secret put OAUTH_STATE_KV_ENCRYPTION_KEYS --env {env}
wrangler secret put OAUTH_TOKEN_KV_ENCRYPTION_KEYS --env {env}
wrangler secret put WEBHOOK_TAP_SECRET --env {env}
```

Generate values for each secret:

```sh
# BROWSER_SESSION_SIGNING_KEY — random hex string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OAUTH_STATE_KV_ENCRYPTION_KEYS and OAUTH_TOKEN_KV_ENCRYPTION_KEYS
# JSON array of base64-encoded 32-byte keys (supports key rotation; start with one)
node -e "console.log(JSON.stringify([require('crypto').randomBytes(32).toString('base64')]))"

# WEBHOOK_TAP_SECRET — random hex string (must match TAP_ADMIN_PASSWORD in your Tap deployment)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**4. Set up Tap**

Deploy [Tap](https://github.com/bluesky-social/indigo/tree/main/cmd/tap) to a long-lived host (Railway, Fly.io, a VPS). Configure it to point at the Bluesky relay and deliver webhooks to your worker:

```sh
TAP_RELAY_URL=wss://bsky.network
TAP_SIGNAL_COLLECTION=xyz.statusphere.status
TAP_COLLECTION_FILTERS=xyz.statusphere.status
TAP_WEBHOOK_URL=https://rwsdk-atproto-starter-{env}.{your-account}.workers.dev/webhooks/tap
TAP_ADMIN_PASSWORD=<same value as WEBHOOK_TAP_SECRET>
```

### Deploying

```sh
CLOUDFLARE_ENV=integration pnpm deploy
```

The deploy script builds the app, applies any pending D1 migrations, and deploys the worker — in that order.

### GitHub Actions

A minimal workflow that deploys to integration on every push to `main`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 26
          cache: pnpm
      - run: pnpm install
      - run: pnpm deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_ENV: integration
```

For staging and production, add additional jobs with `needs: [deploy]` and the appropriate `CLOUDFLARE_ENV` value, or trigger them manually using `workflow_dispatch` with an environment input.

## Further reading

- [RedwoodSDK docs](https://docs.rwsdk.com/)
- [AT Protocol docs](https://atproto.com/docs)
- [Cloudflare Workers docs](https://developers.cloudflare.com/workers)
- [Statusphere tutorial](https://atproto.com/guides/statusphere-tutorial) — the AT Protocol tutorial this series builds on
- [OpenMeet-Team docker compose setup](https://github.com/OpenMeet-Team/atproto-devnet) - the docker-compose for AT Proto this series also used as inspiration
