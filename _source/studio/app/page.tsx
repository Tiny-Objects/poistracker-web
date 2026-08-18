// Tiny Objects — studio home page.
// Add `url` to an app to make its row a link (opens in a new tab).
// Apps without a url render as a plain, non-clickable row.
const apps: { name: string; icon: string; url?: string }[] = [
  { name: "Arcana Desk", icon: "/app-icons/arcana-desk.png" },
  { name: "Doraemon Tarot", icon: "/app-icons/doraemon-tarot.png", url: "https://tarot-doraemon.netlify.app" },
  { name: "The Game", icon: "/app-icons/the-game.png" },
  { name: "Relay", icon: "/app-icons/relay.png" },
  { name: "AI Dungeon Master", icon: "/app-icons/ai-dungeon-master.png" },
  { name: "Mushroom Log", icon: "/app-icons/mushroom-log.png" },
  { name: "Warranty Box", icon: "/app-icons/warranty-box.png" },
  { name: "Hair Growth", icon: "/app-icons/hair-growth.png" },
  { name: "Studio Vault", icon: "/app-icons/studio-vault.png" },
  { name: "Tucked", icon: "/app-icons/tucked.png" },
  { name: "Recall Lens", icon: "/app-icons/recall-lens.png" },
];

export default function Home() {
  return (
    <main id="top">
      <nav className="nav" aria-label="Primary navigation">
        <a className="wordmark" href="#top" aria-label="Tiny Objects, home">
          <span className="wordmark-dot" aria-hidden="true" />
          Tiny Objects
        </a>

        <a className="nav-link" href="#apps">
          Apps <span aria-hidden="true">↓</span>
        </a>
      </nav>

      <header className="intro">
        <div className="intro-copy">
          <h1>
            <span>Joyful</span> software.
          </h1>
        </div>

        <a className="acid-object" href="#apps" aria-label="Go to the apps list">
          <span className="acid-arrow" aria-hidden="true">↓</span>
          <div className="acid-signal" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <p>
            A small collection
            <br />
            in progress.
          </p>
        </a>
      </header>

      <section className="apps" id="apps">
        <div className="section-intro">
          <h2>Apps</h2>
        </div>

        <div className="app-list" aria-label="Tiny Objects apps">
          {apps.map((app, index) => (
            <Row key={app.name} app={app} index={index} />
          ))}
        </div>
      </section>

      <footer>
        <span>Tiny Objects</span>
        <span>© 2026</span>
      </footer>
    </main>
  );
}

function Row({
  app,
  index,
}: {
  app: { name: string; icon: string; url?: string };
  index: number;
}) {
  const inner = (
    <>
      <span className="app-number">{String(index + 1).padStart(2, "0")}</span>
      <img
        className="app-icon"
        src={app.icon}
        alt={`${app.name} app icon`}
        width="64"
        height="64"
        loading="lazy"
      />
      <span className="app-name">{app.name}</span>
    </>
  );

  if (!app.url) return <div className="app-row">{inner}</div>;

  return (
    <a className="app-row app-row-link" href={app.url} target="_blank" rel="noopener">
      {inner}
    </a>
  );
}
