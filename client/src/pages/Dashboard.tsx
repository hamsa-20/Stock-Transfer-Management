import { useEffect, useState } from "react";
import { ArrowRight, Boxes, Clock3, CheckCircle2, Warehouse as WarehouseIcon } from "lucide-react";
import { api, type Transfer } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

export function Dashboard({ onNavigate }: { onNavigate: (page: "warehouses" | "transfers") => void }) {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.transfers.stats>> | null>(null);
  const [recent, setRecent] = useState<Transfer[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.transfers.stats(), api.transfers.list()])
      .then(([s, t]) => {
        setStats(s);
        setRecent(t.slice(0, 6));
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!stats) return <div className="loading">Loading dashboard…</div>;

  const cards = [
    { label: "Warehouses", value: stats.warehouseCount, icon: WarehouseIcon },
    { label: "Total Stock", value: stats.totalStock.toLocaleString(), icon: Boxes },
    { label: "Pending", value: stats.transfers.pending, icon: Clock3 },
    { label: "Completed", value: stats.transfers.completed, icon: CheckCircle2 }
  ];

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Operations dashboard</h1>
          <p className="muted">Monitor stock and move inventory between warehouses.</p>
        </div>
        <button className="primary-button" onClick={() => onNavigate("transfers")}>New transfer <ArrowRight size={16} /></button>
      </div>

      <div className="stats-grid">
        {cards.map(({ label, value, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon"><Icon size={20} /></div>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Recent transfers</h2>
            <p className="muted">Latest inventory movement requests.</p>
          </div>
          <button className="ghost-button" onClick={() => onNavigate("transfers")}>View all</button>
        </div>

        {recent.length === 0 ? (
          <div className="empty">No transfers yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Route</th><th>Qty</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recent.map((transfer) => (
                  <tr key={transfer.id}>
                    <td>
                      <div className="route">
                        <strong>{transfer.sourceWarehouse.name}</strong>
                        <ArrowRight size={14} />
                        <strong>{transfer.destinationWarehouse.name}</strong>
                      </div>
                    </td>
                    <td>{transfer.quantity.toLocaleString()}</td>
                    <td><StatusBadge status={transfer.status} /></td>
                    <td>{new Date(transfer.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
