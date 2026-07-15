const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export type Category = {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  subcategories?: string;
  is_featured?: boolean;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  cost?: number;
  image_url: string;
  quantity: number;
  is_visible: boolean;
  subcategory?: string;
  stock_status: "in_stock" | "out_of_stock";
  category: Category | null;
};


export type User = {
  id: number;
  username: string;
  role: "admin" | "employee";
  created_at: string;
};

export type Client = {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone: string;
  created_at: string;
};

export type Enquiry = {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone: string;
  message: string;
  product_id?: number;
  product?: Product;
  status: "new" | "in_progress" | "responded" | "closed";
  created_at: string;
};

export type AnalyticsTrend = {
  date: string;
  count: number;
};

export type Analytics = {
  total_products: number;
  total_enquiries: number;
  out_of_stock: number;
  total_stock_qty: number;
  status_breakdown: Record<string, number>;
  categories_breakdown: Record<string, number>;
  enquiries_trend: AnalyticsTrend[];
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

// Public API
export const getProducts = (category?: string): Promise<Product[]> =>
  request(`/products${category ? `?category=${category}` : ""}`);

export const getProduct = (slug: string): Promise<Product> => request(`/products/${slug}`);

export const getCategories = (): Promise<Category[]> => request("/categories");

export const submitEnquiry = (data: {
  name: string;
  email: string;
  company?: string;
  phone: string;
  message: string;
  product_id?: number;
}): Promise<Enquiry> =>
  request("/enquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Admin/Employee Auth
export const adminLogin = (username: string, password: string) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

// Admin/Employee CRUD
export const adminGetProducts = (): Promise<Product[]> => request("/admin/products");

export const adminCreateProduct = (data: Partial<Product> & { category_id?: number | null }) =>
  request("/admin/products", { method: "POST", body: JSON.stringify(data) });

export const adminUpdateProduct = (id: number, data: Partial<Product> & { category_id?: number | null }) =>
  request(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const adminDeleteProduct = (id: number) =>
  request(`/admin/products/${id}`, { method: "DELETE" });

export const adminGetCategories = (): Promise<Category[]> => request("/admin/categories");

export const adminCreateCategory = (data: string | Partial<Category>) => {
  const body = typeof data === "string" ? { name: data } : data;
  return request("/admin/categories", { method: "POST", body: JSON.stringify(body) });
};

export const adminUpdateCategory = (id: number, data: Partial<Category>) =>
  request(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const adminDeleteCategory = (id: number) =>
  request(`/admin/categories/${id}`, { method: "DELETE" });

export const getSettings = (): Promise<Record<string, string>> => request("/settings");

export const adminUpdateSettings = (settings: Record<string, string>) =>
  request("/admin/settings", { method: "POST", body: JSON.stringify({ settings }) });


// Enquiries Management
export const adminGetEnquiries = (): Promise<Enquiry[]> => request("/admin/enquiries");

export const adminUpdateEnquiryStatus = (id: number, status: string): Promise<Enquiry> =>
  request(`/admin/enquiries/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

// Analytics Dashboard
export const adminGetAnalytics = (): Promise<Analytics> => request("/admin/analytics");

// Team Management (Admin Only)
export const adminGetUsers = (): Promise<User[]> => request("/admin/users");

export const adminCreateUser = (data: { username: string; password_hash?: string; password?: string; role: string }): Promise<User> =>
  request("/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const adminDeleteUser = (id: number) =>
  request(`/admin/users/${id}`, { method: "DELETE" });

// Clients database list
export const adminGetClients = (): Promise<Client[]> => request("/admin/clients");

// Admin manual enquiry creator
export const adminCreateEnquiry = (data: {
  name: string;
  email: string;
  company?: string;
  phone: string;
  message: string;
  product_id?: number | null;
  status?: string;
}): Promise<Enquiry> =>
  request("/admin/enquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });
