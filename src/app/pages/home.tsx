import type { RequestInfo } from "rwsdk/worker";
import type { AppContext } from "@/worker";

import { BlueskyFeed } from "@/components/bluesky-feed/bluesky-feed";
import { LoginForm } from "@/components/login-form/login-form";

export async function Home({ ctx }: RequestInfo<AppContext>) {
  const did = ctx.session?.did ?? null;

  let userRecords = null;
  let userHandle: string | null = null;

  if (did) {
    const [recordsRes, handleRes] = await Promise.all([
      fetch(
        `https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=app.bsky.feed.post&limit=5`
      ),
      fetch(
        `https://bsky.social/xrpc/com.atproto.repo.describeRepo?repo=${did}`
      ),
    ]);
    userRecords = await recordsRes.json();
    const handleData = (await handleRes.json()) as { handle?: string };
    userHandle = handleData.handle ?? null;
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
              <h2 className="sectionTitle">Your recent posts</h2>
              <BlueskyFeed
                endpoint={`https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=app.bsky.feed.post&limit=5`}
                records={userRecords}
              />
            </section>
          </>
        ) : (
          <>
            <section className="section">
              <h2 className="sectionTitle">Sign in with Bluesky</h2>
              <p className="prose">
                Enter your Bluesky handle to authenticate via AT Protocol OAuth.
                You'll be redirected to Bluesky to approve access, then back here.
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
            <li><strong>AT Protocol OAuth with rwsdk and Cloudflare Workers</strong> — you are here</li>
            <li>Local Development with Docker Compose</li>
            <li>Lexicons and Writing to Your PDS</li>
            <li>Reacting to Changes with Tap and Jetstream</li>
            <li>Persistence with D1 and Drizzle</li>
            <li>Building a Feed — You're an AppView Now</li>
            <li>Where to Go From Here</li>
          </ol>
          <p className="prose">
            Each post has a corresponding branch in this repo. Check out{" "}
            <code className="inlineCode">post/03-devnet</code> to keep going, or read the full series at{" "}
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
            <code>git checkout post/02-oauth</code>
          </div>
          <div className="codeBlock">
            <span className="codePrompt">$</span>
            <code>pnpm install && pnpm dev</code>
          </div>
          <p className="prose">
            Open{" "}
            <a href="http://127.0.0.1:5173" className="link">
              127.0.0.1:5173
            </a>
            , not <code className="inlineCode">localhost:5173</code>. The OAuth
            redirect URI is registered as <code className="inlineCode">http://127.0.0.1:5173/oauth/callback</code> —
            after Bluesky approves access it sends the browser back to that exact
            address. If you have the app open at <code className="inlineCode">localhost</code> the
            callback lands on a different origin and the session won't be established.
          </p>
        </section>
      </main>
    </div>
  );
}
