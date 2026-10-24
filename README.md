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

**Stopping the devnet**

```sh
pnpm docker:down
```

> **Note:** `docker:down` uses `-v`, which removes the PDS data volume. Test accounts are recreated automatically on the next `pnpm docker:up`.

## Further reading

- [RedwoodSDK docs](https://docs.rwsdk.com/)
- [AT Protocol docs](https://atproto.com/docs)
- [Cloudflare Workers docs](https://developers.cloudflare.com/workers)
- [Statusphere tutorial](https://atproto.com/guides/statusphere-tutorial) — the AT Protocol tutorial this series builds on
- [OpenMeet-Team docker compose setup](https://github.com/OpenMeet-Team/atproto-devnet) - the docker-compose for AT Proto this series also used as inspiration
