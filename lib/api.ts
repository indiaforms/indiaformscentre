const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export type Category = { id: number; name: string; slug: string };

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  quantity: number;
  is_visible: boolean;
  stock_status: "in_stock" | "out_of_stock";
  category: Category | null;
};

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Public
export const getProducts = (category?: string): Promise<Product[]> =>
  request(`/products${category ? `?category=${category}` : ""}`);

export const getProduct = (slug: string): Promise<Product> => request(`/products/${slug}`);

export const getCategories = (): Promise<Category[]> => request("/categories");

// Admin auth
export const adminLogin = (username: string, password: string) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });

// Admin CRUD
export const adminGetProducts = (): Promise<Product[]> => request("/admin/products");

export const adminCreateProduct = (data: Partial<Product> & { category_id?: number | null }) =>
  request("/admin/products", { method: "POST", body: JSON.stringify(data) });

export const adminUpdateProduct = (id: number, data: Partial<Product> & { category_id?: number | null }) =>
  request(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const adminDeleteProduct = (id: number) =>
  request(`/admin/products/${id}`, { method: "DELETE" });

export const adminGetCategories = (): Promise<Category[]> => request("/admin/categories");

export const adminCreateCategory = (name: string) =>
  request("/admin/categories", { method: "POST", body: JSON.stringify({ name }) });
