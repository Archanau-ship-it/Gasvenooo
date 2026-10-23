import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const line =
  "w-full border-b border-ink/40 bg-transparent py-2 text-xl outline-none focus:border-ink";

export default function BookingForm({ userId, onDone }) {
  const [rates, setRates] = useState([]);
  const [status, setStatus] = useState("loading");
  const [gasTypeId, setGasTypeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    async function load() {
      const [gas, profile] = await Promise.all([
        supabase
          .from("gas_types")
          .select("id,label,price")
          .order("price", { ascending: false }),
        supabase.from("customers").select("address").eq("id", userId).single(),
      ]);
      if (gas.error || gas.data.length === 0) {
        setStatus("error");
        return;
      }
      setRates(gas.data);
      setGasTypeId(gas.data[0].id);
      if (profile.data) setAddress(profile.data.address);
      setStatus("ready");
    }
    load();
  }, [userId]);

  const selected = rates.find((r) => r.id === gasTypeId);
  const estimate = selected ? selected.price * quantity : 0;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        customer_id: userId,
        gas_type_id: gasTypeId,
        quantity,
        delivery_address: address,
      })
      .select("id,quantity,total,status")
      .single();
    setBusy(false);
    if (error) setError(error.message);
    else setBooked(data);
  }

  if (status === "loading") return <p className="px-6 py-16 text-ink/60">…</p>;
  if (status === "error")
    return <p className="px-6 py-16 text-urgent">Rates unavailable.</p>;

  if (booked)
    return (
      <div className="mx-auto max-w-md space-y-6 px-6 py-16">
        <h1 className="text-5xl font-bold">Booked.</h1>
        <p className="text-4xl tabular-nums">₹{booked.total}</p>
        <p className="text-xl italic">{booked.status}</p>
        <button
          onClick={onDone}
          className="bg-ink px-8 py-3 text-xl text-canvas hover:bg-signal hover:text-ink"
        >
          Done
        </button>
      </div>
    );

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-10 px-6 py-16">
      <h1 className="text-5xl font-bold">Book</h1>

      <div className="border-t-2 border-ink">
        {rates.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setGasTypeId(r.id)}
            className={`flex w-full items-baseline justify-between border-b border-ink/20 px-3 py-4 text-left ${
              r.id === gasTypeId ? "bg-ink text-canvas" : "hover:bg-ink/5"
            }`}
          >
            <span className="text-xl">{r.label}</span>
            <span className="text-2xl tabular-nums">₹{r.price}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6 text-3xl">
        <button
          type="button"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="border border-ink px-4 hover:bg-signal"
        >
          −
        </button>
        <span className="w-8 text-center tabular-nums">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity(Math.min(10, quantity + 1))}
          className="border border-ink px-4 hover:bg-signal"
        >
          +
        </button>
      </div>

      <input
        className={line}
        placeholder="Delivery address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />

      {error && <p className="text-urgent">{error}</p>}

      <div className="flex items-baseline justify-between">
        <span className="text-4xl tabular-nums">₹{estimate}</span>
        <button
          type="submit"
          disabled={busy}
          className="bg-ink px-8 py-3 text-xl text-canvas hover:bg-signal hover:text-ink disabled:opacity-50"
        >
          {busy ? "…" : "Confirm"}
        </button>
      </div>
    </form>
  );
}