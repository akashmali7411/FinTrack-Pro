
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8080/api";
const USER_ID = 1;

type Income = {
  incomeId?: number;
  incomeName: string;
  amount: number;
  incomeDate: string;
  categoryId: number;
  paymentMode: string;
  description?: string;
};

type Category = {
  categoryId: number;
  categoryName: string;
};

const paymentModes = [
  "UPI",
  "CASH",
  "DEBIT_CARD",
  "CREDIT_CARD",
  "NET_BANKING",
  "BANK_TRANSFER",
  "OTHER",
];

export default function IncomePage() {
  const router = useRouter();

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    incomeName: "",
    amount: "",
    incomeDate: new Date().toISOString().slice(0, 10),
    categoryId: "",
    paymentMode: "UPI",
    description: "",
  });

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [incomeResponse, categoryResponse] = await Promise.all([
        fetch(`${API_URL}/incomes?userId=${USER_ID}`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/categories?userId=${USER_ID}`, {
          cache: "no-store",
        }),
      ]);

      if (!incomeResponse.ok) {
        throw new Error(`Income API error: ${incomeResponse.status}`);
      }

      if (!categoryResponse.ok) {
        throw new Error(
          `Category API error: ${categoryResponse.status}`
        );
      }

      const incomeData = await incomeResponse.json();
      const categoryData = await categoryResponse.json();

      setIncomes(Array.isArray(incomeData) ? incomeData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (e) {
      console.error(e);
      setError(
        "Data load zale nahi. Backend chalu aahe ka ani API endpoint check kara."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function updateField(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (
      !form.incomeName.trim() ||
      !form.amount ||
      Number(form.amount) <= 0 ||
      !form.incomeDate ||
      !form.categoryId
    ) {
      setError("Kripaya sarv required fields yogya bhar.");
      return;
    }

    const payload = {
      userId: USER_ID,
      incomeName: form.incomeName.trim(),
      amount: Number(form.amount),
      incomeDate: form.incomeDate,
      categoryId: Number(form.categoryId),
      paymentMode: form.paymentMode,
      description: form.description.trim(),
    };

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/incomes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Save failed: ${response.status}`);
      }

      setMessage("Income successfully save zala!");

      setForm({
        incomeName: "",
        amount: "",
        incomeDate: new Date().toISOString().slice(0, 10),
        categoryId: "",
        paymentMode: "UPI",
        description: "",
      });

      await loadData();
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? `Income save zale nahi: ${e.message}`
          : "Income save zale nahi. Backend API check kara."
      );
    } finally {
      setSaving(false);
    }
  }

  const totalIncome = incomes.reduce(
    (total, income) => total + Number(income.amount || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              💰 Income Management
            </h1>
            <p className="mt-2 text-slate-600">
              Record and manage your income.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="mb-6 rounded-2xl bg-emerald-600 p-6 text-white shadow-sm">
          <p className="text-sm font-medium text-emerald-100">
            Total Recorded Income
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            ₹
            {totalIncome.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h2>
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Add New Income
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="incomeName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Income Name *
                </label>
                <input
                  id="incomeName"
                  name="incomeName"
                  value={form.incomeName}
                  onChange={updateField}
                  placeholder="e.g. Monthly Salary"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Amount (₹) *
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={updateField}
                  placeholder="Enter amount"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="incomeDate"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Income Date *
                </label>
                <input
                  id="incomeDate"
                  name="incomeDate"
                  type="date"
                  value={form.incomeDate}
                  onChange={updateField}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="categoryId"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={updateField}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.categoryName}
                    </option>
                  ))}
                </select>

                {categories.length === 0 && !loading && (
                  <p className="mt-2 text-sm text-amber-700">
                    Category available nahi. Category API ani userId check kara.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="paymentMode"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Payment Mode *
                </label>
                <select
                  id="paymentMode"
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={updateField}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500"
                >
                  {paymentModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  rows={3}
                  placeholder="Optional details"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving || categories.length === 0}
                className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Income"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setForm({
                    incomeName: "",
                    amount: "",
                    incomeDate: new Date().toISOString().slice(0, 10),
                    categoryId: "",
                    paymentMode: "UPI",
                    description: "",
                  })
                }
                className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">
              Income History
            </h2>
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-slate-500">
              Loading income records...
            </p>
          ) : incomes.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              Income records nahi. Varil form vaprun pahili income add kara.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b bg-slate-50 text-sm text-slate-600">
                    <th className="px-4 py-3">Income Name</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment Mode</th>
                    <th className="px-4 py-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((income, index) => (
                    <tr
                      key={income.incomeId ?? index}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-medium text-slate-800">
                        {income.incomeName}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {income.incomeDate}
                      </td>
                      <td className="px-4 py-4 font-semibold text-emerald-700">
                        {Number(income.amount).toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {income.paymentMode?.replaceAll("_", " ")}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {income.description || "—"}
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
