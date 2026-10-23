import RateBoard from "./components/RateBoard";

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="flex items-baseline justify-between border-b border-ink/20 px-6 py-4 md:px-12">
        <span className="text-2xl font-bold tracking-tight">Gasveno</span>
        <button className="text-lg underline decoration-2 underline-offset-4 hover:decoration-signal">
          Sign in
        </button>
      </header>

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
    </div>
  );
}