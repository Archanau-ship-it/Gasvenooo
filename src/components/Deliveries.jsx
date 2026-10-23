import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Deliveries({ userId }) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [refresh, setRefresh] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id,quantity,status,delivery_address,scheduled_for,gas_types(label),customers(name,phone)"
        )
        .eq("driver_id", userId)
        .in("status", ["assigned", "out_for_delivery"])
        .order("scheduled_for", { ascending: true, nullsFirst: false });
      if (error) {
        setStatus("error");
      } else {
        setRows(data);
        setStatus("ready");
      }
    }
    load();
  }, [userId, refresh]);

  async function act(fn, id) {
    setError("");
    setBusyId(id);
    const { error } = await supabase.rpc(fn, { p_booking: id });
    setBusyId(null);
    if (error) setError(error.message);
    else setRefresh((r) => r + 1);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:px-12">
      <div className="flex items-baseline justify-between">
        <h1 className="text-5xl font-bold">Deliveries</h1>
        <span className="text-5xl tabular-nums">{rows.length}</span>
      </div>

      {error && <p className="mt-6 text-urgent">{error}</p>}

      <div className="mt-10 border-t-2 border-ink">
        {status === "loading" && <p className="py-6 text-ink/60">…</p>}
        {status === "error" && (
          <p className="py-6 text-urgent">Deliveries unavailable.</p>
        )}
        {status === "ready" && rows.length === 0 && (
          <p className="py-6 text-ink/60">Nothing assigned.</p>
        )}
        {rows.map((b) => (
          <div
            key={b.id}
            className={`flex items-start justify-between gap-4 border-b border-ink/20 py-5 pl-4 ${
              b.status === "out_for_delivery" ? "border-l-4 border-l-signal" : ""
            }`}
          >
            <div>
              <p className="text-2xl">
                {b.quantity} × {b.gas_types.label}
              </p>
              <p className="mt-1 text-xl">{b.customers?.name}</p>
              <p className="italic text-ink/60">{b.delivery_address}</p>
              {b.customers?.phone && (
                <a
                  href={`tel:${b.customers.phone}`}
                  className="tabular-nums underline decoration-2 underline-offset-4 hover:decoration-signal"
                >
                  {b.customers.phone}
                </a>
              )}
            </div>
            <div className="text-right">
              {b.scheduled_for && (
                <p className="mb-3 italic text-ink/60">
                  {new Date(b.scheduled_for).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              )}
              <button
                disabled={busyId === b.id}
                onClick={() =>
                  act(
                    b.status === "assigned" ? "start_delivery" : "mark_delivered",
                    b.id
                  )
                }
                className="bg-ink px-6 py-2 text-xl text-canvas hover:bg-signal hover:text-ink disabled:opacity-50"
              >
                {b.status === "assigned" ? "Start" : "Delivered"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}