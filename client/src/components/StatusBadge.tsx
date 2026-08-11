import type { TransferStatus } from "../lib/api";

export function StatusBadge({ status }: { status: TransferStatus }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}
