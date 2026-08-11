import { useEffect, useState } from "react";
import { Plus, PackageOpen } from "lucide-react";
import { api, type Warehouse } from "../lib/api";
import { Modal } from "../components/Modal";

export function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try { setWarehouses(await api.warehouses.list()); }
    catch (e) { setError((e as Error).message); }
  }

  useEffect(() => { load(); }, []);

  async function createWarehouse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api.warehouses.create({
        name: String(form.get("name")),
        location: String(form.get("location")),
        stock: Number(form.get("stock") || 0)
      });
      setShowModal(false);
      await load();
    } catch (e) { setError((e as Error).message); }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1>Warehouses</h1>
          <p className="muted">Maintain locations and their current stock levels.</p>
        </div>
        <button className="primary-button" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Add warehouse
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="warehouse-grid">
        {warehouses.map((warehouse) => (
          <div className="warehouse-card" key={warehouse.id}>
            <div className="warehouse-card-top">
              <div className="warehouse-avatar"><PackageOpen size={20} /></div>
              <span className="stock-label">Current stock</span>
            </div>
            <h2>{warehouse.name}</h2>
            <p className="muted">{warehouse.location}</p>
            <div className="stock-number">{warehouse.stock.toLocaleString()} <small>units</small></div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Add warehouse" onClose={() => setShowModal(false)}>
          <form onSubmit={createWarehouse} className="form">
            <label>Name<input name="name" placeholder="e.g. Chennai Warehouse" required /></label>
            <label>Location<input name="location" placeholder="e.g. Chennai" required /></label>
            <label>Opening stock<input name="stock" type="number" min="0" defaultValue="0" required /></label>
            <button className="primary-button full" type="submit">Create warehouse</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
