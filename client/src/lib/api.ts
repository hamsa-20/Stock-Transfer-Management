declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");

export type Warehouse = {
  id: string;
  name: string;
  location: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export type TransferStatus =
  | "PENDING"
  | "APPROVED"
  | "COMPLETED"
  | "CANCELLED";

export type Transfer = {
  id: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  status: TransferStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;

  sourceWarehouse: Pick<
    Warehouse,
    "id" | "name" | "location"
  >;

  destinationWarehouse: Pick<
    Warehouse,
    "id" | "name" | "location"
  >;
};

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message = data?.message;

    if (!message && data?.issues?.formErrors?.length) {
      message = data.issues.formErrors[0];
    }

    if (!message && data?.issues?.fieldErrors) {
      const fieldErrors = data.issues.fieldErrors;
      const firstField = Object.keys(fieldErrors)[0];

      if (firstField && fieldErrors[firstField]?.length) {
        message = fieldErrors[firstField][0];
      }
    }

    throw new Error(
      message || "Something went wrong. Please try again."
    );
  }

  return data as T;
}

export const api = {
  warehouses: {
    list: () =>
      request<Warehouse[]>("/warehouses"),

    create: (body: {
      name: string;
      location: string;
      stock: number;
    }) =>
      request<Warehouse>("/warehouses", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },

  transfers: {
    list: (params = "") =>
      request<Transfer[]>(`/transfers${params}`),

    create: (body: {
      sourceWarehouseId: string;
      destinationWarehouseId: string;
      quantity: number;
      notes?: string;
    }) =>
      request<Transfer>("/transfers", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    updateStatus: (
      id: string,
      status: TransferStatus
    ) =>
      request<Transfer>(
        `/transfers/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      ),

    stats: () =>
      request<{
        warehouseCount: number;
        totalStock: number;
        transfers: {
          pending: number;
          approved: number;
          completed: number;
          cancelled: number;
        };
      }>("/transfers/summary/stats"),
  },
};