export function Home() {
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
        <section className="section">
          <h2 className="sectionTitle">What you'll build</h2>
          <p className="prose">
            This starter is the companion code for a{" "}
            <a href="https://arsdehnel.com/posts" target="_blank" rel="noreferrer" className="link">
              blog series
            </a>{" "}
            that walks through building a real AT Protocol app — step by step, from reading your first public record to
            running a full social feed with your own AppView.
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
            <li>Your First AT Protocol Read</li>
            <li>AT Protocol OAuth with rwsdk and Cloudflare Workers</li>
            <li>Local Development with Docker Compose</li>
            <li>Lexicons and Writing to Your PDS</li>
            <li>Reacting to Changes with Tap and Jetstream</li>
            <li>Persistence with D1 and Drizzle</li>
            <li>Building a Feed — You're an AppView Now</li>
            <li>Where to Go From Here</li>
          </ol>
          <p className="prose">
            Each post has a corresponding branch in this repo. By the end you'll have built a small{" "}
            <a href="https://atproto.com/guides/overview" target="_blank" rel="noreferrer" className="link">
              AppView
            </a>{" "}
            — an app that indexes AT Protocol records from other users and serves its own view of the data. Check out{" "}
            <code className="inlineCode">post/01-first-read</code> to see where Post 1 left off, and so on.
          </p>
        </section>

        <section className="section">
          <h2 className="sectionTitle">Getting started</h2>
          <div className="codeBlock">
            <span className="codePrompt">$</span>
            <code>git clone https://github.com/arsdehnel/rwsdk-atproto-starter</code>
          </div>
          <div className="codeBlock">
            <span className="codePrompt">$</span>
            <code>pnpm install && pnpm dev</code>
          </div>
          <p className="prose">
            Then open{" "}
            <a href="http://localhost:5173" className="link">
              localhost:5173
            </a>{" "}
            — you're looking at it.
          </p>
        </section>
      </main>
    </div>
  );
}
