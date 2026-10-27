# rwsdk + AT Protocol Starter

A starter kit for building [AT Protocol](https://atproto.com) applications on [RedwoodSDK](https://rwsdk.dev) and [Cloudflare Workers](https://developers.cloudflare.com/workers).

This is the companion code for a blog series that walks through building a real AT Protocol app from scratch.

## The series

For each step there are three links:
- The blog post walking through the desired outcome, interesting challenges, trade-offs, and code-snippets related to getting it working
- The `git` branch that is the working code as of the end of the step
- The PR showing the code changes involved made in that step

<table>
  <thead>
    <tr>
      <th>Post</th>
      <th>Title / Blog Post</th>
      <th>Intro</th>
      <th>Git Branch</th>
      <th>GitHub PR</th>
    </tr>
  </thead>
  <tbody>
    <tr class="series-header">
      <td colspan="5"><strong>Series 1: Local Dev Foundation</strong></td>
    </tr>
    <tr>
      <td>1</td>
      <td><a href="https://arsdehnel.com/posts/rwsdk-atp-s1-p1-get-started">Get Started</a></td>
      <td>Start from a fresh RWSDK app and fetch your first live AT Protocol records — no account, no auth required</td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/series-1/01-get-started"><code>post/series-1/01-get-started</code></a></td>
      <td>n/a (initial <code>create-rwsdk</code> app)</td>
    </tr>
    <tr>
      <td>2</td>
      <td><a href="https://arsdehnel.com/posts/rwsdk-atp-s1-p2-atp-oauth">AT Protocol OAuth</a></td>
      <td>Wire up AT Protocol OAuth 2.0 + PKCE so the feed is fetched on behalf of a logged-in Bluesky user</td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/series-1/02-atp-oauth"><code>post/series-1/02-atp-oauth</code></a></td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/pull/98">PR #98</a></td>
    </tr>
    <tr>
      <td>3</td>
      <td><a href="https://arsdehnel.com/posts/rwsdk-atp-s1-p3-local-dev">Local Dev Setup</a></td>
      <td>Run a full local AT Protocol stack — PDS, AppView, Tap — in Docker Compose, OAuth against localhost</td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/series-1/03-local-dev"><code>post/series-1/03-local-dev</code></a></td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/pull/99">PR #99</a></td>
    </tr>
    <tr>
      <td>4</td>
      <td><a href="https://arsdehnel.com/posts/rwsdk-atp-s1-p4-atp-writes">AT Protocol Writes</a></td>
      <td>Define a lexicon, codegen TypeScript types, and write records to the local PDS using XRPC</td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/series-1/04-atp-writes"><code>post/series-1/04-atp-writes</code></a></td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/pull/100">PR #100</a></td>
    </tr>
    <tr>
      <td>5</td>
      <td><a href="https://arsdehnel.com/posts/rwsdk-atp-s1-p5-tap-sync">Tap Sync</a></td>
      <td>Connect to the AT Protocol firehose via Tap to sync status records from other users in real time</td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/series-1/05-tap-sync"><code>post/series-1/05-tap-sync</code></a></td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/pull/75">PR #75</a></td>
    </tr>
    <tr class="series-header">
      <td colspan="5"><strong>Series 2: Production Ready</strong></td>
    </tr>
    <tr>
      <td>1</td>
      <td><a href="https://arsdehnel.com/posts/rwsdk-atp-s2-p1-production-oauth">Production OAuth</a></td>
      <td>Swap the loopback OAuth client for a confidential client that works with any AT Protocol PDS</td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/series-2/01-production-oauth"><code>post/series-2/01-production-oauth</code></a></td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/pull/78">PR #78</a></td>
    </tr>
    <tr>
      <td>2</td>
      <td><a href="https://arsdehnel.com/posts/rwsdk-atp-s2-p2-d1-persistence">D1 Persistence</a></td>
      <td>Add Cloudflare D1 as a relational store for status records synced from the Tap firehose</td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/series-2/02-d1-persistence"><code>post/series-2/02-d1-persistence</code></a></td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/pull/101">PR #101</a></td>
    </tr>
    <tr>
      <td>3</td>
      <td><a href="https://arsdehnel.com/posts/rwsdk-atp-s2-p3-appview-features">AppView Features</a></td>
      <td>Add AppView-style aggregations — reading community data from D1, not from individual PDSs</td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/series-2/03-appview-features"><code>post/series-2/03-appview-features</code></a></td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/pull/102">PR #102</a></td>
    </tr>
    <tr>
      <td>4</td>
      <td><a href="https://arsdehnel.com/posts/rwsdk-atp-s2-p4-deploy-prep">Deploy Prep</a></td>
      <td>Wire up production secrets, configure environment variables, and deploy to Cloudflare Workers</td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/series-2/04-deploy-prep"><code>post/series-2/04-deploy-prep</code></a></td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/pull/103">PR #103</a></td>
    </tr>
    <tr>
      <td>5</td>
      <td><a href="https://arsdehnel.com/posts/rwsdk-atp-s2-p5-next-steps">Next Steps</a></td>
      <td>The production-ready starting point — the complete app deployed and live, with what to harden next</td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/series-2/05-next-steps"><code>post/series-2/05-next-steps</code></a></td>
      <td><a href="https://github.com/arsdehnel/rwsdk-atproto-starter/pull/104">PR #104</a></td>
    </tr>
  </tbody>
</table>

## What you'll end up with

- A working [rwsdk](https://rwsdk.dev) app built for [Cloudflare Workers](https://developers.cloudflare.com/workers), running locally via [Vite](https://vite.dev)
- AT Protocol OAuth login — against a local PDS in dev, or a real [Bluesky](https://bsky.app) account when you point it there
- Typed record reads and writes via a [lexicon](https://atproto.com/specs/lexicon) client
- Real-time record updates via [Tap](https://www.npmjs.com/package/@atproto/tap) webhooks and SSE
- State that survives a restart with [Cloudflare D1](https://developers.cloudflare.com/d1) and [Drizzle ORM](https://orm.drizzle.team)
- A full local dev stack via [Docker Compose](https://docs.docker.com/compose) so you never have to touch prod infrastructure

## Get started

This will get you the end result. Change to whatever branch you want for the step you're digging into once you've cloned the repo. The `main` branch mirrors the final result of Series 2.

```sh
git clone https://github.com/arsdehnel/rwsdk-atproto-starter
cd rwsdk-atproto-starter
pnpm install
pnpm dev
```
