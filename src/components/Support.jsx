import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const line =
  "w-full border-b border-ink/40 bg-transparent py-2 text-xl outline-none focus:border-ink";

const labels = { open: "Open", in_review: "In review", resolved: "Resolved" };

function day(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Support({ userId }) {
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState("loading");
  const [refresh, setRefresh] = useState(0);
  const [bookingId, setBookingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      const [o, c] = await Promise.all([
        supabase
          .from("bookings")
          .select("id,quantity,created_at,gas_types(label)")
          .eq("customer_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("complaints")
          .select("id,message,status,created_at")
          .eq("customer_id", userId)
          .order("created_at", { ascending: false }),
      ]);
      if (o.error || c.error) {
        setStatus("error");
        return;
      }
      setOrders(o.data);
      setComplaints(c.data);
      setStatus("ready");
    }
    load();
  }, [userId, refresh]);

  async function submit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setError("");
    setBusy(true);
    const { error } = await supabase.from("complaints").insert({
      customer_id: userId,
      booking_id: bookingId || null,
      message: message.trim(),
    });
    setBusy(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage("");
      setBookingId("");
      setRefresh((r) => r + 1);
    }
  }

  if (status === "loading") return <p className="px-6 py-16 text-ink/60">…</p>;
  if (status === "error")
    return <p className="px-6 py-16 text-urgent">Support unavailable.</p>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:px-12">
      <h1 className="text-5xl font-bold">Support</h1>

      <form onSubmit={submit} className="mt-10 space-y-8">
        <select
          className={line}
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
        >
          <option value="">General</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.quantity} × {o.gas_types.label} · {day(o.created_at)}
            </option>
          ))}
        </select>

        <textarea
          className={line}
          rows={4}
          maxLength={2000}
          placeholder="What went wrong?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        {error && <p className="text-urgent">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="bg-ink px-8 py-3 text-xl text-canvas hover:bg-signal hover:text-ink disabled:opacity-50"
        >
          {busy ? "…" : "Send"}
        </button>
      </form>

      <div className="mt-16 border-t-2 border-ink">
        {complaints.length === 0 && (
          <p className="py-6 text-ink/60">No complaints.</p>
        )}
        {complaints.map((c) => (
          <div key={c.id} className="border-b border-ink/20 py-4">
            <div className="flex items-baseline justify-between">
              <span className="italic text-ink/60">{day(c.created_at)}</span>
              <span className={`italic ${c.status === "resolved" ? "text-delivered" : ""}`}>
                {labels[c.status]}
              </span>
            </div>
            <p className="mt-1 text-xl">{c.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}