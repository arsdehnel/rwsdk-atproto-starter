# rwsdk + AT Protocol Starter

A step-by-step walkthrough of creating a starter kit for building  [AT Protocol](https://atproto.com) applications on [RedwoodSDK](https://rwsdk.dev) and [Cloudflare Workers](https://developers.cloudflare.com/workers).

This is the companion code for a [blog series](https://arsdehnel.com/posts) that walks through building a local development environment for an AT Protocol app from scratch — reading public records, authenticating with OAuth, writing to your PDS, and eventually running your own AppView that indexes records from other users.

## Prerequisites

- [Node.js](https://nodejs.org) 26.x
- [pnpm](https://pnpm.io)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is fine for development)
- [Docker](https://docs.docker.com/get-docker) (Post 3 and later — for running a local PDS)

## Getting started

How you get started is up to you but there are really two options.

### Option 1: Follow the series

If you're not super familiar with the [AT Protocol](https://atproto.com), [RedwoodSDK](https://rwsdk.dev), or [Cloudflare Workers](https://developers.cloudflare.com/workers) I'd suggest this path.  It'll start with a basic RWSDK starter app and layer on features of each of these three tools as they are needed.  

For this path I'd say take a look at [the project homepage](https://arsdehnel.github.io/rwsdk-atproto-starter/) for context and guidance on the series.  And then to get started these commands should do the trick.

```sh
git clone https://github.com/arsdehnel/rwsdk-atproto-starter
cd rwsdk-atproto-starter
git checkout post/01-first-read
pnpm install
pnpm dev
```

From there the blog posts and branches should walk you through things!

### Option 2: Run the final product

If you're ready to just run it or you want to see the final product before you invest the time to walk through things just pull this down and get started.

```sh
git clone https://github.com/arsdehnel/rwsdk-atproto-starter
cd rwsdk-atproto-starter
pnpm install
pnpm docker:up
pnpm migrate:dev
pnpm dev
```

`docker:up` starts postgres, plc, pds, maildev, and a one-shot init container that creates two test accounts. Once the worker is running, log in with `alice.devnet.test` / `alice-devnet-pass` or `bob.devnet.test` / `bob-devnet-pass`.

To watch the init container seed the accounts:

```sh
docker compose logs -f init
```

**Stopping the devnet**

```sh
pnpm docker:down
```

> **Note:** `docker:down` uses `-v`, which removes the PDS data volume. Test accounts are recreated automatically on the next `pnpm docker:up`.

**Resetting the local D1 database**

Each `pnpm docker:up` run recreates the local ATP accounts with new DIDs. Since the D1 statuses table is keyed by DID, restarting the docker setup leaves stale rows behind. Clear the local Miniflare state and re-run migrations to start fresh:

```sh
rm -rf .wrangler/state/v3/d1 && pnpm migrate:dev
```

## Further reading

- [RedwoodSDK docs](https://docs.rwsdk.com/)
- [AT Protocol docs](https://atproto.com/docs)
- [Cloudflare Workers docs](https://developers.cloudflare.com/workers)
- [Statusphere tutorial](https://atproto.com/guides/statusphere-tutorial) — the AT Protocol tutorial this series builds on
- [OpenMeet-Team docker compose setup](https://github.com/OpenMeet-Team/atproto-devnet) - the docker-compose for AT Proto this series also used as inspiration
