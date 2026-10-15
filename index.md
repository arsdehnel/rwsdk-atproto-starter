# rwsdk + AT Protocol Starter

A starter kit for building [AT Protocol](https://atproto.com) applications on [RedwoodSDK](https://rwsdk.dev) and [Cloudflare Workers](https://developers.cloudflare.com/workers).

This is the companion code for a blog series that walks through building a real AT Protocol app from scratch.

## The series

Each branch is the complete, working state of the code at the end of that post.

| Step | Title           | Intro                                                                       | Blog Post                                                                        | Git Branch                                                                                                   |
| ---- | --------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1    | First Read      | Fetch and display public AT Protocol records without authenticating         | [First Read](https://arsdehnel.com/posts/rwsdk-atproto-01-first-read/)           | [`post/01-first-read`](https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/01-first-read)           |
| 2    | AT Proto OAuth  | Wire up OAuth login against a real Bluesky account                          | [AT Proto OAuth](https://arsdehnel.com/posts/rwsdk-atproto-02-atproto-oauth/)    | [`post/02-atproto-oauth`](https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/02-atproto-oauth)     |
| 3    | Local Dev Setup | Run a full AT Protocol PDS and PLC locally in Docker — no prod dependency   | [Local Dev Setup](https://arsdehnel.com/posts/rwsdk-atproto-03-local-dev-setup/) | [`post/03-local-dev-setup`](https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/03-local-dev-setup) |
| 4    | AT Proto Writes | Define a lexicon, codegen TypeScript types, and write records to your PDS   | [AT Proto Writes](https://arsdehnel.com/posts/rwsdk-atproto-04-atproto-writes/)  | [`post/04-atproto-writes`](https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/04-atproto-writes)   |
| 5    | Tap Sync        | React to new records in real time using Tap webhooks and SSE                | [Tap Sync](https://arsdehnel.com/posts/rwsdk-atproto-05-tap-sync/)               | [`post/05-tap-sync`](https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/05-tap-sync)               |
| 6    | D1 Persistence  | Swap in-memory state for D1 and Drizzle so data survives a restart          | [D1 Persistence](https://arsdehnel.com/posts/rwsdk-atproto-06-d1-persistence/)   | [`post/06-d1-persistence`](https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/06-d1-persistence)   |
| 7    | AppView         | Index records from multiple users and serve a public status board           | [AppView](https://arsdehnel.com/posts/rwsdk-atproto-07-app-view/)                | [`post/07-appview`](https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/07-appview)                 |
| 8    | Next Steps      | What's left open, what to harden before going further, and where to take it | [Next Steps](https://arsdehnel.com/posts/rwsdk-atproto-08-next-steps/)           | [`post/08-next-steps`](https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/08-next-steps)           |

## What you'll end up with

- A working [rwsdk](https://rwsdk.dev) app built for [Cloudflare Workers](https://developers.cloudflare.com/workers), running locally via [Vite](https://vite.dev)
- AT Protocol OAuth login — against a local PDS in dev, or a real [Bluesky](https://bsky.app) account when you point it there
- Typed record reads and writes via a [lexicon](https://atproto.com/specs/lexicon) client
- Real-time record updates via [Tap](https://www.npmjs.com/package/@atproto/tap) webhooks and SSE
- State that survives a restart with [Cloudflare D1](https://developers.cloudflare.com/d1) and [Drizzle ORM](https://orm.drizzle.team)
- A full local dev stack via [Docker Compose](https://docs.docker.com/compose) so you never have to touch prod infrastructure

## Get started

This will get you the end result.  Change to whatever branch you want for the step you're digging into. 

```sh
git clone https://github.com/arsdehnel/rwsdk-atproto-starter
cd rwsdk-atproto-starter
pnpm install
pnpm dev
```
