"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { User, adminCreateUser, adminUpdateUser, adminDeleteUser } from "@/lib/api";
import { Upload, Plus, Save, Trash2, Loader2, PlusCircle } from "lucide-react";

interface EmployeeGridProps {
  users: User[];
  onRefresh: () => void;
}

// Helper to determine dynamic columns from all users
function getDynamicColumns(users: User[]): string[] {
  const cols = new Set<string>();
  users.forEach((u) => {
    if (u.extra_details) {
      Object.keys(u.extra_details).forEach((k) => cols.add(k));
    }
  });
  return Array.from(cols);
}

export default function EmployeeGrid({ users, onRefresh }: EmployeeGridProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  useEffect(() => {
    // Initialize rows from existing users
    const initialCols = getDynamicColumns(users);
    setDynamicColumns(initialCols);
    
    const formattedRows = users.map((u) => ({
      _id: u.id, // Internal ID to track existing
      _isNew: false,
      username: u.username,
      role: u.role,
      password: "", // Empty for existing users
      ...u.extra_details,
    }));
    setRows(formattedRows);
  }, [users]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      if (data.length > 0) {
        // Extract all headers from the parsed data
        const allHeaders = new Set<string>(dynamicColumns);
        
        const newRows = data.map((row: any) => {
          const newRow: any = { _id: Math.random(), _isNew: true, username: "", password: "", role: "employee" };
          Object.keys(row).forEach((key) => {
            const kLower = key.toLowerCase();
            if (kLower === "username") newRow.username = row[key];
            else if (kLower === "password") newRow.password = row[key];
            else if (kLower === "role") newRow.role = row[key].toLowerCase() === "admin" ? "admin" : "employee";
            else {
              allHeaders.add(key);
              newRow[key] = row[key];
            }
          });
          return newRow;
        });

        const updatedCols = Array.from(allHeaders).filter(c => !["username", "password", "role"].includes(c.toLowerCase()));
        setDynamicColumns(updatedCols);
        setRows([...rows, ...newRows]);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const handleAddRow = () => {
    setRows([...rows, { _id: Math.random(), _isNew: true, username: "", password: "", role: "employee" }]);
  };

  const handleAddColumn = () => {
    if (newColumnName.trim() && !dynamicColumns.includes(newColumnName.trim())) {
      setDynamicColumns([...dynamicColumns, newColumnName.trim()]);
      setNewColumnName("");
    }
  };

  const handleCellChange = (rowIndex: number, column: string, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex][column] = value;
    setRows(updatedRows);
  };

  const handleDeleteRow = async (rowIndex: number) => {
    const row = rows[rowIndex];
    if (!row._isNew) {
      if (!confirm("Are you sure you want to permanently delete this user?")) return;
      try {
        await adminDeleteUser(row._id);
      } catch (err) {
        alert("Failed to delete user. Cannot delete your own admin account.");
        return;
      }
    }
    const updated = [...rows];
    updated.splice(rowIndex, 1);
    setRows(updated);
    if (!row._isNew) onRefresh();
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const row of rows) {
        // Build extra_details
        const extra_details: any = {};
        dynamicColumns.forEach(col => {
          if (row[col] !== undefined && row[col] !== "") {
            extra_details[col] = row[col];
          }
        });

        if (row._isNew) {
          if (!row.username || !row.password) continue; // Skip incomplete new rows
          await adminCreateUser({
            username: row.username,
            password: row.password,
            role: row.role,
            extra_details
          });
        } else {
          // Update existing
          await adminUpdateUser(row._id, {
            username: row.username,
            password: row.password || undefined, // Only update if typed
            role: row.role,
            extra_details
          });
        }
      }
      onRefresh();
      alert("All changes saved successfully!");
    } catch (error: any) {
      alert(error.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const standardCols = ["username", "password", "role"];
  const allCols = [...standardCols, ...dynamicColumns];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm">
            <Upload size={14} />
            Upload Excel
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button onClick={handleAddRow} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all">
            <Plus size={14} /> Add Row
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-neutral-200 rounded-xl px-2 py-1">
            <input 
              type="text" 
              placeholder="New Column..." 
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="text-xs px-2 py-1 outline-none w-28 bg-transparent"
            />
            <button onClick={handleAddColumn} className="text-slate-500 hover:text-slate-900">
              <PlusCircle size={16} />
            </button>
          </div>
          
          <button onClick={handleSaveAll} disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save All
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-neutral-200">
            <tr>
              {allCols.map((col, i) => (
                <th key={col} className={`py-3 px-4 ${i === 0 ? "pl-6" : ""} font-semibold`}>
                  {col}
                  {col === "password" && <span className="text-neutral-400 lowercase ml-1 font-normal tracking-normal">(Leave blank to keep)</span>}
                </th>
              ))}
              <th className="py-3 px-4 w-10 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-700">
            {rows.map((row, rIndex) => (
              <tr key={row._id} className="hover:bg-slate-50/50 transition-colors">
                {allCols.map((col, cIndex) => (
                  <td key={col} className={`p-0 ${cIndex === 0 ? "pl-2" : ""}`}>
                    {col === "role" ? (
                      <select 
                        value={row[col]} 
                        onChange={(e) => handleCellChange(rIndex, col, e.target.value)}
                        className="w-full h-full py-3 px-4 bg-transparent outline-none focus:bg-blue-50/50 focus:ring-1 focus:ring-inset focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <input 
                        type={col === "password" && !row._isNew ? "password" : "text"}
                        value={row[col] || ""}
                        onChange={(e) => handleCellChange(rIndex, col, e.target.value)}
                        placeholder={col === "password" && !row._isNew ? "*******" : ""}
                        className="w-full h-full py-3 px-4 bg-transparent outline-none focus:bg-blue-50/50 focus:ring-1 focus:ring-inset focus:ring-blue-500 placeholder:text-neutral-300"
                      />
                    )}
                  </td>
                ))}
                <td className="py-2 px-4 text-center border-l border-neutral-100">
                  <button 
                    onClick={() => handleDeleteRow(rIndex)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors inline-flex"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={allCols.length + 1} className="py-12 text-center text-neutral-400 text-sm">
                  No employees found. Add a row or upload an Excel file.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
