# rwsdk + AT Protocol Starter

A starter kit for building [AT Protocol](https://atproto.com) applications on [RedwoodSDK](https://rwsdk.dev) and [Cloudflare Workers](https://developers.cloudflare.com/workers).

This is the companion code for a [blog series](https://arsdehnel.com/posts) that walks through building a real AT Protocol app from scratch — reading public records, authenticating with OAuth, writing to your PDS, and eventually running your own AppView that indexes records from other users.

## What's in the series

Each branch represents the state of the code at the end of that post. `main` is the final result.

| # | Post | Branch |
|---|------|--------|
| 1 | Your First AT Protocol Read | `post/01-first-read` |
| 2 | AT Protocol OAuth with rwsdk and Cloudflare Workers | `post/02-oauth` |
| 3 | Local Development with Docker Compose | `post/03-devnet` |
| 4 | Lexicons and Writing to Your PDS | `post/04-lexicons` |
| 5 | Reacting to Changes with Tap and Jetstream | `post/05-tap-jetstream` |
| 6 | Persistence with D1 and Drizzle | `post/06-d1-drizzle` |
| 7 | Building a Feed — You're an AppView Now | `post/07-feed` |
| 8 | Where to Go From Here | `post/08-next-steps` |

## What you'll end up with

- **[rwsdk](https://rwsdk.dev)** app running on [Cloudflare Workers](https://developers.cloudflare.com/workers) + [Vite](https://vite.dev)
- AT Protocol OAuth login against real [Bluesky](https://bsky.app) accounts or a local devnet
- Typed record reads and writes via a [lexicon](https://atproto.com/specs/lexicon) client
- Webhook-driven updates via [Tap](https://www.npmjs.com/package/@atproto/tap) and [Jetstream](https://github.com/bluesky-social/jetstream) — no polling
- Data persistence with [Cloudflare D1](https://developers.cloudflare.com/d1) and [Drizzle ORM](https://orm.drizzle.team)
- Full local devnet via [Docker Compose](https://docs.docker.com/compose)

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
