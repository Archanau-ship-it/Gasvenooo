import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import RateBoard from "./components/RateBoard";
import AuthForm from "./components/AuthForm";

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  return (
    <div className="min-h-screen">
      <header className="flex items-baseline justify-between border-b border-ink/20 px-6 py-4 md:px-12">
        <button
          onClick={() => setShowAuth(false)}
          className="text-2xl font-bold tracking-tight"
        >
          Gasveno
        </button>
        {session ? (
          <span className="flex items-baseline gap-6 text-lg">
            {session.user.email}
            <button
              onClick={() => supabase.auth.signOut()}
              className="underline decoration-2 underline-offset-4 hover:decoration-signal"
            >
              Sign out
            </button>
          </span>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="text-lg underline decoration-2 underline-offset-4 hover:decoration-signal"
          >
            Sign in
          </button>
        )}
      </header>

      {!session && showAuth ? (
        <AuthForm />
      ) : (
        <main className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-2 md:px-12">
          <section>
            <h1 className="text-5xl font-bold leading-none md:text-7xl">
              Gas, at your door.
            </h1>
            <button className="mt-10 bg-ink px-8 py-3 text-xl text-canvas hover:bg-signal hover:text-ink">
              Book
            </button>
          </section>
          <section>
            <h2 className="mb-2 text-lg italic">Today's rates</h2>
            <RateBoard />
          </section>
        </main>
      )}
    </div>
  );
}