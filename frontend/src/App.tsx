import { useEffect, useState, version as reactVersion } from "react";
// FAÇADE temps réel isomorphe du framework — aucun `new WebSocket` à la main
// (reconnexion, re-subscribe, état : gérés). Deux concepts suffisent : le
// Provider, qui reçoit l'adresse du serveur, et un hook par besoin.
// Subpath `nodefony/react` : une porte EXPLICITE, résolue à l'identique par
// Vite, Node et le typecheck (la racine `nodefony` dépend d'une condition
// d'export que `tsgo --noEmit` ne voit pas).
import {
  NodefonyProvider,
  useNodefony,
  useNodefonyState,
  useNodefonyChannelData,
} from "nodefony/react";
import { NODEFONY_LOGO } from "./brand";
// Mise en page et palette de la démonstration — feuille PARTAGÉE par les trois
// vitrines (Vite l'injecte dans le document, elle est donc bien globale).
import "./showcase.css";
import "./accent.css";

interface ApiData {
  hello: string;
  pid: number;
  /** Identité résolue par la zone firewall `main` (^/api) — « anonyme » sinon. */
  who?: string;
}

/** Réponse de la route PROTÉGÉE /api/secure/hello (zone `secure`, 401 sans session). */
interface SecureData {
  message: string;
  zone: string;
  pid: number;
}

/**
 * Page d'accueil de l'app — vitrine AUTONOME (zéro dépendance UI) :
 *  - panneau de marque (même design que le login de Studio : dégradé, glow,
 *    logo, slogan, 3 piliers du framework) ;
 *  - trois preuves INTERACTIVES : fetch HTTP, echo WebSocket live sur le MÊME
 *    controller (le différenciateur Nodefony), état React préservé par HMR.
 * Édite ce fichier : la page se met à jour sans recharger ni perdre le compteur.
 */

const FEATURES = [
  {
    title: "Temps réel natif",
    desc: "HTTP et WebSocket, co-citoyens dans le même contexte.",
    // éclair (bolt)
    icon: <path d="M13 2 4.5 12.5H11L9.5 22 18 11.5h-6.5L13 2z" />,
  },
  {
    title: "Observabilité totale",
    desc: "Métriques, logs et traces — en direct.",
    // pulse (activity)
    icon: <path d="M3 12h4l2.5-7 5 14 2.5-7h4" fill="none" strokeWidth="2" />,
  },
  {
    title: "Zero Trust",
    desc: "Sécurité par défaut, vos données protégées.",
    // bouclier
    icon: <path d="M12 2 5 5v6c0 5 3.5 8.5 7 11 3.5-2.5 7-6 7-11V5l-7-3z" />,
  },
];

/** Un message du canal `live:events` (cf `nodefony/controllers/LiveController.ts`). */
interface LiveEvent {
  text: string;
  ts: number;
  pid: number;
}

/**
 * Carte temps réel — consomme la FAÇADE (hooks `nodefony/react`) : abonnement
 * au montage, désabonnement au démontage, re-subscribe à la reconnexion, état
 * de connexion — tout est porté par le client. Zéro `WebSocket` à la main.
 */
function LiveCard() {
  // La socket du Provider — même instance que celle des hooks ci-dessous.
  const live = useNodefony();
  const state = useNodefonyState();
  const last = useNodefonyChannelData<LiveEvent>("live:events");
  const [pong, setPong] = useState<string | null>(null);
  const ping = async () => {
    const t0 = performance.now();
    await live.request("live:ping", {});
    setPong(`pong en ${Math.round(performance.now() - t0)} ms`);
  };
  // Ce que CETTE page envoie, TOUTES les pages abonnées le reçoivent : ouvrir
  // un second onglet et cliquer suffit à le voir. C'est ce partage qui fait
  // l'intérêt d'une socket — pas un battement qui parlerait pour ne rien dire.
  const say = () =>
    live.emit("live:say", {
      text: `bonjour de la page (${Date.now() % 1000})`,
    });
  return (
    <div className="nf-card">
      <h2>3. Temps réel — la socket Nodefony</h2>
      <p className="nf-dim">
        <code>LiveController</code> (<code>--kind realtime</code>) publie le
        canal <code>live:events</code> quand il se passe quelque chose — jamais
        sur une horloge ; la page le consomme par les hooks{" "}
        <code>nodefony/react</code>. Ouvrez un second onglet pour voir arriver
        ce que celui-ci envoie.
      </p>
      <p>
        état : <strong>{state}</strong>
        {last && (
          <>
            {" "}
            · reçu <strong>{last.text}</strong> (pid {last.pid})
          </>
        )}
      </p>
      <button onClick={ping}>RPC live:ping</button>{" "}
      <button onClick={say}>envoyer sur le canal</button>
      {pong && <span className="nf-dim"> {pong}</span>}
    </div>
  );
}

export function App() {
  const [data, setData] = useState<ApiData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const [secureData, setSecureData] = useState<SecureData | null>(null);

  // Rappelé après login/logout : la zone firewall `main` (^/api) résout
  // l'identité par requête → `who` change sans recharger la page.
  const refreshHello = () =>
    fetch("/api/hello")
      .then((r) => r.json())
      .then((j) => {
        const d = (j.result ?? j) as ApiData; // Nodefony wrappe `{ result }`
        setData(d);
        // Connecté → la route PROTÉGÉE prend le relais (zone `secure`,
        // ^/api/secure : sans session le firewall répond 401 avant le controller).
        if (d.who && d.who !== "anonyme") {
          fetch("/api/secure/hello", { credentials: "same-origin" })
            .then((r) => (r.ok ? r.json() : null))
            .then((s) =>
              setSecureData(s ? ((s.result ?? s) as SecureData) : null),
            )
            .catch(() => setSecureData(null));
        } else {
          setSecureData(null);
        }
        // Un `then` REND une valeur — sinon le lint de l'application
        // GÉNÉRÉE la refuse (`promise/always-return`).
        return d;
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));

  // Flux session BFF du framework (cookie opaque HttpOnly — le front ne voit
  // jamais de token) : mêmes endpoints que le login de la console /nodefony.
  const doLogin = async () => {
    setAuthMsg(null);
    const r = await fetch("/nodefony/security/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ username, password }),
    });
    const j = (await r.json()) as {
      result?: { user?: { username?: string } };
      user?: { username?: string };
    };
    if (!r.ok) {
      setAuthMsg("identifiants invalides");
      return;
    }
    const u = j.result?.user ?? j.user;
    setAuthMsg(`session ouverte — ${u?.username ?? username}`);
    refreshHello();
  };

  const doLogout = async () => {
    await fetch("/nodefony/security/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    setAuthMsg("session fermée");
    refreshHello();
  };

  useEffect(() => {
    refreshHello();
  }, []);

  return (
    <div className="nf-split">
      {/* ── Panneau de marque (même design que le login Studio) ─────────── */}
      <aside className="nf-hero">
        <div className="nf-glow" aria-hidden />
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            position: "relative",
          }}
        >
          <img
            src={NODEFONY_LOGO}
            alt="Nodefony"
            height={42}
            draggable={false}
          />
          <span style={{ fontWeight: 700, fontSize: 26 }}>nodefony</span>
        </div>

        <div style={{ maxWidth: 480, position: "relative" }}>
          <h2>Le temps réel, nativement.</h2>
          <p className="nf-sub">
            Observez, comprenez et contrôlez chaque sous-système de Nodefony —
            en direct.
          </p>
          {FEATURES.map((f) => (
            <div className="nf-feature" key={f.title}>
              <div className="nf-ficon">
                <svg viewBox="0 0 24 24">{f.icon}</svg>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,.78)" }}>
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.65)" }}>
            Nodefony 10 · licence Apache 2.0
          </span>
          <a
            href="https://github.com/nodefony/nodefony-core"
            target="_blank"
            rel="noreferrer noopener"
            style={{ fontSize: 12, color: "rgba(255,255,255,.7)" }}
          >
            GitHub
          </a>
        </div>
      </aside>

      {/* ── Preuves interactives — TON app tourne ────────────────────────── */}
      <main className="nf-main">
        <header className="nf-fwhead">
          {/* Logo officiel React — SVG inline (aucun asset externe). */}
          <svg
            className="nf-fwlogo"
            viewBox="-11.5 -10.23174 23 20.46348"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="React"
          >
            <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
            <g stroke="#61dafb" strokeWidth="1" fill="none">
              <ellipse rx="11" ry="4.2" />
              <ellipse rx="11" ry="4.2" transform="rotate(60)" />
              <ellipse rx="11" ry="4.2" transform="rotate(120)" />
            </g>
          </svg>
          <div>
            <h1>Votre app est en ligne.</h1>
            <span className="nf-fwbadge">React v{reactVersion} · Vite HMR</span>
          </div>
          {/* Réponse de la route PROTÉGÉE — visible uniquement session ouverte. */}
          {secureData && (
            <span className="nf-hello">👋 {secureData.message}</span>
          )}
        </header>
        <p className="nf-dim">
          Quatre preuves interactives — édite <code>frontend/src/App.tsx</code>,
          la page se met à jour par HMR sans perdre le compteur.
        </p>

        <div className="nf-card">
          <h2>
            1. Backend HTTP —{" "}
            <code>GET {secureData ? "/api/secure/hello" : "/api/hello"}</code>
          </h2>
          {error ? (
            <pre style={{ color: "crimson" }}>{error}</pre>
          ) : data ? (
            <pre>{JSON.stringify(secureData ?? data, null, 2)}</pre>
          ) : (
            <p>loading…</p>
          )}
        </div>

        <div className="nf-card">
          <h2>
            2. Firewall — l'identité vit dans la zone <code>^/api</code>
          </h2>
          <p className="nf-dim">
            Deux zones dans <code>nodefony.config.ts</code> : <code>main</code>{" "}
            (<code>^/api</code>, session → anonymous, jamais bloquante) et{" "}
            <code>secure</code> (<code>^/api/secure</code>, session SEULE —
            pattern plus spécifique, il gagne le match ; sans session le
            firewall répond 401). Connecte-toi : le compte <code>admin</code> a
            pour mot de passe <code>admin</code> en développement, et celui de{" "}
            <code>NF_ADMIN_PASSWORD</code> en production — où il est EXIGÉ, car
            une application ne naît jamais en ligne avec un secret connu. Alors
            la carte 1 bascule sur <code>GET /api/secure/hello</code> → «
            Bonjour admin ».
          </p>
          {data?.who && data.who !== "anonyme" ? (
            <>
              <span>
                connecté — <strong>{data.who}</strong>
              </span>{" "}
              <button onClick={doLogout}>Se déconnecter</button>
            </>
          ) : (
            <>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                aria-label="utilisateur"
              />{" "}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doLogin()}
                autoComplete="current-password"
                aria-label="mot de passe"
              />{" "}
              <button onClick={doLogin}>Se connecter</button>
            </>
          )}
          {authMsg && <p className="nf-dim">{authMsg}</p>}
        </div>

        {/* Deux concepts pour du temps réel : ce Provider, et un hook dans la
            carte. Le Provider fabrique la socket partagée pour cette URL et la
            connecte — l'URL est RELATIVE, résolue contre la page (https → wss).
            Deux Providers de même URL n'ouvrent qu'UNE connexion. */}
        <NodefonyProvider url="/api/live/realtime">
          <LiveCard />
        </NodefonyProvider>

        <div className="nf-card">
          <h2>4. ♻️ HMR check — état React préservé</h2>
          <button onClick={() => setCount((c) => c + 1)}>
            count is {count}
          </button>
          <p className="nf-dim">
            Édite <code>frontend/src/App.tsx</code> — Vite recompile à la volée,
            la page se met à jour <em>sans recharger</em> et le compteur est
            conservé.
          </p>
        </div>

        <p className="nf-dim">
          Console d'administration : <a href="/nodefony">/nodefony</a> (Studio,
          en dev)
        </p>
      </main>
    </div>
  );
}
