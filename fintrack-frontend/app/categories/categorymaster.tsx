
"use client";

import { useEffect, useState, type FormEvent } from "react";

type CategoryType = "INCOME" | "EXPENSE";

interface Category {
  categoryId: number;
  userId: number;
  categoryName: string;
  categoryType: CategoryType;
  active: boolean;
}

const API_URL = "http://localhost:8080/api/categories";

// Development साठी User ID 1 वापरला आहे.
// पुढे authenticated user session जोडल्यावर हा बदलू.
const USER_ID = 1;

export default function CategoryMaster() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] =
    useState<CategoryType>("INCOME");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}?userId=${USER_ID}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Categories load करता आल्या नाहीत.");
      }

      const data: Category[] = await response.json();
      setCategories(data);
    } catch {
      setError(
        "Backend शी connection होत नाही. Spring Boot चालू आहे का तपासा."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  function resetForm() {
    setCategoryName("");
    setCategoryType("INCOME");
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      setError("Category Name आवश्यक आहे.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = editingId !== null;

      const url = isEditing
        ? `${API_URL}/${editingId}?userId=${USER_ID}`
        : `${API_URL}?userId=${USER_ID}`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryName: trimmedName,
          categoryType,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || "Category save करता आली नाही."
        );
      }

      setMessage(
        isEditing
          ? "Category successfully updated!"
          : "Category successfully added!"
      );

      resetForm();
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "काहीतरी चूक झाली."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(category: Category) {
    setEditingId(category.categoryId);
    setCategoryName(category.categoryName);
    setCategoryType(category.categoryType);
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleStatusChange(category: Category) {
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${category.categoryId}/status?userId=${USER_ID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: !category.active,
          }),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || "Category status बदलता आला नाही."
        );
      }

      setMessage(
        `Category ${!category.active ? "activated" : "deactivated"} successfully.`
      );

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Category status बदलता आला नाही."
      );
    }
  }

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.categoryName
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesType =
      filterType === "ALL" || category.categoryType === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
              FinTrack Pro
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Category Master
            </h1>

            <p className="mt-2 text-slate-600">
              Manage your income and expense categories.
            </p>
          </div>

          <a
            href="/dashboard"
            className="inline-flex w-fit items-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Dashboard
          </a>
        </div>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            {editingId !== null ? "Edit Category" : "Add New Category"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="categoryName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Category Name *
              </label>

              <input
                id="categoryName"
                type="text"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Enter category name"
                maxLength={100}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label
                htmlFor="categoryType"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Category Type *
              </label>

              <select
                id="categoryType"
                value={categoryType}
                onChange={(event) =>
                  setCategoryType(event.target.value as CategoryType)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700 md:col-span-2"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 md:col-span-2"
              >
                {message}
              </p>
            )}

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Category"
                    : "+ Add Category"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Category List
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Total categories: {filteredCategories.length}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search category..."
                aria-label="Search category"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <select
                value={filterType}
                onChange={(event) => setFilterType(event.target.value)}
                aria-label="Filter category type"
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Categories</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="py-10 text-center text-slate-500">
              Loading categories...
            </p>
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
              <p className="font-semibold text-slate-700">
                No categories found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Add a new category using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
                    <th className="px-4 py-4">ID</th>
                    <th className="px-4 py-4">Category Name</th>
                    <th className="px-4 py-4">Type</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((category) => (
                    <tr
                      key={category.categoryId}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 text-slate-600">
                        {category.categoryId}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {category.categoryName}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            category.categoryType === "INCOME"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {category.categoryType}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            category.active
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {category.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(category)}
                            className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleStatusChange(category)}
                            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                              category.active
                                ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {category.active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}