/**
 * API client — replaces @supabase/supabase-js on the frontend.
 * All calls go through /api/* which is proxied to the Express backend in dev
 * and served directly in production.
 */

const TOKEN_KEY = "admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
  options: { auth?: boolean; formData?: FormData } = {}
): Promise<T> {
  const headers: Record<string, string> = {};

  if (body && !options.formData) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth !== false) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: options.formData
      ? options.formData
      : body !== undefined
      ? JSON.stringify(body)
      : undefined,
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const msg = (data as Record<string, string>)?.error ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, msg);
  }

  return data as T;
}

// ── Types (shared with the backend) ──────────────────────────────────────────

export type OrderFormat = "physical" | "digital";
export type PaymentMethod = "mtn" | "orange" | "cinetpay" | "paypal";
export type DeliveryMethod = "home" | "pickup";
export type OrderStatus = "pending" | "verifying" | "confirmed" | "delivered";
export type BookStatus = "draft" | "published" | "archived";

export interface Order {
  id: string;
  format: OrderFormat;
  email: string;
  first_name: string;
  phone: string | null;
  city: string | null;
  address: string | null;
  delivery_method: DeliveryMethod | null;
  payment_method: PaymentMethod;
  payment_proof_url: string | null;
  amount: number;
  status: OrderStatus;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  tagline: string | null;
  author: string;
  description: string | null;
  cover_url: string | null;
  price_promo: number;
  price_full: number;
  currency: string;
  status: BookStatus;
  featured: boolean;
  release_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  author_name: string;
  comment: string;
  is_published: boolean;
  created_at: string;
}

export interface PromoSettings {
  end_iso: string;
  total_spots: number;
  baseline_sold: number;
  price_promo: number;
  price_full: number;
  currency: string;
  enabled: boolean;
}

export interface ContactSettings {
  email: string;
  phone: string;
  whatsapp: string;
}

export interface PaymentChannel {
  label: string;
  number?: string;
  enabled: boolean;
}

export interface PaymentsSettings {
  mtn: PaymentChannel;
  orange: PaymentChannel;
  cinetpay: PaymentChannel;
  paypal: PaymentChannel;
}

export interface BankSettings {
  bank_name: string;
  account_holder: string;
  account_number: string;
  iban: string;
  swift: string;
  enabled: boolean;
}

// ── API namespace ─────────────────────────────────────────────────────────────

export const api = {
  auth: {
    login: (email: string, password: string) =>
      req<{ token: string; user: { email: string } }>("POST", "/auth/login", { email, password }, { auth: false }),

    register: (email: string, password: string) =>
      req<{ token: string; user: { email: string } }>("POST", "/auth/register", { email, password }, { auth: false }),

    me: () =>
      req<{ user: { sub: string; email: string } }>("GET", "/auth/me"),
  },

  orders: {
    create: (data: Omit<Order, "payment_proof_url" | "status" | "created_at">) =>
      req<{ id: string }>("POST", "/orders", data, { auth: false }),

    updateProof: async (orderId: string, file: File) => {
      const form = new FormData();
      form.append("file", file);
      form.append("order_id", orderId);
      return req<{ url: string }>("POST", "/upload", undefined, { auth: false, formData: form });
    },

    list: () => req<Order[]>("GET", "/orders/admin"),
    updateStatus: (id: string, status: OrderStatus) =>
      req<{ ok: boolean }>("PATCH", `/orders/admin/${id}/status`, { status }),
  },

  books: {
    listPublished: () => req<Book[]>("GET", "/books", undefined, { auth: false }),
    listAll: () => req<Book[]>("GET", "/books/admin"),
    create: (data: Partial<Book>) => req<Book>("POST", "/books/admin", data),
    update: (id: string, data: Partial<Book>) => req<{ ok: boolean }>("PUT", `/books/admin/${id}`, data),
    delete: (id: string) => req<{ ok: boolean }>("DELETE", `/books/admin/${id}`),
  },

  comments: {
    listPublished: () => req<Comment[]>("GET", "/comments", undefined, { auth: false }),
    listAll: () => req<Comment[]>("GET", "/comments/admin"),
    create: (data: Omit<Comment, "id">) => req<Comment>("POST", "/comments/admin", data),
    update: (id: string, data: Partial<Comment>) => req<{ ok: boolean }>("PUT", `/comments/admin/${id}`, data),
    delete: (id: string) => req<{ ok: boolean }>("DELETE", `/comments/admin/${id}`),
  },

  settings: {
    getAll: () => req<Array<{ key: string; value: unknown }>>("GET", "/settings", undefined, { auth: false }),
    update: (key: string, value: unknown) => req<{ ok: boolean }>("PUT", `/settings/${key}`, { value }),
  },

  stats: {
    dashboard: () => req<{
      visits_total: number;
      visits_unique: number;
      visits_24h: number;
      orders_total: number;
      orders_pending: number;
      revenue_confirmed: number;
      revenue_pending: number;
      books_published: number;
      books_total: number;
      recent_orders: Order[];
      daily: { day: string; visits: number; orders: number }[];
    }>("GET", "/admin/stats"),
  },

  visits: {
    track: (path: string, visitor_id: string) =>
      req<{ ok: boolean }>("POST", "/visits", {
        path,
        visitor_id,
        user_agent: navigator.userAgent.slice(0, 500),
        referrer: document.referrer.slice(0, 500) || null,
      }, { auth: false }).catch(() => {}), // non-fatal
  },
};
