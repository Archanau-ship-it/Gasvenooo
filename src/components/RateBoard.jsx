import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function RateBoard() {
  const [rates, setRates] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("gas_types")
        .select("id,label,price")
        .order("price", { ascending: false });
      if (error) {
        setStatus("error");
      } else {
        setRates(data);
        setStatus("ready");
      }
    }
    load();
  }, []);

  if (status === "loading") return <p className="py-6 text-ink/60">…</p>;
  if (status === "error") return <p className="py-6 text-urgent">Rates unavailable.</p>;
  if (rates.length === 0) return <p className="py-6 text-ink/60">No rates today.</p>;

  return (
    <table className="w-full border-t-2 border-ink">
      <tbody>
        {rates.map((r) => (
          <tr key={r.id} className="border-b border-ink/20">
            <td className="py-4 text-xl">{r.label}</td>
            <td className="py-4 text-right text-3xl tabular-nums">₹{r.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}