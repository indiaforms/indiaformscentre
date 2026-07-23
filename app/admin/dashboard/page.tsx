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
  adminUpdateCategory,
  adminDeleteCategory,
  adminGetEnquiries,
  adminUpdateEnquiryStatus,
  adminGetAnalytics,
  adminGetUsers,
  adminCreateUser,
  adminDeleteUser,
  adminGetClients,
  adminCreateEnquiry,
  getSettings,
  adminUpdateSettings,
  type Product,
  type Category,
  type Enquiry,
  type User,
  type Analytics,
  type Client,
} from "@/lib/api";
import { 
  Package, 
  Users, 
  Layers, 
  MessageSquare, 
  BarChart3, 
  LogOut, 
  Plus, 
  Search, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit3, 
  Download, 
  UserPlus, 
  TrendingUp, 
  AlertTriangle, 
  Smartphone, 
  Clock, 
  CheckCircle,
  XCircle,
  TrendingDown,
  Sun,
  Moon,
  Briefcase,
  Image as ImageIcon,
  Settings,
  Sparkles,
  Menu,
  X
} from "lucide-react";

import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import * as XLSX from "xlsx";

type FormState = {
  name: string;
  description: string;
  price: number;
  cost: number;
  image_url: string;
  quantity: number;
  is_visible: boolean;
  subcategory: string;
  category_id: string | number;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: 0,
  cost: 0,
  image_url: "",
  quantity: 0,
  is_visible: true,
  subcategory: "",
  category_id: "",
};

export default function AdminDashboard() {
  const router = useRouter();
  
  // Tab states: 'overview' | 'inventory' | 'enquiries' | 'categories' | 'team'
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [manualEnquiryForm, setManualEnquiryForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "Manual order enquiry recorded by administrator.",
    product_id: "",
    status: "new",
  });
  const [clientSuggestions, setClientSuggestions] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dashboardTheme, setDashboardTheme] = useState("light");
  
  const [userRole, setUserRole] = useState<string>("employee");
  const [currentUser, setCurrentUser] = useState<string>("");
  
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  
  // Settings & Category editing states
  const [settings, setSettings] = useState<Record<string, string>>({ catalogue_url: "/catalogue.pdf" });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryImage, setEditCategoryImage] = useState("");
  const [editCategorySubcategories, setEditCategorySubcategories] = useState("");
  const [editCategoryIsFeatured, setEditCategoryIsFeatured] = useState(true);
  
  // Team creation states
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("employee");
  const [newName, setNewName] = useState("");
  const [bulkResults, setBulkResults] = useState<{name: string, username: string, password: string}[] | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [enquirySearchQuery, setEnquirySearchQuery] = useState("");
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load everything
  async function loadData() {
    try {
      const role = localStorage.getItem("user_role") || "employee";
      const user = localStorage.getItem("username") || "";
      setUserRole(role);
      setCurrentUser(user);

      const [p, c, e, a, cl, s] = await Promise.all([
        adminGetProducts(),
        adminGetCategories(),
        adminGetEnquiries().catch(() => []),
        adminGetAnalytics().catch(() => null),
        adminGetClients().catch(() => []),
        getSettings().catch(() => ({ catalogue_url: "/catalogue.pdf" }))
      ]);
      
      setProducts(p);
      setCategories(c);
      setEnquiries(e);
      setAnalytics(a);
      setClients(cl);
      setSettings(s);

      if (role === "admin") {
        const u = await adminGetUsers().catch(() => []);
        setTeamUsers(u);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sync dashboard data.");
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
    loadData();
    
    const activeTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setDashboardTheme(activeTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("username");
    router.push("/admin/login");
  }

  // Clear alerts
  function clearAlerts() {
    setError("");
    setSuccess("");
  }

  // Handle Client-Side Image Upload & Compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75); // 75% quality JPEG
          setForm(prev => ({ ...prev, image_url: compressedDataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle Product Save (Add/Update)
  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearAlerts();
    const payload = {
      ...form,
      price: Number(form.price),
      cost: Number(form.cost),
      quantity: Number(form.quantity),
      category_id: form.category_id ? Number(form.category_id) : null,
    };

    try {
      if (editingId) {
        await adminUpdateProduct(editingId, payload);
        setSuccess("Product updated successfully.");
      } else {
        await adminCreateProduct(payload);
        setSuccess("New product added to inventory.");
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowProductForm(false);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    }
  }

  // Trigger editing product
  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      cost: p.cost || 0,
      image_url: p.image_url,
      quantity: p.quantity,
      is_visible: p.is_visible,
      subcategory: p.subcategory || "",
      category_id: p.category?.id || "",
    });
    setShowProductForm(true);
  }

  // Category & Settings handlers
  function handleEditCategory(c: Category) {
    setSelectedCategory(c);
    setEditCategoryName(c.name);
    setEditCategoryImage(c.image_url || "");
    setEditCategorySubcategories(c.subcategories || "");
    setEditCategoryIsFeatured(c.is_featured !== false);
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategory) return;
    clearAlerts();
    try {
      await adminUpdateCategory(selectedCategory.id, {
        name: editCategoryName,
        image_url: editCategoryImage,
        subcategories: editCategorySubcategories,
        is_featured: editCategoryIsFeatured
      });
      setSuccess("Category updated successfully.");
      setSelectedCategory(null);
      const c = await adminGetCategories();
      setCategories(c);
    } catch (err: any) {
      setError(err.message || "Failed to update category.");
    }
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm("Are you sure you want to delete this category? All associated products will lose their category association.")) return;
    clearAlerts();
    try {
      await adminDeleteCategory(id);
      setSuccess("Category deleted successfully.");
      const c = await adminGetCategories();
      setCategories(c);
      // Reload products to sync
      const p = await adminGetProducts();
      setProducts(p);
    } catch (err: any) {
      setError(err.message || "Failed to delete category.");
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    clearAlerts();
    try {
      await adminUpdateSettings(settings);
      setSuccess("Settings saved successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to save settings.");
    }
  }

  // Toggle Visibility
  async function toggleVisible(p: Product) {
    clearAlerts();
    try {
      await adminUpdateProduct(p.id, { is_visible: !p.is_visible });
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to update visibility.");
    }
  }

  // Quick adjust quantity
  async function quickSetQuantity(p: Product, qty: number) {
    clearAlerts();
    try {
      await adminUpdateProduct(p.id, { quantity: Math.max(0, qty) });
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to update quantity.");
    }
  }

  // Delete product (Admin only)
  async function handleDeleteProduct(id: number) {
    if (userRole !== "admin") {
      setError("Only administrators can delete products.");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    clearAlerts();
    try {
      await adminDeleteProduct(id);
      setSuccess("Product deleted successfully.");
      loadData();
    } catch (err: any) {
      setError(err.message || "Delete failed.");
    }
  }

  // Add Category
  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    clearAlerts();
    try {
      await adminCreateCategory(newCategory.trim());
      setSuccess(`Category "${newCategory.trim()}" created.`);
      setNewCategory("");
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create category.");
    }
  }

  // Update Enquiry Status
  async function handleEnquiryStatusChange(id: number, newStatus: string) {
    clearAlerts();
    try {
      await adminUpdateEnquiryStatus(id, newStatus);
      setSuccess("Enquiry status updated.");
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
    }
  }

  // Create Team User (Admin only)
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;
    clearAlerts();
    try {
      await adminCreateUser({
        name: newName.trim() || undefined,
        username: newUsername.trim(),
        password: newPassword.trim(),
        role: newRole,
      });
      setSuccess(`User Account for "${newUsername.trim()}" created successfully.`);
      setNewUsername("");
      setNewPassword("");
      setNewName("");
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create user account.");
    }
  }

  // Bulk Upload Employees
  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearAlerts();
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Find a column representing Name
        const names: string[] = [];
        for (const row of data as any[]) {
          const nameField = row["Name"] || row["name"] || row["Employee Name"] || row["Full Name"];
          if (nameField && typeof nameField === "string" && nameField.trim()) {
            names.push(nameField.trim());
          }
        }

        if (names.length === 0) {
          setError("No valid 'Name' column found in the uploaded file.");
          return;
        }

        const token = localStorage.getItem("admin_token");
        const res = await fetch("/api/admin/employees/bulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ names }),
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to bulk upload employees");
        }

        const resultData = await res.json();
        setSuccess(`Successfully added ${resultData.added.length} employees.`);
        setBulkResults(resultData.added);
        loadData();
      } catch (err: any) {
        setError(err.message || "Error processing file upload.");
      }
      if (e.target) e.target.value = ""; // Reset input
    };
    reader.readAsBinaryString(file);
  };

  // Delete Team User (Admin only)
  async function handleDeleteUser(id: number) {
    if (confirm("Delete this user account?")) {
      clearAlerts();
      try {
        await adminDeleteUser(id);
        setSuccess("User account removed.");
        loadData();
      } catch (err: any) {
        setError(err.message || "Failed to delete user.");
      }
    }
  }

  // Export Inventory to CSV
  const handleExportCSV = () => {
    const headers = ["Product ID", "Name", "Slug", "Category", "Cost (INR)", "Price (INR)", "Quantity", "Status", "Visible"];
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.slug,
      p.category?.name || "—",
      p.cost || 0,
      p.price,
      p.quantity,
      p.stock_status === "out_of_stock" ? "Sold Out" : "In Stock",
      p.is_visible ? "Yes" : "No",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fuzo_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp Connect Helper
  const launchWhatsApp = (enq: Enquiry) => {
    const clientPhone = enq.phone.replace(/[^0-9+]/g, ""); // Keep number clean
    const cleanedPhone = clientPhone.startsWith("+") ? clientPhone.substring(1) : clientPhone;
    
    // Add default India country code if length is 10 digits
    const destination = cleanedPhone.length === 10 ? `91${cleanedPhone}` : cleanedPhone;
    
    const text = `Hi ${enq.name}, thanking you for reaching out to FUZO Centre.\n` +
      `We received your enquiry regarding corporate gifting (Ref: #${enq.id}).\n` +
      `Our representative is here to help customize your kits. Could you share your logo design?`;
      
    const url = `https://wa.me/${destination}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Submit manual enquiry
  async function handleManualEnquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    clearAlerts();
    try {
      const payload = {
        ...manualEnquiryForm,
        product_id: manualEnquiryForm.product_id ? Number(manualEnquiryForm.product_id) : null,
      };
      await adminCreateEnquiry(payload);
      setSuccess("Manual enquiry added successfully.");
      setManualEnquiryForm({
        name: "",
        email: "",
        company: "",
        phone: "",
        message: "Manual order enquiry recorded by administrator.",
        product_id: "",
        status: "new",
      });
      setShowEnquiryModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create manual enquiry.");
    }
  }

  // Handle Client name autocomplete selection
  const handleSelectClient = (client: Client) => {
    setManualEnquiryForm({
      ...manualEnquiryForm,
      name: client.name,
      email: client.email,
      company: client.company || "",
      phone: client.phone,
    });
    setShowSuggestions(false);
  };

  // Handle client name input typing
  const handleClientNameChange = (val: string) => {
    setManualEnquiryForm({
      ...manualEnquiryForm,
      name: val,
    });
    if (val.trim().length > 0) {
      const filtered = clients.filter(c => 
        c.name.toLowerCase().includes(val.toLowerCase()) ||
        c.email.toLowerCase().includes(val.toLowerCase())
      );
      setClientSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const toggleDashboardTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDashboardTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDashboardTheme("dark");
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "" || p.category?.id.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter enquiries
  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(enquirySearchQuery.toLowerCase()) || 
                          (e.company && e.company.toLowerCase().includes(enquirySearchQuery.toLowerCase())) ||
                          e.phone.includes(enquirySearchQuery) || 
                          e.message.toLowerCase().includes(enquirySearchQuery.toLowerCase());
    const matchesStatus = enquiryStatusFilter === "" || e.status === enquiryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Banner Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="container-px max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 -ml-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <Briefcase size={16} />
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider text-ink">India Forms Center Portal</h1>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-semibold">
                Logged in as: <span className="text-ink font-bold">{currentUser}</span> ({userRole})
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Light/Dark Toggle Button */}
            <button
              onClick={toggleDashboardTheme}
              className="p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-slate-800 text-ink transition-colors border border-neutral-200 dark:border-neutral-700/50"
              aria-label="Toggle theme mode"
            >
              {dashboardTheme === "dark" ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-600" />}
            </button>

            <button 
              onClick={logout} 
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-red-600 transition-colors bg-neutral-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700/50"
            >
              <LogOut size={13} />
              Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row container-px max-w-7xl mx-auto py-8 gap-8 w-full relative">
               {/* Left Sidebar Navigation */}
        <div className={`fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
        <aside className={`fixed lg:static top-0 left-0 h-full lg:h-fit w-64 bg-cream dark:bg-[#060b18] lg:bg-transparent z-50 p-6 lg:p-0 flex flex-col gap-2 transform transition-transform duration-300 lg:transform-none ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>
          
          <div className="flex items-center justify-between lg:hidden mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-ink">Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-neutral-500 hover:text-ink"><X size={20}/></button>
          </div>

          <button
            onClick={() => { setActiveTab("overview"); clearAlerts(); setIsSidebarOpen(false); }}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all w-full text-left ${
              activeTab === "overview"
                ? "bg-primary text-white shadow-md shadow-blue-500/10"
                : "bg-card text-neutral-600 dark:text-neutral-400 border border-border hover:bg-neutral-100/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <BarChart3 size={15} />
            Overview
          </button>
          
          <button
            onClick={() => { setActiveTab("inventory"); clearAlerts(); setIsSidebarOpen(false); }}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all w-full text-left ${
              activeTab === "inventory"
                ? "bg-primary text-white shadow-md shadow-blue-500/10"
                : "bg-card text-neutral-600 dark:text-neutral-400 border border-border hover:bg-neutral-100/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <Package size={15} />
            Inventory
          </button>
          
          <button
            onClick={() => { setActiveTab("enquiries"); clearAlerts(); setIsSidebarOpen(false); }}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all w-full text-left relative ${
              activeTab === "enquiries"
                ? "bg-primary text-white shadow-md shadow-blue-500/10"
                : "bg-card text-neutral-600 dark:text-neutral-400 border border-border hover:bg-neutral-100/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <MessageSquare size={15} />
            Enquiries
            {enquiries.filter(e => e.status === "new").length > 0 && (
              <span className="absolute top-1/2 right-4 -translate-y-1/2 bg-red-500 text-white font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {enquiries.filter(e => e.status === "new").length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab("categories"); clearAlerts(); setIsSidebarOpen(false); }}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all w-full text-left ${
              activeTab === "categories"
                ? "bg-primary text-white shadow-md shadow-blue-500/10"
                : "bg-card text-neutral-600 dark:text-neutral-400 border border-border hover:bg-neutral-100/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <Layers size={15} />
            Categories
          </button>


          <button
            onClick={() => { setActiveTab("settings"); clearAlerts(); setIsSidebarOpen(false); }}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all w-full text-left ${
              activeTab === "settings"
                ? "bg-primary text-white shadow-md shadow-blue-500/10"
                : "bg-card text-neutral-600 dark:text-neutral-400 border border-border hover:bg-neutral-100/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <Settings size={15} />
            Settings
          </button>
 
          {userRole === "admin" && (
            <button
              onClick={() => { setActiveTab("team"); clearAlerts(); }}
              className={`flex items-center gap-2.5 px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all w-full text-left ${
                activeTab === "team"
                  ? "bg-primary text-white shadow-md shadow-blue-500/10"
                  : "bg-card text-neutral-600 dark:text-neutral-400 border border-border hover:bg-neutral-100/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Users size={15} />
              Employees
            </button>
          )}
        </aside>

        {/* Right Dashboard Workspace */}
        <main className="flex-1 space-y-6 min-w-0">
          
          {/* Status Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm animate-fade-in">
              <AlertTriangle size={18} className="flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700 text-sm animate-fade-in">
              <CheckCircle size={18} className="flex-shrink-0 text-green-500" />
              <span>{success}</span>
            </div>
          )}

          {/* ==================== TAB: OVERVIEW ==================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Analytics Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-neutral-200/75 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Products</span>
                    <h3 className="text-3xl font-semibold text-ink">{analytics?.total_products || products.length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-neutral-50 text-ink border border-neutral-100 rounded-xl flex items-center justify-center">
                    <Package size={22} />
                  </div>
                </div>

                <div className="bg-white border border-neutral-200/75 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Enquiries (All)</span>
                    <h3 className="text-3xl font-semibold text-ink">{analytics?.total_enquiries || enquiries.length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-neutral-50 text-ink border border-neutral-100 rounded-xl flex items-center justify-center">
                    <MessageSquare size={22} />
                  </div>
                </div>

                <div className="bg-white border border-neutral-200/75 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Out of Stock Alerts</span>
                    <h3 className={`text-3xl font-semibold ${analytics?.out_of_stock && analytics.out_of_stock > 0 ? "text-red-500 font-bold" : "text-ink"}`}>
                      {analytics?.out_of_stock || products.filter(p => p.quantity <= 0).length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-neutral-50 text-ink border border-neutral-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={22} className={analytics?.out_of_stock && analytics.out_of_stock > 0 ? "text-red-500 animate-pulse" : "text-ink"} />
                  </div>
                </div>

                <div className="bg-white border border-neutral-200/75 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Stock Qty</span>
                    <h3 className="text-3xl font-semibold text-ink">{analytics?.total_stock_qty || products.reduce((acc, curr) => acc + curr.quantity, 0)}</h3>
                  </div>
                  <div className="w-12 h-12 bg-neutral-50 text-ink border border-neutral-100 rounded-xl flex items-center justify-center">
                    <TrendingUp size={22} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Bar Chart - Enquiries Trend */}
                <div className="lg:col-span-2 bg-white border border-neutral-200/75 rounded-2xl p-6 shadow-sm space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                    <TrendingUp size={14} /> Enquiries Trend (Last 7 Days)
                  </h3>
                  
                  {analytics?.enquiries_trend && analytics.enquiries_trend.length > 0 ? (
                    <div className="h-56 flex items-end justify-between gap-4 pt-4 px-2">
                      {analytics.enquiries_trend.map((day, idx) => {
                        const maxVal = Math.max(...analytics.enquiries_trend.map(d => d.count), 1);
                        const pct = (day.count / maxVal) * 80; // keep headroom
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                            <div className="text-[10px] font-bold text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              {day.count}
                            </div>
                            <div 
                              className="w-full bg-neutral-100 hover:bg-ink rounded-lg transition-all duration-300 relative"
                              style={{ height: `${pct}%`, minHeight: day.count > 0 ? "8px" : "2px" }}
                            />
                            <span className="text-[9px] font-bold uppercase text-neutral-400 select-none">
                              {day.date}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-56 flex items-center justify-center text-xs text-neutral-400 italic">
                      Insufficient trend analytics.
                    </div>
                  )}
                </div>

                {/* Categories share list */}
                <div className="bg-white border border-neutral-200/75 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                      <Layers size={14} /> Catalogues Share
                    </h3>
                    <div className="space-y-3 pt-2">
                      {analytics?.categories_breakdown && Object.keys(analytics.categories_breakdown).length > 0 ? (
                        Object.entries(analytics.categories_breakdown).map(([cat, count], idx) => {
                          const total = Object.values(analytics.categories_breakdown).reduce((a, b) => a + b, 0);
                          const sharePct = total > 0 ? (count / total) * 100 : 0;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-neutral-700">{cat}</span>
                                <span className="text-neutral-400">{count} products ({sharePct.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                <div className="h-full bg-ink rounded-full" style={{ width: `${sharePct}%` }} />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-neutral-400 italic">No category share data.</p>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab("inventory")}
                    className="w-full text-center text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-ink pt-4 border-t border-neutral-100 mt-4 block"
                  >
                    View Catalogues
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Standard Low Stock Alerts */}
                <div className="bg-white border border-neutral-200/75 rounded-2xl p-6 shadow-sm flex flex-col max-h-[350px]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Low Stock Warnings
                  </h3>
                  <div className="overflow-y-auto space-y-2 flex-1 pr-2">
                    {products.filter(p => p.quantity <= 3).length === 0 ? (
                      <p className="text-xs text-neutral-400 italic py-2">All product stocks are at healthy quantities.</p>
                    ) : (
                      products.filter(p => p.quantity <= 3).map((p) => (
                        <div key={p.id} className="flex items-center justify-between py-2.5 px-4 rounded-xl border border-neutral-100 bg-neutral-50">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${p.quantity === 0 ? "bg-red-500 animate-pulse" : "bg-amber-500"}`} />
                            <span className="text-xs font-semibold text-neutral-700">{p.name}</span>
                            <span className="text-[10px] bg-neutral-200/70 text-neutral-500 px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:block">
                              {p.category?.name || "No Category"}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-ink bg-white border border-neutral-200/60 px-3 py-1 rounded-lg">
                            {p.quantity === 0 ? "SOLD OUT" : `${p.quantity} Left`}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* AI Predictive Restock Warnings */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 shadow-sm flex flex-col max-h-[350px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-800 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-indigo-500" /> Restock Forecast (AI)
                    </h3>
                    <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      Based on 30-Day Enquiry Velocity
                    </span>
                  </div>
                  <div className="overflow-y-auto space-y-2 flex-1 pr-2">
                    {!analytics?.inventory_warnings || analytics.inventory_warnings.length === 0 ? (
                      <p className="text-xs text-indigo-400 italic py-2">No impending stockouts predicted in the next 14 days.</p>
                    ) : (
                      analytics.inventory_warnings.map((w, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2.5 px-4 rounded-xl border border-indigo-100 bg-white shadow-sm">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-indigo-900">{w.name}</span>
                            <span className="text-[9px] font-semibold text-indigo-500 uppercase tracking-wider mt-0.5">
                              {w.daily_rate} enquiries/day
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg mb-1">
                              Depletes in {w.predicted_days_left} Days
                            </span>
                            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                              Stock: {w.current_stock}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB: INVENTORY ==================== */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              
              {/* Header Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input
                      type="text"
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-ink outline-none focus:border-ink"
                      placeholder="Search inventory..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-xs text-neutral-600 outline-none focus:border-ink"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button 
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-1.5 bg-white border border-neutral-200 text-neutral-600 hover:text-ink hover:border-neutral-300 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-sm w-full sm:w-auto"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                  <button 
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm);
                      setShowProductForm(!showProductForm);
                    }}
                    className="flex items-center justify-center gap-1 bg-ink text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md w-full sm:w-auto"
                  >
                    <Plus size={15} /> Add Product
                  </button>
                </div>
              </div>

              {/* Product Form Panel Overlay/Inline */}
              {showProductForm && (
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-md space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
                      {editingId ? `Editing Product: ${form.name}` : "Create New Corporate Product"}
                    </h3>
                    <button 
                      onClick={() => setShowProductForm(false)}
                      className="text-xs uppercase tracking-wider text-neutral-400 hover:text-ink font-bold"
                    >
                      Close Form
                    </button>
                  </div>
                  
                  <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Product Name</label>
                        <input
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink"
                          placeholder="Fuzo Smart Thermos Flask 500ml"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Description / Pricing details</label>
                        <textarea
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink"
                          placeholder="Double-walled stainless steel, temperature display, premium rubber finish..."
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Image (Upload or URL)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink"
                            placeholder="https://... or paste URL"
                            value={form.image_url}
                            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                          />
                          <label className="cursor-pointer flex items-center justify-center bg-white border border-neutral-200 text-neutral-600 hover:text-ink hover:border-neutral-300 px-4 py-2.5 rounded-xl transition-all shadow-sm text-xs font-bold uppercase tracking-wider flex-shrink-0">
                            <ImageIcon size={14} className="mr-2" />
                            Upload
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                        {form.image_url && form.image_url.startsWith('data:image') && (
                          <p className="mt-1.5 text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle size={10} /> Image uploaded & compressed successfully.
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Purchase Cost (INR)</label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink"
                            placeholder="400"
                            value={form.cost}
                            onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Selling Price (INR)</label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink"
                            placeholder="650"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            min={0}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink"
                            placeholder="120"
                            value={form.quantity}
                            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Category</label>
                        <select
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-ink"
                          value={form.category_id}
                          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Subcategory</label>
                        <input
                          type="text"
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink"
                          placeholder="Drinkware"
                          value={form.subcategory}
                          onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                        />
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-neutral-300 accent-ink cursor-pointer"
                            checked={form.is_visible}
                            onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                          />
                          Make visible in public catalogue
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-3 flex justify-end gap-3 border-t border-neutral-100 pt-4">
                      <button 
                        type="button" 
                        onClick={() => { setShowProductForm(false); setEditingId(null); setForm(emptyForm); }}
                        className="bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="bg-ink text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-xl transition-all"
                      >
                        {editingId ? "Save Changes" : "Create Product"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Product Grid Table */}
              <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50/70 border-b border-neutral-200/60 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        <th className="py-4.5 px-6">Product Details</th>
                        <th className="py-4.5 px-6">Category</th>
                        <th className="py-4.5 px-6">Purchase Cost</th>
                        <th className="py-4.5 px-6">Selling Price</th>
                        <th className="py-4.5 px-6">Qty in Stock</th>
                        <th className="py-4.5 px-6">Stock Status</th>
                        <th className="py-4.5 px-6">Visibility</th>
                        <th className="py-4.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-neutral-400 italic">
                            No products found matching your filter parameters.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-neutral-50/40 transition-colors">
                            <td className="py-4 px-6 font-semibold text-ink">
                              <div className="flex items-center gap-3">
                                {p.image_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded-lg border border-neutral-100" />
                                ) : (
                                  <div className="w-10 h-10 bg-neutral-100 text-neutral-300 rounded-lg flex items-center justify-center">
                                    <ImageIcon size={14} />
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-neutral-800 block">{p.name}</span>
                                  <span className="text-[10px] text-neutral-400 font-mono select-all">slug: {p.slug}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-neutral-500 font-semibold">{p.category?.name || "—"}</td>
                            <td className="py-4 px-6 font-medium text-neutral-500">₹{p.cost !== undefined ? p.cost.toLocaleString("en-IN") : "0"}</td>
                            <td className="py-4 px-6 font-bold text-ink">₹{p.price.toLocaleString("en-IN")}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  className="w-16 bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 text-center font-bold text-ink outline-none focus:border-ink"
                                  value={p.quantity}
                                  onChange={(e) => quickSetQuantity(p, Number(e.target.value))}
                                />
                                <span className="text-[10px] text-neutral-400 font-medium">units</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                  p.stock_status === "out_of_stock"
                                    ? "bg-red-50 text-red-600 border border-red-100"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                }`}
                              >
                                {p.stock_status === "out_of_stock" ? "Sold Out" : "In Stock"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <button 
                                onClick={() => toggleVisible(p)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                                  p.is_visible 
                                    ? "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400" 
                                    : "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100/50"
                                }`}
                              >
                                {p.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                <span className="text-[10px] uppercase font-bold tracking-wider">
                                  {p.is_visible ? "Public" : "Draft"}
                                </span>
                              </button>
                            </td>
                            <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                              <button 
                                onClick={() => startEdit(p)}
                                className="inline-flex items-center gap-1 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all"
                              >
                                <Edit3 size={11} /> Edit
                              </button>
                              {userRole === "admin" && (
                                <button 
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all"
                                >
                                  <Trash2 size={11} /> Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: ENQUIRIES ==================== */}
          {activeTab === "enquiries" && (
            <div className="space-y-6">
              
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                  <input
                    type="text"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-ink outline-none focus:border-ink"
                    placeholder="Search client name, company, product, or message..."
                    value={enquirySearchQuery}
                    onChange={(e) => setEnquirySearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <select
                    className="bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-600 outline-none focus:border-ink w-full sm:w-auto font-semibold"
                    value={enquiryStatusFilter}
                    onChange={(e) => setEnquiryStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="new">New / Unprocessed</option>
                    <option value="in_progress">In Discussion</option>
                    <option value="responded">Quoted / Responded</option>
                    <option value="closed">Closed / Finalized</option>
                  </select>
                  <button 
                    onClick={() => {
                      clearAlerts();
                      setShowEnquiryModal(true);
                    }}
                    className="flex items-center justify-center gap-1.5 bg-ink text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md w-full sm:w-auto whitespace-nowrap"
                  >
                    <Plus size={15} /> Record Enquiry
                  </button>
                </div>
              </div>

              {/* Manual Enquiry Modal Overlay */}
              {showEnquiryModal && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                  <div className="bg-white border border-neutral-200 p-8 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-ink">Record Manual Client Enquiry</h3>
                      <button 
                        onClick={() => {
                          setShowEnquiryModal(false);
                          setManualEnquiryForm({
                            name: "",
                            email: "",
                            company: "",
                            phone: "",
                            message: "Manual order enquiry recorded by administrator.",
                            product_id: "",
                            status: "new",
                          });
                          setShowSuggestions(false);
                        }}
                        className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-ink"
                      >
                        Close
                      </button>
                    </div>

                    <form onSubmit={handleManualEnquirySubmit} className="space-y-4 text-left">
                      {/* Name input with autocomplete */}
                      <div className="relative">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Client Name
                        </label>
                        <input
                          type="text"
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink text-ink placeholder:text-neutral-300"
                          placeholder="Start typing client name..."
                          value={manualEnquiryForm.name}
                          onChange={(e) => handleClientNameChange(e.target.value)}
                          onFocus={() => {
                            if (manualEnquiryForm.name.trim().length > 0) setShowSuggestions(true);
                          }}
                          required
                          autoComplete="off"
                        />
                        
                        {/* Repeat order client suggestions popup */}
                        {showSuggestions && clientSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-neutral-100">
                            <div className="px-3.5 py-1.5 text-[9px] font-bold text-neutral-400 uppercase bg-neutral-50/70 select-none">
                              Repeat Order Suggestions
                            </div>
                            {clientSuggestions.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => handleSelectClient(c)}
                                className="w-full text-left px-4 py-2.5 text-xs hover:bg-neutral-50 transition-colors flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-bold text-neutral-800 block">{c.name}</span>
                                  <span className="text-[10px] text-neutral-400 block">{c.company || "No Company"}</span>
                                </div>
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-2 py-0.5 rounded-full">
                                  Repeat Customer
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink text-ink placeholder:text-neutral-300"
                            placeholder="client@email.com"
                            value={manualEnquiryForm.email}
                            onChange={(e) => setManualEnquiryForm({ ...manualEnquiryForm, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink text-ink placeholder:text-neutral-300"
                            placeholder="+91 98765 43210"
                            value={manualEnquiryForm.phone}
                            onChange={(e) => setManualEnquiryForm({ ...manualEnquiryForm, phone: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Company Name
                        </label>
                        <input
                          type="text"
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink text-ink placeholder:text-neutral-300"
                          placeholder="Corporation Name"
                          value={manualEnquiryForm.company}
                          onChange={(e) => setManualEnquiryForm({ ...manualEnquiryForm, company: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                            Catalogue Product
                          </label>
                          <select
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-ink font-semibold text-neutral-700"
                            value={manualEnquiryForm.product_id}
                            onChange={(e) => setManualEnquiryForm({ ...manualEnquiryForm, product_id: e.target.value })}
                          >
                            <option value="">No Specific Product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                            Enquiry Status
                          </label>
                          <select
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-ink font-semibold text-neutral-700"
                            value={manualEnquiryForm.status}
                            onChange={(e) => setManualEnquiryForm({ ...manualEnquiryForm, status: e.target.value })}
                          >
                            <option value="new">New / Unprocessed</option>
                            <option value="in_progress">In Discussion</option>
                            <option value="responded">Quoted / Responded</option>
                            <option value="closed">Closed / Finalized</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Requirement Details
                        </label>
                        <textarea
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink text-ink placeholder:text-neutral-300"
                          placeholder="Manual notes, target quantity, customization details..."
                          rows={4}
                          value={manualEnquiryForm.message}
                          onChange={(e) => setManualEnquiryForm({ ...manualEnquiryForm, message: e.target.value })}
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4">
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowEnquiryModal(false);
                            setManualEnquiryForm({
                              name: "",
                              email: "",
                              company: "",
                              phone: "",
                              message: "Manual order enquiry recorded by administrator.",
                              product_id: "",
                              status: "new",
                            });
                            setShowSuggestions(false);
                          }}
                          className="bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="bg-ink text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-xl transition-all"
                        >
                          Save Record
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Enquiries Grid */}
              <div className="space-y-4">
                {filteredEnquiries.length === 0 ? (
                  <div className="bg-white rounded-2xl p-16 text-center text-neutral-400 italic shadow-sm border border-neutral-200">
                    No matching client enquiries found.
                  </div>
                ) : (
                  filteredEnquiries.map((enq) => (
                    <div 
                      key={enq.id} 
                      className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 transition-all ${
                        enq.status === "new" ? "border-l-4 border-l-red-500 border-neutral-200" : "border-neutral-200/80"
                      }`}
                    >
                      <div className="space-y-4 flex-1">
                        {/* Title details */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-bold text-neutral-400">Enquiry #{enq.id}</span>
                          <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                            <Clock size={11} /> {new Date(enq.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                          </span>
                          
                          {/* Status Pill */}
                          <span
                            className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              enq.status === "new" ? "bg-red-50 text-red-600 border border-red-100" :
                              enq.status === "in_progress" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                              enq.status === "responded" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                              "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            }`}
                          >
                            {enq.status.replace("_", " ")}
                          </span>
                        </div>

                        {/* Client details info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-neutral-100 pb-3">
                          <div>
                            <span className="block text-[9px] font-bold text-neutral-400 uppercase">Contact Name</span>
                            <span className="text-xs font-bold text-ink">{enq.name}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold text-neutral-400 uppercase">Company Name</span>
                            <span className="text-xs font-bold text-ink">{enq.company || "—"}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold text-neutral-400 uppercase">Phone & Email</span>
                            <span className="text-xs font-bold text-ink block">{enq.phone}</span>
                            <span className="text-[10px] text-neutral-500 font-mono block select-all">{enq.email}</span>
                          </div>
                        </div>

                        {/* Product Detail Connection */}
                        {enq.product && (
                          <div className="bg-neutral-50 rounded-xl p-3 flex items-center gap-3 border border-neutral-200/50">
                            {enq.product.image_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={enq.product.image_url} alt="" className="w-8 h-8 object-cover rounded-lg border border-neutral-100" />
                            )}
                            <div>
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400">Target Catalogue Item</span>
                              <span className="text-xs font-bold text-ink">{enq.product.name} (Base: ₹{enq.product.price})</span>
                            </div>
                          </div>
                        )}

                        {/* Message details */}
                        <div className="bg-neutral-50/50 rounded-xl p-4 border border-neutral-100">
                          <span className="block text-[9px] font-bold text-neutral-400 uppercase mb-1">Requirement Notes</span>
                          <p className="text-xs text-neutral-600 leading-relaxed font-light">{enq.message}</p>
                        </div>
                      </div>

                      {/* Actions sidebar */}
                      <div className="md:w-56 flex flex-col justify-between border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-2">Process Enquiry Status</label>
                          <select
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 outline-none focus:border-ink"
                            value={enq.status}
                            onChange={(e) => handleEnquiryStatusChange(enq.id, e.target.value)}
                          >
                            <option value="new">New Enquiry</option>
                            <option value="in_progress">In Discussion</option>
                            <option value="responded">Quoted / Sent</option>
                            <option value="closed">Closed / Completed</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => launchWhatsApp(enq)}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm"
                          >
                            <Smartphone size={13} /> Message WhatsApp
                          </button>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ==================== TAB: CATEGORIES ==================== */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Category creation or Edit Category */}
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
                {selectedCategory ? (
                  <>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Edit Category</h3>
                    <form onSubmit={handleSaveCategory} className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Name</label>
                        <input
                          type="text"
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Image URL</label>
                        <input
                          type="text"
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={editCategoryImage}
                          onChange={(e) => setEditCategoryImage(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Subcategories (comma-separated)</label>
                        <textarea
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink min-h-[80px]"
                          placeholder="Subcat1, Subcat2, Subcat3"
                          value={editCategorySubcategories}
                          onChange={(e) => setEditCategorySubcategories(e.target.value)}
                        />
                      </div>
                      <div className="pt-1">
                        <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-neutral-300 accent-ink cursor-pointer"
                            checked={editCategoryIsFeatured}
                            onChange={(e) => setEditCategoryIsFeatured(e.target.checked)}
                          />
                          Feature on Homepage Grid
                        </label>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button 
                          type="submit"
                          className="flex-1 bg-ink text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                        >
                          Save
                        </button>
                        <button 
                          type="button"
                          onClick={() => setSelectedCategory(null)}
                          className="bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Add New Category</h3>
                    <form onSubmit={handleAddCategory} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Eco Lifestyle"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        required
                      />
                      <button className="w-full bg-ink text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1">
                        <Plus size={14} /> Create Category
                      </button>
                    </form>
                  </>
                )}
              </div>

              {/* Categories list */}
              <div className="md:col-span-2 bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Categories List ({categories.length})</h3>
                <div className="divide-y divide-neutral-100 max-h-96 overflow-y-auto">
                  {categories.map((c) => (
                    <div key={c.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {c.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={c.image_url} 
                            alt={c.name} 
                            className="w-10 h-10 rounded-xl object-cover border border-neutral-200/50 shrink-0" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-dashed border-neutral-200 flex items-center justify-center text-neutral-400 shrink-0">
                            <ImageIcon size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-700 truncate">{c.name}</span>
                            {c.is_featured !== false && (
                              <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                                Featured
                              </span>
                            )}
                          </div>
                          {c.subcategories && (
                            <span className="text-[10px] text-neutral-400 truncate block max-w-xs md:max-w-md">
                              Subcategories: {c.subcategories}
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-400 font-mono block select-all">slug: {c.slug}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEditCategory(c)}
                          className="p-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50 rounded-xl text-neutral-500 hover:text-ink transition-all"
                          title="Edit Category Details"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-red-500 hover:text-red-700 transition-all"
                          title="Delete Category"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB: SETTINGS ==================== */}
          {activeTab === "settings" && (
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Global Website Settings</h3>
                <p className="text-xs text-neutral-400 mt-1">Configure site-wide parameters such as the catalogue file download link.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">Download Catalogue PDF Link / File Path</label>
                  <input
                    type="text"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-ink"
                    placeholder="/catalogue.pdf or https://..."
                    value={settings.catalogue_url || ""}
                    onChange={(e) => setSettings({ ...settings, catalogue_url: e.target.value })}
                    required
                  />
                  <p className="text-[10px] text-neutral-400">
                    This path determines where users are directed when clicking the "Download Catalogue" buttons on the storefront.
                  </p>
                </div>

                <div className="border-t border-neutral-100 pt-4 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-ink text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all shadow-sm"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          )}


          {/* ==================== TAB: EMPLOYEES (Admin Only) ==================== */}
          {activeTab === "team" && userRole === "admin" && (
            <div className="space-y-6">
              {/* Bulk Results Modal */}
              {bulkResults && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-4 mb-6 relative">
                  <button 
                    onClick={() => setBulkResults(null)}
                    className="absolute top-4 right-4 text-emerald-600 hover:text-emerald-800"
                  >
                    <XCircle size={20} />
                  </button>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-800">
                    Successfully Generated Employee Credentials
                  </h3>
                  <p className="text-xs text-emerald-700">Please copy these credentials and share them securely with the employees. Passwords cannot be viewed again later.</p>
                  
                  <div className="overflow-x-auto bg-white rounded-xl border border-emerald-100 shadow-sm max-h-96">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-emerald-50 border-b border-emerald-100">
                        <tr>
                          <th className="py-3 px-4 text-emerald-800 font-bold uppercase">Name</th>
                          <th className="py-3 px-4 text-emerald-800 font-bold uppercase">Login ID (Username)</th>
                          <th className="py-3 px-4 text-emerald-800 font-bold uppercase">Password</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {bulkResults.map((emp, idx) => (
                          <tr key={idx}>
                            <td className="py-3 px-4 text-emerald-900 font-medium">{emp.name}</td>
                            <td className="py-3 px-4 font-mono text-emerald-700 select-all">{emp.username}</td>
                            <td className="py-3 px-4 font-mono text-emerald-700 select-all">{emp.password}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Employee Actions Sidebar */}
                <div className="space-y-6 h-fit">
                  {/* Bulk Upload */}
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Bulk Add (Excel)</h3>
                    <p className="text-[10px] text-neutral-500">Upload an .xlsx file with a 'Name' column to auto-generate IDs and passwords.</p>
                    <label className="w-full flex items-center justify-center gap-1.5 bg-white border border-neutral-200 text-neutral-600 hover:text-ink hover:border-neutral-300 text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-xl transition-all shadow-sm cursor-pointer">
                      <Download size={14} className="rotate-180" /> Upload Excel
                      <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleBulkUpload} />
                    </label>
                  </div>

                  {/* Create Manual User */}
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Add Employee Manually</h3>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          placeholder="Employee Name"
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Login Username</label>
                        <input
                          type="text"
                          placeholder="aditya_fuzo"
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-ink"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Role Permission</label>
                        <select
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-ink font-semibold"
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                        >
                          <option value="employee">Employee (Inventory & Enquiries)</option>
                          <option value="admin">Administrator (Full Access)</option>
                        </select>
                      </div>

                      <button className="w-full bg-ink text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5">
                        <UserPlus size={14} /> Create Account
                      </button>
                    </form>
                  </div>
                </div>

                {/* Users list / Spreadsheet view */}
                <div className="md:col-span-2 bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[700px]">
                  <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Employees Directory ({teamUsers.length})</h3>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-neutral-50/70 border-b border-neutral-200/60 text-[10px] font-bold uppercase tracking-widest text-neutral-400 sticky top-0 z-10">
                        <tr>
                          <th className="py-3 px-6">Name</th>
                          <th className="py-3 px-6">Login ID</th>
                          <th className="py-3 px-6">Password</th>
                          <th className="py-3 px-6">Role</th>
                          <th className="py-3 px-6">Created</th>
                          <th className="py-3 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {teamUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-neutral-50/40 transition-colors">
                            <td className="py-4 px-6 font-semibold text-neutral-800">{user.name || "—"}</td>
                            <td className="py-4 px-6 font-mono font-medium text-neutral-600">{user.username}</td>
                            <td className="py-4 px-6 font-mono font-medium text-neutral-600">{user.plaintext_password || "••••••••"}</td>
                            <td className="py-4 px-6">
                              <span 
                                className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                  user.role === "admin" 
                                    ? "bg-purple-50 text-purple-600 border-purple-100" 
                                    : "bg-blue-50 text-blue-600 border-blue-100"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-neutral-500 font-medium">
                              {new Date(user.created_at).toLocaleDateString("en-IN")}
                            </td>
                            <td className="py-4 px-6 text-right">
                              {user.username !== currentUser ? (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-red-100 transition-colors"
                                >
                                  <Trash2 size={11} /> Remove
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg inline-block">
                                  You
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
