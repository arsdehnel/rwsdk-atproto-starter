import { env } from "cloudflare:workers";
import type { RequestInfo } from "rwsdk/worker";
import type { AppContext } from "@/worker";

import { LoginForm } from "@/components/login-form/login-form";
import { StatusPicker } from "@/components/status-picker/status-picker";
import { StatusFeed } from "@/components/status-feed/status-feed";
import { statusStore } from "@/lib/status-store";

export async function Home({ ctx }: RequestInfo<AppContext>) {
  const did = ctx.session?.did ?? null;
  const { ATPROTO_PDS_URL: pdsUrl } = env;

  let userHandle: string | null = null;
  // Current status comes from the in-memory Tap store, not a direct PDS read.
  // On a fresh worker start the store is empty, so this will be null until the
  // first pick fires a webhook. Post 6 fixes that with D1.
  const currentStatus = did ? (statusStore.get(did)?.status ?? null) : null;

  if (did) {
    // Resolve the user's handle from the PDS — this is fine, it's identity
    // metadata, not application data. Reading application data (statuses)
    // directly from the PDS is the anti-pattern this post replaces.
    const res = await fetch(`${pdsUrl}/xrpc/com.atproto.repo.describeRepo?repo=${did}`);
    const data = (await res.json()) as { handle?: string };
    userHandle = data.handle ?? null;
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">rwsdk + AT Protocol</h1>
        <p className="subtitle">
          A starter kit for building{" "}
          <a href="https://atproto.com" target="_blank" rel="noreferrer" className="link">
            AT Protocol
          </a>{" "}
          apps on{" "}
          <a href="https://rwsdk.dev" target="_blank" rel="noreferrer" className="link">
            RedwoodSDK
          </a>{" "}
          and{" "}
          <a href="https://developers.cloudflare.com/workers" target="_blank" rel="noreferrer" className="link">
            Cloudflare Workers
          </a>
          .
        </p>
      </header>

      <main>
        {did ? (
          <>
            <section className="section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h2 className="sectionTitle">
                  Signed in{userHandle ? ` as @${userHandle}` : ""}
                </h2>
                <form method="post" action="/oauth/logout">
                  <button type="submit" className="signOutButton">Sign out</button>
                </form>
              </div>
              <p className="prose">
                <code className="inlineCode">{did}</code>
              </p>
            </section>

            <section className="section">
              <h2 className="sectionTitle">Your status</h2>
              <p className="prose">
                Pick an emoji. It gets written to your PDS as an{" "}
                <code className="inlineCode">xyz.statusphere.status</code> record,
                then Tap picks it up from the firehose and delivers it to the
                feed below — no PDS read required.
              </p>
              <StatusPicker currentStatus={currentStatus} />
            </section>

            <section className="section">
              <h2 className="sectionTitle">Live from Tap</h2>
              <p className="prose">
                Pick a status above. The write goes to your PDS, which emits a
                firehose event. Tap subscribes to the firehose, filters for{" "}
                <code className="inlineCode">xyz.statusphere.status</code> records,
                and delivers a webhook to{" "}
                <code className="inlineCode">POST /webhooks/tap</code>. The worker
                updates its in-memory store and pushes the new list to all open
                SSE connections — no polling, no page reload.
              </p>
              <StatusFeed initialStatuses={Array.from(statusStore.values())} />
            </section>
          </>
        ) : (
          <>
            <section className="section">
              <h2 className="sectionTitle">Sign in with AT Protocol</h2>
              <p className="prose">
                Enter your handle to authenticate via AT Protocol OAuth.
                You'll be redirected to your PDS to approve access, then back here.
              </p>
              <LoginForm />
            </section>

            <section className="section">
              <h2 className="sectionTitle">Live from the AT Protocol</h2>
              <p className="prose">
                Sign in above to see your recent posts pulled live from your PDS.
              </p>
            </section>
          </>
        )}

        <section className="section">
          <h2 className="sectionTitle">What you're building</h2>
          <p className="prose">
            You're on Post 2 of a{" "}
            <a href="https://arsdehnel.com/posts" target="_blank" rel="noreferrer" className="link">
              blog series
            </a>{" "}
            that builds a real AT Protocol app from scratch — one step at a time. By the end the series covers:
          </p>
          <ul className="featureList">
            <li>
              AT Protocol OAuth login against real{" "}
              <a href="https://bsky.app" target="_blank" rel="noreferrer" className="link">
                Bluesky
              </a>{" "}
              accounts or a local devnet
            </li>
            <li>
              Read and write records using a typed{" "}
              <a href="https://atproto.com/specs/lexicon" target="_blank" rel="noreferrer" className="link">
                lexicon
              </a>{" "}
              client
            </li>
            <li>
              React to record changes with{" "}
              <a href="https://www.npmjs.com/package/@atproto/tap" target="_blank" rel="noreferrer" className="link">
                Tap
              </a>{" "}
              and{" "}
              <a href="https://github.com/bluesky-social/jetstream" target="_blank" rel="noreferrer" className="link">
                Jetstream
              </a>{" "}
              — no polling
            </li>
            <li>
              Persist indexed data with{" "}
              <a href="https://developers.cloudflare.com/d1" target="_blank" rel="noreferrer" className="link">
                Cloudflare D1
              </a>{" "}
              and{" "}
              <a href="https://orm.drizzle.team" target="_blank" rel="noreferrer" className="link">
                Drizzle
              </a>
            </li>
            <li>
              Full local devnet via{" "}
              <a href="https://docs.docker.com/compose" target="_blank" rel="noreferrer" className="link">
                Docker Compose
           </a>{" "}
              so you never test against production
            </li>
          </ul>
        </section>

        <section className="section">
          <h2 className="sectionTitle">The series</h2>
          <ol className="seriesList">
            <li><a href="https://arsdehnel.com/posts/rwsdk-atproto-01-first-read" target="_blank" rel="noreferrer" className="link">Your First AT Protocol Read</a></li>
            <li>AT Protocol OAuth with rwsdk and Cloudflare Workers</li>
            <li>Local Development with Docker Compose</li>
            <li>Lexicons and Writing to Your PDS</li>
            <li><strong>Reacting to Changes with Tap</strong> — you are here</li>
            <li>Persistence with D1 and Drizzle</li>
            <li>Building a Feed — You're an AppView Now</li>
            <li>Where to Go From Here</li>
          </ol>
          <p className="prose">
            Each post has a corresponding branch in this repo. Check out{" "}
            <code className="inlineCode">post/05-tap-jetstream</code> to keep going, or read the full series at{" "}
            <a href="https://arsdehnel.com/posts" target="_blank" rel="noreferrer" className="link">
              arsdehnel.com/posts
            </a>
            .
          </p>
        </section>

        <section className="section">
          <h2 className="sectionTitle">Run it yourself</h2>
          <div className="codeBlock">
            <span className="codePrompt">$</span>
            <code>git clone https://github.com/arsdehnel/rwsdk-atproto-starter</code>
          </div>
          <div className="codeBlock">
            <span className="codePrompt">$</span>
            <code>git checkout post/05-tap-jetstream</code>
          </div>
          <div className="codeBlock">
            <span className="codePrompt">$</span>
            <code>pnpm install && pnpm docker:up && pnpm dev</code>
          </div>
          <p className="prose">
            Log in with <code className="inlineCode">alice.devnet.test</code> / <code className="inlineCode">alice-devnet-pass</code>.
            Open{" "}
            <a href="http://127.0.0.1:5173" className="link">
              127.0.0.1:5173
            </a>
            , not <code className="inlineCode">localhost:5173</code>. The OAuth
            redirect URI is registered as <code className="inlineCode">http://127.0.0.1:5173/oauth/callback</code> —
            after the PDS approves access it sends the browser back to that exact address.
          </p>
        </section>
      </main>
    </div>
  );
}
