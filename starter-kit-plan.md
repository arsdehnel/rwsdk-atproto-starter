# rwsdk + AT Protocol Starter Kit — Plan

This document is the full context dump for the starter kit project and blog series. It was written by a Claude session that spent multiple sessions building and debugging an AT Protocol app on rwsdk from scratch, so the technical details here reflect actual working code, not documentation guesses.

---

## Background

The gratitude journal project at `kad-products/gratitude-journal` is the reference implementation. It is a [RedwoodSDK (rwsdk)](https://rwsdk.dev) app running on Cloudflare Workers + Vite, using AT Protocol OAuth for authentication and AT Protocol records as the data store. It was built by working through the [atproto.com statusphere tutorial](https://atproto.com/guides/statusphere-tutorial) but diverging in two significant ways:

1. **Stack**: rwsdk on Cloudflare Workers/workerd instead of Next.js on Node.js
2. **Dev environment**: full local devnet via Docker Compose instead of building against the real atmosphere

The OAuth flow, record writes, and lexicon usage are all working end-to-end. 

---

## Goal: Starter Kit

Create a new repo (`rwsdk-atproto-starter` or similar) that someone can clone and have a working foundation for:

- rwsdk app running on Cloudflare Workers
- AT Protocol OAuth login (against real atmosphere OR local devnet)
- Reading and writing records via the `@atproto/lex` Client
- Docker Compose devnet for local development

### Intended repo structure

```
rwsdk-atproto-starter/
├── src/
│   ├── api/
│   │   ├── oauth-login.ts       # POST /api/oauth/login — initiates OAuth, returns redirect URL
│   │   ├── oauth-callback.ts    # GET /oauth/callback — handles token exchange, sets did cookie
│   │   ├── oauth-logout.ts      # POST /api/oauth/logout — revokes session, clears cookie
│   │   └── utils.ts             # successResponse<T>, apiErrorResponse helpers
│   ├── lib/
│   │   └── auth/
│   │       ├── client.ts        # NodeOAuthClient singleton with devnet rewrite logic
│   │       └── session.ts       # getSession(request), getDid(request)
│   ├── components/
│   │   └── LoginForm.tsx        # handle input + submit, reads back from successResponse envelope
│   ├── pages/
│   │   └── root.tsx             # root page, reads session
│   └── lexicons/                # gitignored — output of `pnpm generate`
├── lexicons/                    # user-defined lexicon JSON files go here
├── scripts/
│   └── fix-env-types.ts         # strips optional markers from wrangler-generated types
├── docker-compose.dev.yml       # starts minimal (PDS, PLC); Jetstream + Tap added in post 5
├── wrangler.jsonc               # includes ATPROTO_* env vars
├── vite.config.mts              # includes patchAtprotoRedirectError() plugin
├── biome.json
├── tsconfig.json
├── .dev.vars.example            # template for local secrets
└── package.json
```

---

## Goal: Blog Post Series

A series of posts on the author's own site, written in their own voice, about building AT Protocol apps with rwsdk and Docker Compose. The audience is someone familiar with web development who wants to build on AT Protocol using a modern edge framework — not Next.js on Node, and not building against the real atmosphere and guessing what it does.

**Approach:** problem-driven. AT Protocol concepts (PLC, Jetstream, Tap, AppView) appear when the code first needs them, not upfront as a prerequisite list. Each post has a concrete feature as its deliverable.

### Proposed series (8 posts)

---

#### Post 1: The rwsdk Starter Kit + Your First AT Protocol Read

**Feature:** fetch and display a public record from the real atmosphere — no auth, no schema, just a raw XRPC call.

The hook: AT Protocol records are public and readable over plain HTTP. Show this immediately — a `fetch` to `https://bsky.social/xrpc/com.atproto.repo.listRecords?...` returns JSON. No account needed.

- Introduce the starter kit repo — what's in it, how to run it
- Make one raw XRPC `fetch` to read a public record from bsky.social
- Show what the response looks like — this is the data model
- Introduce just enough vocabulary to make sense of the response: PDS, XRPC, AT URI, collection, rkey

No lex client yet. No auth. The point is to show what the data looks like before adding any complexity.

---

#### Post 2: AT Protocol OAuth with rwsdk and Cloudflare Workers

**Feature:** log in with a real Bluesky account and read the logged-in user's own records.

Motivation from post 1: "we could read public records anonymously — now let's authenticate so we can read our own private records and eventually write."

**Diagram 1: The OAuth flow**
```
Browser                    Worker (workerd)                    PDS
  |                              |                                  |
  |── POST /api/oauth/login ────→|                                  |
  |   { handle: "alice.bsky.social" }                               |
  |                              |── resolveHandle ───────────────→ |
  |                              |← DID document ──────────────────|
  |                              |── fetch /.well-known/oauth-* ──→|
  |                              |← protected resource metadata ───|
  |                              |── PAR request ─────────────────→|
  |                              |← request_uri ───────────────────|
  |← { redirectUrl } ───────────|                                  |
  |── GET {redirectUrl} ─────────────────────────────────────────→ |
  |   (PDS login + authorize UI)                                    |
  |← 302 to /oauth/callback?code=... ──────────────────────────── |
  |── GET /oauth/callback ──────→|                                  |
  |                              |── token exchange ──────────────→|
  |                              |← access + refresh tokens ───────|
  |← 302 / (Set-Cookie: did=...) |                                  |
```

Key implementation points:
- `NodeOAuthClient` from `@atproto/oauth-client-node`
- `buildAtprotoLoopbackClientMetadata` for loopback redirect URIs
- `handleResolver: pdsUrl` as a string (not `AtprotoHandleResolverNode` — that uses undici, unavailable in workerd)
- `stateStore` / `sessionStore` as in-memory Maps on `globalThis`
- Session identified by `did` cookie; `client.restore(did)` retrieves the session

**Workerd-specific gotchas (all required):**

1. **`redirect: "error"` rejection** — workerd rejects this in `fetch()` and `new Request()`. The `@atproto-labs` packages use it pervasively. Fix: Vite plugin that rewrites all occurrences in `@atproto/*` bundles to `'follow'`.

2. **HTTP resource metadata** — `OAuthProtectedResourceMetadataResolver` blocks HTTP URLs. Not relevant against bsky.social (HTTPS), but document it here so post 3 can reference it.

3. **`use_dpop_nonce` log entries** — the PDS logs a 401 on the first authenticated request. This is the DPoP nonce handshake, not an error. The client retries automatically.

Against the real atmosphere (bsky.social), the Docker DNS rewrite and `allowHttp` gotchas don't apply — those are devnet-only. Mention them briefly so readers know they're coming.

---

#### Post 3: Local Development with Docker Compose

**Feature:** OAuth login works against a local PDS — no real accounts, no production traffic.

Motivation from post 2: "every time we test auth we're hitting production. Let's fix that."

Services needed at this stage (keep it minimal):
- **pds** — the local PDS
- **plc** — local DID resolver; explain why it's needed: `did:plc:*` DIDs resolve via PLC, which defaults to `https://plc.directory`. In the devnet we need a local one.
- **maildev** — *investigate whether this is actually required*. If the PDS can create accounts via its admin API without sending email, leave it out. Include it if the PDS won't start or account creation fails without a valid SMTP config.

Jetstream and Tap are NOT in this compose file yet. They'll appear in post 5 when they're motivated.

Critical PDS config:
```yaml
pds:
  environment:
    PDS_HOSTNAME: localhost       # browser's Origin must match
    PDS_DEV_MODE: "true"          # allows HTTP issuer/resource URLs
```

Without `PDS_HOSTNAME: localhost` → `BadRequestError: Invalid origin`.
Without `PDS_DEV_MODE: "true"` → `Error: Resource URL must use the https scheme`.

Additional devnet-specific OAuth gotchas (building on post 2):
- **Docker DNS rewrite** — the worker is inside Docker and can't reach `http://localhost:3000`. All worker-side OAuth fetches must be rewritten from `ATPROTO_PDS_CANONICAL_URL` → `ATPROTO_PDS_URL` (the Docker-internal address). DPoP `htu` is unaffected — it's set from the canonical URL before the rewrite.
- **`allowHttp`** — `OAuthProtectedResourceMetadataResolver` blocks HTTP URLs unless `allowHttp: true` is set on `NodeOAuthClient`. Gate on `pdsCanonicalUrl.startsWith('http:')`.

Env vars (wrangler.jsonc):
```json
"ATPROTO_PDS_URL": "http://pds:3000",
"ATPROTO_PLC_URL": "http://plc:2582",
"ATPROTO_PDS_CANONICAL_URL": "http://localhost:3000",
"ATPROTO_PDS_BROWSER_URL": "http://localhost:3000"
```

Explain the two-URL split: `ATPROTO_PDS_URL` is Docker-internal; `ATPROTO_PDS_CANONICAL_URL` is what appears in DID documents (what browser and OAuth flow see).

**Post 3 payoff:** log in with a local test account, see your DID, confirm the session works. No record reading yet — that comes in post 4.

---

#### Post 4: Lexicons and Writing to Your PDS

**Feature:** define a lexicon, write a record to the local PDS, read it back.

- What a lexicon is: a JSON schema that defines a record type by NSID
- Show `xyz/statusphere/status.json`
- Generate TypeScript with `@atproto/lex`: `pnpm generate` → `src/lexicons/` (gitignore the output)
- The `@atproto/lex` `Client` class

**Two-tier client API:**

|             | High-level                               | Low-level                                                               |
| ----------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| Methods     | `create`, `put`, `get`, `list`, `delete` | `createRecord`, `putRecord`, `getRecord`, `listRecords`, `deleteRecord` |
| First arg   | `RecordSchema` (the schema object)       | `TypedLexMap` (plain object with `$type`)                               |
| Record data | fields only, no `$type`                  | must include `$type` (use `$build()` or inline)                         |
| Returns     | body directly                            | `XrpcResponse<M>` — body under `.body`                                  |

**Singleton vs. append records:**
- `create` — always appends with a generated rkey. Use for posts, likes, follows.
- `put` — upserts at a specific rkey. Use for "current state" records. Convention: `rkey: 'self'` for one-per-user.

AT Protocol has no partial update / PATCH semantics. `put` replaces the record wholesale.

**Verifying records locally** (no atproto.at needed):
```bash
curl "http://localhost:3000/xrpc/com.atproto.repo.listRecords?repo=<DID>&collection=xyz.statusphere.status" | jq .
```

**Important caveat to end the post on:** reading back from the PDS immediately after writing works, but it's an anti-pattern. We wrote to the PDS, then asked the same PDS for the data back. That doesn't scale and it's not how the ecosystem is designed. In the real atmosphere you wouldn't query every user's PDS directly — you'd ask an AppView that has already indexed the relevant records from everywhere. That's what post 5 addresses.

---

#### Post 5: Reacting to Changes with Tap and Jetstream

**Feature:** receive a webhook when a record changes; display updates reactively without polling.

Motivation from post 4: "reading back from the PDS directly is an anti-pattern. The right pattern is to write to the PDS and let an AppView deliver the data to you."

Add to docker-compose:
- **Jetstream** — a JSON-based event stream that sits in front of the PDS; downstream subscribers connect to it instead of tailing the raw CBOR firehose
- **Tap** — an AppView that subscribes to Jetstream, filters for records matching your lexicons, and delivers them as webhooks to your app

**Diagram 2: The write → event → webhook loop**
```
[Your App]                [PDS]              [Jetstream]         [Tap AppView]
     |                      |                     |                    |
     |── PUT record ────────→|                     |                    |
     |                      |── event ────────────→|                    |
     |                      |                     |── filtered event ──→|
     |                      |                     |              [Tap indexes]
     |                      |                     |                    |
     |← POST /webhooks/tap ───────────────────────────────────────────|
     |   { records: [...] } |                     |                    |
     |── re-render UI ──────|                     |                    |
```

Key concepts:
- Your app registers a webhook URL with Tap
- Tap calls your webhook with the record data when something changes — you don't poll
- The webhook payload contains the actual record, not just a notification
- Data is still not persisted — if the server restarts, the state is lost (motivation for post 6)

Wire up a `/webhooks/tap` POST endpoint in the rwsdk app. Display the incoming data in the UI.

---

#### Post 6: Persistence with D1 and Drizzle

**Feature:** incoming Tap data is stored in a database and survives server restarts.

Motivation from post 5: "every time we restart the dev server, the state is gone. We need persistence."

- Add Cloudflare D1 to the project (local dev mode with Wrangler)
- Add Drizzle ORM: schema definition, migrations, typed queries
- Store incoming webhook payloads into D1
- Read from D1 on page load instead of keeping state in memory

At this point the app has a database, but the UI is still showing only the current user's own data. The payoff for actually having an index comes in post 7.

---

#### Post 7: Building a Feed — You're an AppView Now

**Feature:** display a feed of statuses from all users, sourced from the D1 index.

Motivation from post 6: "we're storing records from Tap, but we're still only showing our own data. The whole point of indexing is to serve a view across many users."

- Query D1 for records from all users
- Render a social feed
- This is the "AppView" concept fully landed: you're not calling anyone else's PDS; you're serving your own view of the data you've indexed

Zoom out: explain how this maps to the real atmosphere. Bluesky's AppView (app.bsky.app) does exactly this at scale — it subscribes to the global relay, indexes records from every PDS, and serves its own query interface. You just built a tiny version of that.

Brief "where does this fit" diagram connecting the full picture — PDS → Jetstream → Tap → your D1 → your UI.

---

#### Post 8: Where to Go From Here

A short reference post — no new code.

Topics to cover:
- Switching from devnet to the real atmosphere (remove the `ATPROTO_*` env vars; client defaults kick in)
- Deploying to Cloudflare Workers + D1 in production
- Designing your own lexicons (NSID conventions, versioning)
- OAuth with real Bluesky accounts vs. self-hosted PDS accounts
- The broader AT Protocol ecosystem: what else is out there, further reading

---

## Technical Reference (for the new session)

Everything in this section was learned the hard way. Keep it close.

### Working env var set for devnet (wrangler.jsonc)

```json
{
  "vars": {
    "ATPROTO_PDS_URL": "http://pds:3000",
    "ATPROTO_PLC_URL": "http://plc:2582",
    "ATPROTO_PDS_CANONICAL_URL": "http://localhost:3000",
    "ATPROTO_PDS_BROWSER_URL": "http://localhost:3000"
  }
}
```

For production against the real atmosphere, remove all four — the OAuth client defaults work. Or set `ATPROTO_PDS_URL` and `ATPROTO_PDS_BROWSER_URL` to a specific PDS if the app only targets one.

### Working docker-compose.dev.yml PDS config

```yaml
pds:
  environment:
    PDS_EMAIL_SMTP_URL: smtp://maildev:1025
    PDS_HOSTNAME: localhost       # critical — must match browser's Origin
    PDS_DEV_MODE: "true"          # critical — allows HTTP issuer/resource URLs
    LOG_LEVEL: warn
```

Without `PDS_DEV_MODE: "true"`, PDS fails to start with `Error: Resource URL must use the https scheme`.
Without `PDS_HOSTNAME: localhost`, the browser's `Origin` header doesn't match PDS's `validateOrigin` check → `BadRequestError: Invalid origin`.

### NodeOAuthClient constructor (src/lib/auth/client.ts)

```typescript
const { ATPROTO_PDS_URL: pdsUrl, ATPROTO_PLC_URL: plcUrl, ATPROTO_PDS_CANONICAL_URL: pdsCanonicalUrl } = env;
const oauthFetch = pdsCanonicalUrl
  ? createCanonicalRewriteFetch(globalThis.fetch, pdsCanonicalUrl, pdsUrl)
  : globalThis.fetch;

client = new NodeOAuthClient({
  fetch: oauthFetch,
  handleResolver: pdsUrl,            // string URL, not AtprotoHandleResolverNode (avoids undici)
  plcDirectoryUrl: plcUrl,           // override for devnet; default is https://plc.directory
  allowHttp: pdsCanonicalUrl.startsWith('http:'),  // required for devnet HTTP endpoints
  clientMetadata: buildAtprotoLoopbackClientMetadata({
    scope: 'atproto',
    redirect_uris: ['http://127.0.0.1:5173/oauth/callback'],
  }),
  stateStore: { ... },     // in-memory Map on globalThis
  sessionStore: { ... },   // in-memory Map on globalThis
});
```

### Session cookie pattern (src/lib/auth/session.ts)

```typescript
import { parseCookie } from 'cookie';

export async function getSession(request: Request): Promise<OAuthSession | null> {
  const did = getDid(request);
  if (!did) return null;
  try {
    const client = await getOAuthClient();
    return await client.restore(did);
  } catch {
    return null;
  }
}

export function getDid(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  return parseCookie(cookieHeader).did ?? null;
}
```

### Response envelope (src/api/utils.ts)

The API uses a `{ success: true, data: T }` envelope. Frontend must unwrap:
```typescript
const json = await res.json();
if (!res.ok) throw new Error(json.error || 'failed');
const thing = json.data.fieldName;  // NOT json.fieldName
```

### lex client — high vs low level

```typescript
// High-level (prefer this)
import statusSchema from '@/lexicons/xyz/statusphere/status';
const res = await lexClient.put(statusSchema, { status, createdAt }, { rkey: 'self' });
const uri = res.uri;  // body directly

// Low-level (when you need XrpcResponse)
import { $build } from '@/lexicons/xyz/statusphere/status.defs';
const res = await lexClient.putRecord($build({ status, createdAt }), 'self');
const uri = res.body.uri;  // body under .body
```

### patchAtprotoRedirectError Vite plugin (vite.config.mts)

This is required. Without it the worker crashes on startup because workerd rejects `redirect: "error"`.

```typescript
function patchAtprotoRedirectError(): Plugin {
  return {
    name: 'patch-atproto-redirect-error',
    transform(code: string, id: string): string | undefined {
      if (id.includes('@atproto') || id.includes('atproto-labs') || id.includes('atproto_oauth-client-node')) {
        return code.replace(/redirect:\s*['"]error['"]/g, "redirect: 'follow'");
      }
    },
  };
}
```

Add to the `plugins` array in `defineConfig`.

### Key packages

```
@atproto/oauth-client-node   — NodeOAuthClient, buildAtprotoLoopbackClientMetadata
@atproto/lex                 — Client (lex client), DatetimeString, etc.
cookie                       — parseCookie, stringifySetCookie (cookie@2)
```

---

## Return to the Gratitude Journal

The gratitude journal (`kad-products/gratitude-journal`, branch `initial-prototype`) is parked mid-tutorial. When returning:

1. **ctx.user** — the atproto session is not wired into the rwsdk request context. Decide on the shape: does `ctx.user` replace or sit alongside a traditional user record? Then build rwsdk middleware that reads the `did` cookie and populates `ctx.user`.
2. **Tap integration** — next tutorial step; reading status from other users via the Tap webhook.
3. **Reading records** — `lexClient.get(statusSchema, { rkey: 'self' })` or `lexClient.list(statusSchema)` for listing; both work against the local devnet.
