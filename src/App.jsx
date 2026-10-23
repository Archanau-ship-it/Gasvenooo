import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import RateBoard from "./components/RateBoard";
import AuthForm from "./components/AuthForm";
import BookingForm from "./components/BookingForm";
import MyBookings from "./components/MyBookings";

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("home");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) setView((v) => (v === "auth" ? "home" : v));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  function goBook() {
    setView(session ? "book" : "auth");
  }

  let page;
  if (view === "auth" && !session) {
    page = <AuthForm />;
  } else if (view === "book" && session) {
    page = (
      <BookingForm
        userId={session.user.id}
        onDone={() => setView("orders")}
      />
    );
  } else if (view === "orders" && session) {
    page = (
      <MyBookings
        userId={session.user.id}
        onBook={() => setView("book")}
      />
    );
  } else {
    page = (
      <main className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-2 md:px-12">
        <section>
          <h1 className="text-5xl font-bold leading-none md:text-7xl">
            Gas, at your door.
          </h1>
          <button
            onClick={goBook}
            className="mt-10 bg-ink px-8 py-3 text-xl text-canvas hover:bg-signal hover:text-ink"
          >
            Book
          </button>
        </section>
        <section>
          <h2 className="mb-2 text-lg italic">Today's rates</h2>
          <RateBoard />
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-baseline justify-between border-b border-ink/20 px-6 py-4 md:px-12">
        <button
          onClick={() => setView("home")}
          className="text-2xl font-bold tracking-tight"
        >
          Gasveno
        </button>
        {session ? (
          <span className="flex items-baseline gap-6 text-lg">
            <button
              onClick={() => setView("orders")}
              className="underline decoration-2 underline-offset-4 hover:decoration-signal"
            >
              Orders
            </button>
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
            onClick={() => setView("auth")}
            className="text-lg underline decoration-2 underline-offset-4 hover:decoration-signal"
          >
            Sign in
          </button>
        )}
      </header>
      {page}
    </div>
  );
}