import { useEffect, useState } from "react";
import { ArrowRight, Plus, Search } from "lucide-react";
import { api, type Transfer, type TransferStatus, type Warehouse } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { Modal } from "../components/Modal";

export function Transfers() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (status) query.set("status", status);
      const [t, w] = await Promise.all([
        api.transfers.list(query.toString() ? `?${query}` : ""),
        api.warehouses.list()
      ]);
      setTransfers(t);
      setWarehouses(w);
    } catch (e) { setError((e as Error).message); }
  }

  useEffect(() => { load(); }, [status]);

  async function createTransfer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api.transfers.create({
        sourceWarehouseId: String(form.get("sourceWarehouseId")),
        destinationWarehouseId: String(form.get("destinationWarehouseId")),
        quantity: Number(form.get("quantity")),
        notes: String(form.get("notes") || "")
      });
      setShowModal(false);
      await load();
    } catch (e) { setError((e as Error).message); }
  }

  async function changeStatus(id: string, next: TransferStatus) {
    try {
      await api.transfers.updateStatus(id, next);
      await load();
    } catch (e) { setError((e as Error).message); }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Stock transfers</h1>
          <p className="muted">Create, approve, complete and review transfer requests.</p>
        </div>
        <button className="primary-button" onClick={() => setShowModal(true)}><Plus size={17} /> New transfer</button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="toolbar">
        <div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search warehouse or notes" /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Transfer</th><th>Quantity</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr key={transfer.id}>
                  <td>
                    <div className="route">
                      <span>{transfer.sourceWarehouse.name}</span><ArrowRight size={14} /><span>{transfer.destinationWarehouse.name}</span>
                    </div>
                    {transfer.notes && <small className="muted">{transfer.notes}</small>}
                  </td>
                  <td>{transfer.quantity.toLocaleString()}</td>
                  <td><StatusBadge status={transfer.status} /></td>
                  <td>{new Date(transfer.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="actions">
                      {transfer.status === "PENDING" && <>
                        <button className="small-button" onClick={() => changeStatus(transfer.id, "APPROVED")}>Approve</button>
                        <button className="small-button danger" onClick={() => changeStatus(transfer.id, "CANCELLED")}>Cancel</button>
                      </>}
                      {transfer.status === "APPROVED" && <>
                        <button className="small-button" onClick={() => changeStatus(transfer.id, "COMPLETED")}>Complete</button>
                        <button className="small-button danger" onClick={() => changeStatus(transfer.id, "CANCELLED")}>Cancel</button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transfers.length === 0 && <div className="empty">No transfers match your filters.</div>}
        </div>
      </section>

      {showModal && (
        <Modal title="Create transfer request" onClose={() => setShowModal(false)}>
          <form onSubmit={createTransfer} className="form">
            <label>Source warehouse
              <select name="sourceWarehouseId" required defaultValue="">
                <option value="" disabled>Select source</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} — {w.stock} units</option>)}
              </select>
            </label>
            <label>Destination warehouse
              <select name="destinationWarehouseId" required defaultValue="">
                <option value="" disabled>Select destination</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </label>
            <label>Quantity<input name="quantity" type="number" min="1" required placeholder="e.g. 50" /></label>
            <label>Notes <textarea name="notes" rows={3} placeholder="Optional transfer reason" /></label>
            <button className="primary-button full" type="submit">Create request</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
