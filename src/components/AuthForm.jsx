import { useState } from "react";
import { supabase } from "../lib/supabase";

const line =
  "w-full border-b border-ink/40 bg-transparent py-2 text-xl outline-none focus:border-ink";

export default function AuthForm() {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({
    email: "", password: "", name: "", phone: "", address: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          })
        : await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
              data: { name: form.name, phone: form.phone, address: form.address },
            },
          });
    setBusy(false);
    if (error) setError(error.message);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-8 px-6 py-16">
      <h1 className="text-5xl font-bold">
        {mode === "signin" ? "Sign in" : "Create account"}
      </h1>

      {mode === "signup" && (
        <>
          <input className={line} name="name" placeholder="Name" value={form.name} onChange={change} required />
          <input className={line} name="phone" placeholder="Phone" value={form.phone} onChange={change} required />
          <input className={line} name="address" placeholder="Address" value={form.address} onChange={change} required />
        </>
      )}

      <input className={line} type="email" name="email" placeholder="Email" value={form.email} onChange={change} required />
      <input className={line} type="password" name="password" placeholder="Password" value={form.password} onChange={change} minLength={6} required />

      {error && <p className="text-urgent">{error}</p>}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={busy}
          className="bg-ink px-8 py-3 text-xl text-canvas hover:bg-signal hover:text-ink disabled:opacity-50"
        >
          {busy ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-lg underline decoration-2 underline-offset-4 hover:decoration-signal"
        >
          {mode === "signin" ? "Create account" : "Sign in"}
        </button>
      </div>
    </form>
  );
}