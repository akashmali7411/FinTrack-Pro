"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Category = {
  categoryId: number;
  userId?: number;
  categoryName: string;
  categoryType: "INCOME" | "EXPENSE";
  active?: boolean;
  status?: string;
};

type Expense = {
  expenseId: number;
  userId: number;
  categoryId: number;
  expenseName: string;
  amount: number;
  expenseDate: string;
  paymentMode: string;
  description?: string;
  createdAt?: string;
};

const API_BASE_URL = "http://localhost:8080/api";
const USER_ID = 1;

function getTodayDate(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function unwrapList<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function ExpenseForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseDate, setExpenseDate] = useState(getTodayDate());
  const [categoryId, setCategoryId] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null);

  // Category modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryEditing, setCategoryEditing] = useState<Category | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [categorySuccess, setCategorySuccess] = useState("");

  async function loadCategories() {
    setLoadingCategories(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories?userId=${USER_ID}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load categories from backend.");
      const list = unwrapList<Category>(await response.json());
      setCategories(list.filter((c) => {
        const isExpense = c.categoryType?.toUpperCase() === "EXPENSE";
        const isActive = c.active === true || (c.active === undefined && c.status?.toUpperCase() === "ACTIVE");
        return isExpense && isActive;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Categories load hot nahit. Backend API URL check kara.");
    } finally {
      setLoadingCategories(false);
    }
  }

  async function loadExpenses() {
    setLoadingExpenses(true);
    try {
      const response = await fetch(`${API_BASE_URL}/expenses?userId=${USER_ID}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load expenses.");
      setExpenses(unwrapList<Expense>(await response.json()));
    } catch {
      setExpenses([]);
    } finally {
      setLoadingExpenses(false);
    }
  }

  useEffect(() => {
    void loadCategories();
    void loadExpenses();
  }, []);

  function resetForm() {
    setExpenseDate(getTodayDate());
    setCategoryId("");
    setExpenseName("");
    setAmount("");
    setPaymentMode("UPI");
    setDescription("");
    setEditingExpenseId(null);
  }

  function handleEdit(expense: Expense) {
    setMessage("");
    setError("");
    setEditingExpenseId(expense.expenseId);
    setExpenseDate(expense.expenseDate);
    setCategoryId(String(expense.categoryId));
    setExpenseName(expense.expenseName);
    setAmount(String(expense.amount));
    setPaymentMode(expense.paymentMode || "UPI");
    setDescription(expense.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(expense: Expense) {
    if (!window.confirm(`Delete expense "${expense.expenseName}"? This action cannot be undone.`)) return;
    setMessage("");
    setError("");
    setDeletingExpenseId(expense.expenseId);
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${expense.expenseId}?userId=${USER_ID}`, { method: "DELETE" });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || "Unable to delete expense. Check backend DELETE API.");
      if (editingExpenseId === expense.expenseId) resetForm();
      setMessage("Expense deleted successfully!");
      await loadExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete expense.");
    } finally {
      setDeletingExpenseId(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const numericAmount = Number(amount);
    if (!expenseDate) return setError("Please select the expense date.");
    if (!categoryId) return setError("Please select an expense category.");
    if (!expenseName.trim()) return setError("Please enter the expense name.");
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return setError("Please enter a valid amount greater than zero.");

    setSaving(true);
    try {
      const isEditing = editingExpenseId !== null;
      const response = await fetch(isEditing ? `${API_BASE_URL}/expenses/${editingExpenseId}` : `${API_BASE_URL}/expenses`, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: USER_ID,
          categoryId: Number(categoryId),
          expenseName: expenseName.trim(),
          amount: numericAmount,
          expenseDate,
          paymentMode,
          description: description.trim(),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || "Unable to save expense.");
      setMessage(isEditing ? "Expense updated successfully!" : "Expense saved successfully!");
      resetForm();
      await loadExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect to the backend.");
    } finally {
      setSaving(false);
    }
  }

  function openAddCategory() {
    setCategoryEditing(null);
    setCategoryNameInput("");
    setCategoryError("");
    setCategorySuccess("");
    setCategoryModalOpen(true);
  }

  function openEditCategory(category: Category) {
    setCategoryEditing(category);
    setCategoryNameInput(category.categoryName);
    setCategoryError("");
    setCategorySuccess("");
    setCategoryModalOpen(true);
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCategoryError("");
    setCategorySuccess("");
    const cleanName = categoryNameInput.trim();
    if (!cleanName) {
      setCategoryError("Please enter a category name.");
      return;
    }

    setCategorySaving(true);
    try {
      const isEditing = categoryEditing !== null;
      const url = isEditing
        ? `${API_BASE_URL}/categories/${categoryEditing.categoryId}?userId=${USER_ID}`
        : `${API_BASE_URL}/categories?userId=${USER_ID}`;
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: USER_ID,
          categoryName: cleanName,
          categoryType: "EXPENSE",
          active: true,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || `Unable to ${isEditing ? "update" : "add"} category. Verify the Category API.`);
      setCategorySuccess(isEditing ? "Category updated successfully." : "Category added successfully.");
      await loadCategories();
      if (!isEditing && result?.categoryId) setCategoryId(String(result.categoryId));
      window.setTimeout(() => setCategoryModalOpen(false), 500);
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : "Unable to save category.");
    } finally {
      setCategorySaving(false);
    }
  }

  async function deleteCategory() {
    if (!categoryEditing) return;
    if (!window.confirm(`Deactivate category "${categoryEditing.categoryName}"? Existing expenses will remain saved.`)) return;
    setCategoryError("");
    setCategorySuccess("");
    setCategorySaving(true);
    try {
      // Uses the existing category status endpoint; this is a soft delete.
      const response = await fetch(`${API_BASE_URL}/categories/${categoryEditing.categoryId}/status?userId=${USER_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false, status: "INACTIVE" }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || "Unable to deactivate category. Check the Category status API.");
      setCategories((current) => current.filter((c) => c.categoryId !== categoryEditing.categoryId));
      if (categoryId === String(categoryEditing.categoryId)) setCategoryId("");
      setCategorySuccess("Category deactivated successfully.");
      window.setTimeout(() => setCategoryModalOpen(false), 500);
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : "Unable to deactivate category.");
    } finally {
      setCategorySaving(false);
    }
  }

  const totalExpenses = expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0);

  function getCategoryName(id: number): string {
    return categories.find((item) => item.categoryId === id)?.categoryName || `Category #${id}`;
  }

  function formatAmount(value: number): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{editingExpenseId !== null ? "Edit Expense" : "Add Expense"}</h1>
            <p className="mt-2 text-slate-600">Record and manage your daily expenses.</p>
          </div>
          <button type="button" onClick={() => router.push("/dashboard")} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            ← Back to Dashboard
          </button>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Recorded Expenses</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{formatAmount(totalExpenses)}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Expense Records</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{expenses.length}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <div>
              <label htmlFor="expenseDate" className="mb-2 block text-sm font-semibold text-slate-700">Expense Date *</label>
              <input id="expenseDate" type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" />
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="categoryId" className="block text-sm font-semibold text-slate-700">Category *</label>
                <button type="button" onClick={openAddCategory} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">+ Add Category</button>
              </div>
              <select id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required disabled={loadingCategories} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:bg-slate-100">
                <option value="">{loadingCategories ? "Loading categories..." : "Select category"}</option>
                {categories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="expenseName" className="mb-2 block text-sm font-semibold text-slate-700">Expense Name *</label>
              <input id="expenseName" type="text" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} placeholder="e.g. Monthly groceries" maxLength={150} required className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" />
            </div>

            <div>
              <label htmlFor="amount" className="mb-2 block text-sm font-semibold text-slate-700">Amount (₹) *</label>
              <input id="amount" type="text" inputMode="decimal" autoComplete="off" value={amount} onChange={(e) => { if (/^\d*\.?\d{0,2}$/.test(e.target.value)) setAmount(e.target.value); }} placeholder="Enter amount" required className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" />
            </div>

            <div>
              <label htmlFor="paymentMode" className="mb-2 block text-sm font-semibold text-slate-700">Payment Mode *</label>
              <select id="paymentMode" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                <option value="CASH">Cash</option><option value="UPI">UPI</option><option value="DEBIT_CARD">Debit Card</option><option value="CREDIT_CARD">Credit Card</option><option value="NET_BANKING">Net Banking</option><option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
              <input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" maxLength={500} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" />
            </div>
          </div>

          {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-emerald-800">{message}</p>}
          {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-red-700"><p>{error}</p>{error.toLowerCase().includes("categor") && <button type="button" onClick={() => void loadCategories()} className="mt-2 font-semibold underline">Reload Categories</button>}</div>}

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
            <button type="submit" disabled={saving || loadingCategories || categories.length === 0} className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? (editingExpenseId !== null ? "Updating..." : "Saving...") : (editingExpenseId !== null ? "Update Expense" : "Save Expense")}</button>
            <button type="button" onClick={() => { resetForm(); setMessage(""); setError(""); }} disabled={saving} className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Reset</button>
            {editingExpenseId !== null && <button type="button" onClick={() => { resetForm(); setMessage(""); setError(""); }} disabled={saving} className="rounded-xl border border-amber-300 px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50">Cancel Edit</button>}
            <button type="button" onClick={() => { setError(""); void loadCategories(); void loadExpenses(); }} disabled={loadingCategories || loadingExpenses} className="rounded-xl border border-emerald-200 px-6 py-3 font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">Refresh Data</button>
          </div>
        </form>

        <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-xl font-bold text-slate-900">Expense History</h2><p className="mt-1 text-sm text-slate-500">Your recorded expenses.</p></div>
            <button type="button" onClick={() => void loadExpenses()} disabled={loadingExpenses} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{loadingExpenses ? "Loading..." : "Refresh List"}</button>
          </div>
          {loadingExpenses ? <p className="py-6 text-center text-slate-500">Loading expenses...</p> : expenses.length === 0 ? <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-slate-500">No expenses found. Add your first expense using the form above.</p> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[750px] border-collapse text-left">
              <thead><tr className="bg-slate-50 text-sm text-slate-600"><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Expense Name</th><th className="px-4 py-3 font-semibold">Payment Mode</th><th className="px-4 py-3 text-right font-semibold">Amount</th><th className="px-4 py-3 text-center font-semibold">Actions</th></tr></thead>
              <tbody>{[...expenses].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()).map((expense) => (
                <tr key={expense.expenseId} className="border-b border-slate-100 text-sm last:border-0">
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">{expense.expenseDate}</td>
                  <td className="px-4 py-4 font-medium text-slate-800">{getCategoryName(expense.categoryId)}</td>
                  <td className="px-4 py-4"><p className="font-semibold text-slate-800">{expense.expenseName}</p>{expense.description && <p className="mt-1 max-w-xs truncate text-xs text-slate-500">{expense.description}</p>}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">{expense.paymentMode.replaceAll("_", " ")}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-red-600">{formatAmount(Number(expense.amount))}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-center"><div className="flex justify-center gap-2">
                    <button type="button" onClick={() => handleEdit(expense)} disabled={saving || deletingExpenseId !== null} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50">Edit</button>
                    <button type="button" onClick={() => void handleDelete(expense)} disabled={deletingExpenseId === expense.expenseId || saving} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">{deletingExpenseId === expense.expenseId ? "Deleting..." : "Delete"}</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </section>
      </section>

      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="category-modal-title" onMouseDown={(e) => { if (e.target === e.currentTarget && !categorySaving) setCategoryModalOpen(false); }}>
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="category-modal-title" className="text-xl font-bold text-slate-900">{categoryEditing ? "Edit Expense Category" : "Add Expense Category"}</h2>
                <p className="mt-1 text-sm text-slate-500">{categoryEditing ? "Update the selected category name." : "Create and manage your expense categories here."}</p>
              </div>
              <button type="button" onClick={() => { setCategoryModalOpen(false); setCategoryEditing(null); }} disabled={categorySaving} aria-label="Close" className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100">×</button>
            </div>

            <form onSubmit={saveCategory} className="space-y-3">
              <div>
                <label htmlFor="categoryNameInput" className="mb-2 block text-sm font-semibold text-slate-700">{categoryEditing ? "Category Name *" : "New Category Name *"}</label>
                <input id="categoryNameInput" value={categoryNameInput} onChange={(e) => setCategoryNameInput(e.target.value)} maxLength={100} required placeholder="e.g. Groceries, Milk, Travel" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" />
              </div>
              {categoryError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{categoryError}</p>}
              {categorySuccess && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{categorySuccess}</p>}
              <div className="flex flex-wrap justify-end gap-2">
                {categoryEditing && <button type="button" onClick={() => { setCategoryEditing(null); setCategoryNameInput(""); setCategoryError(""); setCategorySuccess(""); }} disabled={categorySaving} className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50">Cancel Edit</button>}
                <button type="button" onClick={() => { setCategoryModalOpen(false); setCategoryEditing(null); }} disabled={categorySaving} className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50">Close</button>
                <button type="submit" disabled={categorySaving} className="rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{categorySaving ? "Saving..." : categoryEditing ? "Update Category" : "Save Category"}</button>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div><h3 className="font-bold text-slate-900">Existing Categories</h3><p className="text-xs text-slate-500">Edit or deactivate any category below.</p></div>
                <button type="button" onClick={() => void loadCategories()} disabled={loadingCategories || categorySaving} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Refresh</button>
              </div>
              {loadingCategories ? <p className="py-4 text-center text-sm text-slate-500">Loading categories...</p> : categories.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">No active expense categories yet.</p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {categories.map((category) => (
                    <div key={category.categoryId} className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${categoryEditing?.categoryId === category.categoryId ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                      <span className="min-w-0 break-words text-sm font-medium text-slate-800">{category.categoryName}</span>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={() => openEditCategory(category)} disabled={categorySaving} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50">Edit</button>
                        <button type="button" onClick={async () => {
                          setCategoryEditing(category);
                          setCategoryError("");
                          setCategorySuccess("");
                          if (!window.confirm(`Deactivate category "${category.categoryName}"? Existing expenses will remain saved.`)) return;
                          setCategorySaving(true);
                          try {
                            const response = await fetch(`${API_BASE_URL}/categories/${category.categoryId}/status?userId=${USER_ID}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ active: false }),
                            });
                            const result = await response.json().catch(() => null);
                            if (!response.ok) throw new Error(result?.message || "Unable to deactivate category.");
                            setCategories((current) => current.filter((item) => item.categoryId !== category.categoryId));
                            if (categoryId === String(category.categoryId)) setCategoryId("");
                            if (categoryEditing?.categoryId === category.categoryId) {
                              setCategoryEditing(null);
                              setCategoryNameInput("");
                            }
                            setCategorySuccess(`"${category.categoryName}" deactivated successfully.`);
                          } catch (err) {
                            setCategoryError(err instanceof Error ? err.message : "Unable to deactivate category.");
                          } finally {
                            setCategorySaving(false);
                          }
                        }} disabled={categorySaving} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
