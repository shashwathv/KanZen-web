import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandMark from "../components/layout/BrandMark";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_ENABLED = supabaseConfigured && Boolean(GOOGLE_CLIENT_ID);

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Google Identity Services is only needed on this page, so it's injected on
// demand rather than loaded from index.html on every route. The promise is
// shared across remounts; a failed load clears it so a later visit can retry.
let gisPromise = null;
function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gisPromise) {
    gisPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gisPromise = null;
        script.remove();
        reject(new Error("Failed to load Google Identity Services"));
      };
      document.head.appendChild(script);
    });
  }
  return gisPromise;
}

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [googleFailed, setGoogleFailed] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const googleNonceRef = useRef(null);
  const googleButtonRef = useRef(null);

  // Already signed in — nothing to do here.
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const switchMode = (next) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);

    const { error: authError } = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (mode === "signup") {
      setNotice("Check your inbox to confirm your email, then sign in.");
      setMode("login");
    } else {
      navigate("/dashboard");
    }
  };

  // Google's account chooser shows the domain that initiated the request. Using
  // Identity Services here (client-side ID token) instead of Supabase's OAuth
  // redirect means that domain is ours, not the raw Supabase project URL.
  const handleGoogleCredential = useCallback(async (response) => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: response.credential,
      nonce: googleNonceRef.current,
    });
    if (authError) {
      setError(authError.message);
    } else {
      navigate("/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    if (!GOOGLE_ENABLED) return;

    let cancelled = false;

    (async function init() {
      const nonce = crypto.randomUUID();
      googleNonceRef.current = nonce;
      try {
        const [hashedNonce] = await Promise.all([sha256Hex(nonce), loadGoogleIdentity()]);
        if (cancelled) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          nonce: hashedNonce,
        });
        setGisReady(true);
      } catch (err) {
        // Usually a content blocker — email sign-in still works, so just hide Google.
        console.warn(err);
        if (!cancelled) setGoogleFailed(true);
      }
    })();

    return () => { cancelled = true; };
  }, [handleGoogleCredential]);

  // Render the button once GIS is ready, and again when the theme changes.
  useEffect(() => {
    const el = googleButtonRef.current;
    if (!gisReady || !el) return;
    el.replaceChildren();
    window.google.accounts.id.renderButton(el, {
      theme: theme === "light" ? "outline" : "filled_black",
      size: "large", shape: "pill", text: "continue_with",
      // GIS takes a fixed pixel width, so fit it to the card on narrow phones.
      width: Math.min(360, el.clientWidth),
    });
  }, [gisReady, theme]);

  const showGoogle = GOOGLE_ENABLED && !googleFailed;

  return (
    <main className="page-main login-main" style={{
      maxWidth: 420,
      animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
    }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <BrandMark size={44} style={{ margin: "0 auto 1rem" }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", fontWeight: 600, letterSpacing: "-0.01em", marginBottom: "0.4rem" }}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p style={{ color: "var(--text2)", fontSize: "0.85rem" }}>
          {mode === "login" ? "Sign in to access your decks" : "Free forever, no credit card needed"}
        </p>
      </div>

      <div className="card raised" style={{ borderRadius: 14, padding: "2rem" }}>
        {!supabaseConfigured && (
          <p role="alert" style={{
            fontSize: "0.8rem", color: "var(--gold)", marginBottom: "1.25rem",
            background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
            borderRadius: 8, padding: "0.6rem 0.85rem",
          }}>
            Accounts aren't available right now. You can still use the tool without signing in.
          </p>
        )}
        <div role="group" aria-label="Account mode" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "0.4rem", marginBottom: "1.75rem",
          background: "var(--surface2)", padding: "0.3rem",
          borderRadius: 8, border: "1px solid var(--border)",
        }}>
          {["login", "signup"].map(m => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => switchMode(m)} style={{
              padding: "0.55rem", borderRadius: 8,
              background: mode === m ? "var(--surface)" : "transparent",
              color: mode === m ? "var(--text1)" : "var(--text3)",
              fontWeight: mode === m ? 600 : 400,
              fontSize: "0.85rem", cursor: "pointer",
              boxShadow: mode === m ? "var(--shadow-card)" : "none",
              transition: "all 0.15s", fontFamily: "var(--font-body)",
              border: mode === m ? "1px solid var(--border)" : "1px solid transparent",
            }}>
              {m === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div>
            <label htmlFor="login-email" style={{ fontSize: "0.78rem", color: "var(--text2)", marginBottom: "0.4rem", display: "block", fontWeight: 500 }}>
              Email
            </label>
            <input
              id="login-email"
              className="input"
              type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ padding: "0.75rem 1rem", fontSize: "0.9rem" }}
            />
          </div>
          <div>
            <label htmlFor="login-password" style={{ fontSize: "0.78rem", color: "var(--text2)", marginBottom: "0.4rem", display: "block", fontWeight: 500 }}>
              Password
            </label>
            <input
              id="login-password"
              className="input"
              type="password" required minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ padding: "0.75rem 1rem", fontSize: "0.9rem" }}
            />
          </div>

          {error && (
            <p role="alert" style={{ fontSize: "0.8rem", color: "var(--flame)", margin: 0 }}>{error}</p>
          )}
          {notice && (
            <p role="status" style={{ fontSize: "0.8rem", color: "var(--jade)", margin: 0 }}>{notice}</p>
          )}

          <button type="submit" className="btn-primary" disabled={submitting || !supabaseConfigured} style={{
            width: "100%", padding: "0.8rem", fontSize: "0.92rem", marginTop: "0.25rem",
          }}>
            {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        {showGoogle && (
          <>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              margin: "1.25rem 0",
            }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: "0.72rem", color: "var(--text3)" }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <div ref={googleButtonRef} style={{ display: "flex", justifyContent: "center" }} />
          </>
        )}

        <p style={{
          marginTop: "1.25rem", textAlign: "center",
          fontSize: "0.75rem", color: "var(--text3)",
        }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => switchMode(mode === "login" ? "signup" : "login")} style={{
            background: "none", border: "none", color: "var(--jade)",
            cursor: "pointer", fontSize: "0.75rem", fontFamily: "var(--font-body)",
            fontWeight: 600, padding: 0,
          }}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>

      <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.75rem" }}>
        <Link to="/app" className="link-muted">
          Continue without account →
        </Link>
      </p>
    </main>
  );
}
