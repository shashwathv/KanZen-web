import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(undefined);

// The Supabase client is one of the largest dependencies. Loading it lazily
// keeps it out of the entry bundle so the landing page paints without it;
// the pages that talk to Supabase directly are code-split and pull it in too.
const loadSupabase = () => import("../lib/supabase").then(m => m.supabase);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still loading, null = signed out

  useEffect(() => {
    let cancelled = false;
    let subscription;

    loadSupabase()
      .then(supabase => {
        if (cancelled) return;
        if (!supabase) {
          // Not configured — behave as permanently signed out.
          setSession(null);
          return;
        }
        supabase.auth.getSession().then(({ data }) => {
          if (!cancelled) setSession(data.session);
        });
        ({ data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
          setSession(next);
        }));
      })
      .catch(err => {
        console.error("Could not initialise Supabase auth:", err);
        if (!cancelled) setSession(null);
      });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    loading: session === undefined,
    signOut: async () => (await loadSupabase())?.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
