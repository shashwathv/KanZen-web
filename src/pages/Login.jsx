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
  const isLogin = mode === "login";

  return (
    <div className="page auth">
      <section className="sheet auth-sheet">
        <BrandMark size={44} />
        <h1 className="display">{isLogin ? "Sign in" : "Create an account"}</h1>
        <p>Keep a list of every deck you make, and download any of them again later.</p>

        {!supabaseConfigured && (
          <p className="notice" role="alert" style={{ marginTop: "1.25rem" }}>
            Accounts aren't available right now. You can still make decks without signing in.
          </p>
        )}

        <div className="segmented" role="group" aria-label="Account">
          <button type="button" aria-pressed={isLogin} onClick={() => switchMode("login")}>Sign in</button>
          <button type="button" aria-pressed={!isLogin} onClick={() => switchMode("signup")}>Create account</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email" className="field-label">Email</label>
            <input
              id="login-email" className="input"
              type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="login-password" className="field-label">Password</label>
            <input
              id="login-password" className="input"
              type="password" required minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
              aria-describedby={isLogin ? undefined : "password-hint"}
              value={password} onChange={e => setPassword(e.target.value)}
            />
            {!isLogin && <p id="password-hint" className="muted small" style={{ marginTop: "0.3rem" }}>At least 6 characters.</p>}
          </div>

          {error && <p className="notice error" role="alert">{error}</p>}
          {notice && <p className="notice" role="status">{notice}</p>}

          <button type="submit" className="btn btn-ink btn-block" disabled={submitting || !supabaseConfigured}>
            {submitting ? "One moment…" : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        {showGoogle && (
          <>
            <p className="or-divider">or</p>
            <div ref={googleButtonRef} className="google-slot" />
          </>
        )}
      </section>

      <p className="auth-skip">
        <Link to="/app">Make a deck without an account</Link>
      </p>
    </div>
  );
}
