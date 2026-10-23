import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import RateBoard from "./components/RateBoard";
import AuthForm from "./components/AuthForm";
import BookingForm from "./components/BookingForm";
import MyBookings from "./components/MyBookings";
import Support from "./components/Support";
import Deliveries from "./components/Deliveries";
import Dispatch from "./components/Dispatch";
import Footer from "./components/Footer";

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState(null);
  const [view, setView] = useState("home");
  const userId = session?.user?.id;

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

  useEffect(() => {
    if (!userId) {
      setRole(null);
      return;
    }
    async function findRole() {
      const [a, d] = await Promise.all([
        supabase.from("admins").select("id").eq("id", userId).maybeSingle(),
        supabase.from("drivers").select("id").eq("id", userId).maybeSingle(),
      ]);
      const r = a.data ? "admin" : d.data ? "driver" : "customer";
      setRole(r);
      setView((v) => {
        if (v !== "home" && v !== "auth") return v;
        if (r === "admin") return "dispatch";
        if (r === "driver") return "deliveries";
        return v;
      });
    }
    findRole();
  }, [userId]);

  if (!ready) return null;

  function goBook() {
    setView(session ? "book" : "auth");
  }

  let page;
  if (view === "auth" && !session) {
    page = <AuthForm />;
  } else if (view === "book" && role === "customer") {
    page = <BookingForm userId={userId} onDone={() => setView("orders")} />;
  } else if (view === "orders" && role === "customer") {
    page = <MyBookings userId={userId} onBook={() => setView("book")} />;
  } else if (view === "support" && role === "customer") {
    page = <Support userId={userId} />;
  } else if (view === "deliveries" && role === "driver") {
    page = <Deliveries userId={userId} />;
  } else if (view === "dispatch" && role === "admin") {
    page = <Dispatch />;
  } else {
    page = (
      <main className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-2 md:px-12">
        <section>
          <h1 className="text-5xl font-bold leading-none md:text-7xl">
            Gas, at your door.
          </h1>
          {(!session || role === "customer") && (
            <button
              onClick={goBook}
              className="mt-10 bg-ink px-8 py-3 text-xl text-canvas hover:bg-signal hover:text-ink"
            >
              Book
            </button>
          )}
        </section>
        <section>
          <h2 className="mb-2 text-lg italic">Today's rates</h2>
          <RateBoard />
        </section>
      </main>
    );
  }

  const link =
    "underline decoration-2 underline-offset-4 hover:decoration-signal";

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
          <span className="flex items-baseline gap-5 text-lg md:gap-6">
            {role === "customer" && (
              <>
                <button onClick={() => setView("orders")} className={link}>
                  Orders
                </button>
                <button onClick={() => setView("support")} className={link}>
                  Support
                </button>
              </>
            )}
            {role === "driver" && (
              <button onClick={() => setView("deliveries")} className={link}>
                Deliveries
              </button>
            )}
            {role === "admin" && (
              <button onClick={() => setView("dispatch")} className={link}>
                Dispatch
              </button>
            )}
            <span className="hidden md:inline">{session.user.email}</span>
            <button onClick={() => supabase.auth.signOut()} className={link}>
              Sign out
            </button>
          </span>
        ) : (
          <button onClick={() => setView("auth")} className={`text-lg ${link}`}>
            Sign in
          </button>
        )}
      </header>
      {page}
      <Footer />
    </div>
  );
}