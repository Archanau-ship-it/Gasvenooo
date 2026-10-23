import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Dispatch() {
  const [rows, setRows] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [refresh, setRefresh] = useState(0);
  const [picks, setPicks] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [b, d] = await Promise.all([
        supabase
          .from("bookings")
          .select(
            "id,quantity,status,delivery_address,driver_id,created_at,gas_types(label),customers(name,phone)"
          )
          .in("status", ["pending", "assigned"])
          .order("created_at", { ascending: true }),
        supabase
          .from("drivers")
          .select("id,name,vehicle_number,available")
          .order("name"),
      ]);
      if (b.error || d.error) {
        setStatus("error");
        return;
      }
      setRows(b.data);
      setDrivers(d.data);
      setStatus("ready");
    }
    load();
  }, [refresh]);

  async function assign(id) {
    const driver = picks[id];
    if (!driver) return;
    setError("");
    setBusyId(id);
    const { error } = await supabase.rpc("assign_driver", {
      p_booking: id,
      p_driver: driver,
    });
    setBusyId(null);
    if (error) setError(error.message);
    else setRefresh((r) => r + 1);
  }

  const waiting = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:px-12">
      <div className="flex items-baseline justify-between">
        <h1 className="text-5xl font-bold">Dispatch</h1>
        <span className="text-5xl tabular-nums">{waiting}</span>
      </div>

      {error && <p className="mt-6 text-urgent">{error}</p>}

      <div className="mt-10 border-t-2 border-ink">
        {status === "loading" && <p className="py-6 text-ink/60">…</p>}
        {status === "error" && (
          <p className="py-6 text-urgent">Dispatch unavailable.</p>
        )}
        {status === "ready" && rows.length === 0 && (
          <p className="py-6 text-ink/60">All clear.</p>
        )}
        {rows.map((b) => (
          <div
            key={b.id}
            className={`flex flex-col gap-4 border-b border-ink/20 py-5 pl-4 md:flex-row md:items-center md:justify-between ${
              b.status === "pending" ? "border-l-4 border-l-signal" : ""
            }`}
          >
            <div>
              <p className="text-xl">
                {b.quantity} × {b.gas_types.label}
              </p>
              <p className="text-lg">{b.customers?.name}</p>
              <p className="italic text-ink/60">{b.delivery_address}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={picks[b.id] ?? b.driver_id ?? ""}
                onChange={(e) => setPicks({ ...picks, [b.id]: e.target.value })}
                className="border-b border-ink/40 bg-transparent py-2 text-lg outline-none"
              >
                <option value="">Driver</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.vehicle_number}
                    {d.available ? "" : " (off)"}
                  </option>
                ))}
              </select>
              <button
                disabled={busyId === b.id || !picks[b.id]}
                onClick={() => assign(b.id)}
                className="bg-ink px-5 py-2 text-lg text-canvas hover:bg-signal hover:text-ink disabled:opacity-40"
              >
                {b.status === "assigned" ? "Reassign" : "Assign"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}