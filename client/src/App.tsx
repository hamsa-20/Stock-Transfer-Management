import { useState } from "react";
import { Boxes, LayoutDashboard, ArrowLeftRight, Warehouse as WarehouseIcon } from "lucide-react";
import { Dashboard } from "./pages/Dashboard";
import { Warehouses } from "./pages/Warehouses";
import { Transfers } from "./pages/Transfers";

type Page = "dashboard" | "warehouses" | "transfers";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Boxes size={19} /></div><span>StockFlow</span></div>
        <nav>
          <button className={page === "dashboard" ? "nav-item active" : "nav-item"} onClick={() => setPage("dashboard")}><LayoutDashboard size={18} /> Dashboard</button>
          <button className={page === "warehouses" ? "nav-item active" : "nav-item"} onClick={() => setPage("warehouses")}><WarehouseIcon size={18} /> Warehouses</button>
          <button className={page === "transfers" ? "nav-item active" : "nav-item"} onClick={() => setPage("transfers")}><ArrowLeftRight size={18} /> Transfers</button>
        </nav>
        <div className="sidebar-footer">Stock Transfer Management<br /><span>v1.0</span></div>
      </aside>

      <main className="main">
        {page === "dashboard" && <Dashboard onNavigate={setPage} />}
        {page === "warehouses" && <Warehouses />}
        {page === "transfers" && <Transfers />}
      </main>
    </div>
  );
}
