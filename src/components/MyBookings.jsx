import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const labels = {
  pending: "Pending",
  assigned: "Assigned",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const colors = {
  delivered: "text-delivered",
  cancelled: "text-urgent",
};

export default function MyBookings({ userId, onBook }) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("bookings")
        .select("id,quantity,total,status,created_at,gas_types(label)")
        .eq("customer_id", userId)
        .order("created_at", { ascending: false });
      if (error) {
        setStatus("error");
      } else {
        setRows(data);
        setStatus("ready");
      }
    }
    load();
  }, [userId, refresh]);

  async function cancel(id) {
    setError("");
    const { error } = await supabase.rpc("cancel_booking", { p_booking: id });
    if (error) setError(error.message);
    else setRefresh((r) => r + 1);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:px-12">
      <div className="flex items-baseline justify-between">
        <h1 className="text-5xl font-bold">Orders</h1>
        <button
          onClick={onBook}
          className="bg-ink px-6 py-2 text-xl text-canvas hover:bg-signal hover:text-ink"
        >
          Book
        </button>
      </div>

      {error && <p className="mt-6 text-urgent">{error}</p>}

      <div className="mt-10 border-t-2 border-ink">
        {status === "loading" && <p className="py-6 text-ink/60">…</p>}
        {status === "error" && (
          <p className="py-6 text-urgent">Orders unavailable.</p>
        )}
        {status === "ready" && rows.length === 0 && (
          <p className="py-6 text-ink/60">No orders yet.</p>
        )}
        {rows.map((b) => (
          <div
            key={b.id}
            className="flex items-baseline justify-between gap-4 border-b border-ink/20 py-4"
          >
            <div>
              <p className="text-xl">
                {b.quantity} × {b.gas_types.label}
              </p>
              <p className="italic text-ink/60">
                {new Date(b.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl tabular-nums">₹{b.total}</p>
              <p className={`italic ${colors[b.status] ?? "text-ink"}`}>
                {labels[b.status]}
              </p>
              {b.status === "pending" && (
                <button
                  onClick={() => cancel(b.id)}
                  className="italic underline decoration-2 underline-offset-4 hover:decoration-signal"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}