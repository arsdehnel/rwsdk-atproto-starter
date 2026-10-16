# rwsdk + AT Protocol Starter

A step-by-step walkthrough of creating a starter kit for building  [AT Protocol](https://atproto.com) applications on [RedwoodSDK](https://rwsdk.dev) and [Cloudflare Workers](https://developers.cloudflare.com/workers).

This is the companion code for a [blog series](https://arsdehnel.com/posts) that walks through building a local development environment for an AT Protocol app from scratch — reading public records, authenticating with OAuth, writing to your PDS, and eventually running your own AppView that indexes records from other users.

## Where this branch is at

Take a look [the series overview](https://arsdehnel.github.io/rwsdk-atproto-starter/) for a complete picture of things.  Right now you're on code for [Step 1: First ATP Read](https://arsdehnel.com/posts/rwsdk-atproto-01-first-read).

## Prerequisites

- [Node.js](https://nodejs.org) 26.x
- [pnpm](https://pnpm.io)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is fine for development)

## Getting started

```sh
git clone https://github.com/arsdehnel/rwsdk-atproto-starter
cd rwsdk-atproto-starter
pnpm install
pnpm dev
```

Point your browser to the URL shown in the terminal (typically `http://localhost:5173`).

## Further reading

- [RedwoodSDK docs](https://docs.rwsdk.com/)
- [AT Protocol docs](https://atproto.com/docs)
- [Cloudflare Workers docs](https://developers.cloudflare.com/workers)
- [Statusphere tutorial](https://atproto.com/guides/statusphere-tutorial) — the AT Protocol tutorial this series builds on
