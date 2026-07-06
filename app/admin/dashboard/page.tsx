"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminGetProducts,
  adminGetCategories,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminCreateCategory,
  type Product,
  type Category,
} from "@/lib/api";

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  image_url: "",
  quantity: 0,
  is_visible: true,
  category_id: "" as string | number,
};

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      const [p, c] = await Promise.all([adminGetProducts(), adminGetCategories()]);
      setProducts(p);
      setCategories(c);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
      if (String(err.message).includes("authenticated") || String(err.message).includes("token")) {
        router.push("/admin/login");
      }
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      router.push("/admin/login");
      return;
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
      category_id: form.category_id ? Number(form.category_id) : null,
    };
    try {
      if (editingId) {
        await adminUpdateProduct(editingId, payload);
      } else {
        await adminCreateProduct(payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadAll();
    } catch (err: any) {
      setError(err.message || "Save failed");
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
      quantity: p.quantity,
      is_visible: p.is_visible,
      category_id: p.category?.id || "",
    });
  }

  async function toggleVisible(p: Product) {
    await adminUpdateProduct(p.id, { is_visible: !p.is_visible });
    loadAll();
  }

  async function quickSetQuantity(p: Product, qty: number) {
    await adminUpdateProduct(p.id, { quantity: Math.max(0, qty) });
    loadAll();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this product?")) return;
    await adminDeleteProduct(id);
    loadAll();
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await adminCreateCategory(newCategory.trim());
    setNewCategory("");
    loadAll();
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between container-px h-20 border-b border-black/5">
        <h1 className="text-lg tracking-widest uppercase">Admin Dashboard</h1>
        <button onClick={logout} className="text-sm uppercase tracking-wide hover:opacity-60">
          Log out
        </button>
      </header>

      <main className="container-px py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Product form */}
        <section className="bg-white rounded-2xl p-8 h-fit">
          <h2 className="text-sm uppercase tracking-wide mb-6">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full border border-black/10 rounded-lg px-4 py-2 text-sm"
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <textarea
              className="w-full border border-black/10 rounded-lg px-4 py-2 text-sm"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
            <input
              className="w-full border border-black/10 rounded-lg px-4 py-2 text-sm"
              placeholder="Image URL"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full border border-black/10 rounded-lg px-4 py-2 text-sm"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                required
              />
              <input
                type="number"
                min={0}
                className="w-full border border-black/10 rounded-lg px-4 py-2 text-sm"
                placeholder="Quantity in stock"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                required
              />
            </div>
            <select
              className="w-full border border-black/10 rounded-lg px-4 py-2 text-sm"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
              />
              Publicly visible on website
            </label>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button className="btn-primary flex-1">{editingId ? "Save Changes" : "Add Product"}</button>
              {editingId && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => { setEditingId(null); setForm(emptyForm); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="mt-10 pt-6 border-t border-black/5">
            <h3 className="text-sm uppercase tracking-wide mb-3">Add Category</h3>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                className="flex-1 border border-black/10 rounded-lg px-4 py-2 text-sm"
                placeholder="Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button className="btn-outline">Add</button>
            </form>
          </div>
        </section>

        {/* Product table */}
        <section className="lg:col-span-2 bg-white rounded-2xl p-8 overflow-x-auto">
          <h2 className="text-sm uppercase tracking-wide mb-6">Inventory ({products.length})</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400 border-b border-black/5">
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Visible</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-black/5">
                  <td className="py-3 pr-4">{p.name}</td>
                  <td className="py-3 pr-4 text-neutral-500">{p.category?.name || "—"}</td>
                  <td className="py-3 pr-4">₹{p.price}</td>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      min={0}
                      className="w-20 border border-black/10 rounded px-2 py-1"
                      value={p.quantity}
                      onChange={(e) => quickSetQuantity(p, Number(e.target.value))}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.stock_status === "out_of_stock"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {p.stock_status === "out_of_stock" ? "Sold Out" : "In Stock"}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="checkbox"
                      checked={p.is_visible}
                      onChange={() => toggleVisible(p)}
                    />
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <button className="text-xs underline mr-3" onClick={() => startEdit(p)}>Edit</button>
                    <button className="text-xs text-red-500 underline" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
