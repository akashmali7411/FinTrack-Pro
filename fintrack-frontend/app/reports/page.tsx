"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Category = {
  categoryId: number;
  categoryName: string;
  categoryType: string;
  active?: boolean;
  status?: string;
};

type Expense = {
  expenseId: number;
  categoryId: number;
  expenseName: string;
  amount: number;
  expenseDate: string;
  paymentMode: string;
  description?: string;
};

const API = "http://localhost:8080/api";
const USER_ID = 1; // Testing user ID

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function money(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ExpenseReportPage() {
  // Empty initial state prevents Next.js prerendering from evaluating new Date().
  // Set today's local date after the component mounts in the browser.
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [categoryId, setCategoryId] = useState("ALL");
  const [applied, setApplied] = useState({
    fromDate: "",
    toDate: "",
    categoryId: "ALL",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentDate = today();
    setFromDate(currentDate);
    setToDate(currentDate);
    setApplied({
      fromDate: currentDate,
      toDate: currentDate,
      categoryId: "ALL",
    });
  }, []);

  useEffect(() => {
    async function loadReportData() {
      setLoading(true);
      setError("");

      try {
        const [categoryResponse, expenseResponse] = await Promise.all([
          fetch(`${API}/categories?userId=${USER_ID}`),
          fetch(`${API}/expenses?userId=${USER_ID}`),
        ]);

        if (!categoryResponse.ok) {
          throw new Error("Categories load zhale nahi. Backend running aahe ka check kara.");
        }
        if (!expenseResponse.ok) {
          throw new Error("Expenses load zhale nahi. Backend running aahe ka check kara.");
        }

        const categoryData = await categoryResponse.json();
        const expenseData = await expenseResponse.json();

        const categoryList: Category[] = Array.isArray(categoryData)
          ? categoryData
          : Array.isArray(categoryData?.content)
            ? categoryData.content
            : Array.isArray(categoryData?.data)
              ? categoryData.data
              : [];

        const expenseList: Expense[] = Array.isArray(expenseData)
          ? expenseData
          : Array.isArray(expenseData?.content)
            ? expenseData.content
            : Array.isArray(expenseData?.data)
              ? expenseData.data
              : [];

        setCategories(
          categoryList.filter(
            (category) => category.categoryType?.toUpperCase() === "EXPENSE"
          )
        );
        setExpenses(expenseList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Report data load karta ale nahi.");
      } finally {
        setLoading(false);
      }
    }

    loadReportData();
  }, []);

  const filteredExpenses = useMemo(() => {
    if (!applied.fromDate || !applied.toDate) return [];

    return expenses
      .filter((expense) => expense.expenseDate >= applied.fromDate)
      .filter((expense) => expense.expenseDate <= applied.toDate)
      .filter(
        (expense) =>
          applied.categoryId === "ALL" ||
          String(expense.categoryId) === applied.categoryId
      )
      .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
  }, [expenses, applied]);

  const grandTotal = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const categoryTotals = useMemo(() => {
    const totals = new Map<number, number>();

    filteredExpenses.forEach((expense) => {
      totals.set(
        expense.categoryId,
        (totals.get(expense.categoryId) || 0) + Number(expense.amount || 0)
      );
    });

    return Array.from(totals.entries()).map(([id, total]) => ({
      categoryName:
        categories.find((category) => category.categoryId === id)?.categoryName ??
        `Category #${id}`,
      total,
    }));
  }, [filteredExpenses, categories]);

  function getCategoryName(id: number): string {
    return (
      categories.find((category) => category.categoryId === id)?.categoryName ??
      `Category #${id}`
    );
  }

  function searchReport() {
    setError("");

    if (!fromDate || !toDate) {
      setError("Please select both From Date and To Date.");
      return;
    }

    if (fromDate > toDate) {
      setError("From Date cannot be later than To Date.");
      return;
    }

    setApplied({ fromDate, toDate, categoryId });
  }

  function resetFilters() {
    const currentDate = today();
    setFromDate(currentDate);
    setToDate(currentDate);
    setCategoryId("ALL");
    setApplied({
      fromDate: currentDate,
      toDate: currentDate,
      categoryId: "ALL",
    });
    setError("");
  }

  function exportExcel() {
    if (filteredExpenses.length === 0) return;

    const rows = filteredExpenses.map((expense) => ({
      Date: expense.expenseDate,
      Category: getCategoryName(expense.categoryId),
      "Expense Name": expense.expenseName,
      "Payment Mode": expense.paymentMode.replaceAll("_", " "),
      "Amount (INR)": Number(expense.amount),
      Description: expense.description || "",
    }));

    rows.push({
      Date: "",
      Category: "",
      "Expense Name": "",
      "Payment Mode": "Grand Total",
      "Amount (INR)": grandTotal,
      Description: "",
    });

    const workbook = XLSX.utils.book_new();
    const detailSheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, detailSheet, "Expense Report");

    const summarySheet = XLSX.utils.json_to_sheet(
      categoryTotals.map((item) => ({
        Category: item.categoryName,
        "Total (INR)": item.total,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Category Summary");

    XLSX.writeFile(
      workbook,
      `Expense_Report_${applied.fromDate}_to_${applied.toDate}.xlsx`
    );
  }

  function exportPDF() {
    if (filteredExpenses.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Expense Report", 14, 16);
    doc.setFontSize(10);
    doc.text(`From: ${applied.fromDate}   To: ${applied.toDate}`, 14, 23);
    doc.text(
      `Category: ${
        applied.categoryId === "ALL"
          ? "All Categories"
          : getCategoryName(Number(applied.categoryId))
      }`,
      14,
      29
    );

    autoTable(doc, {
      startY: 35,
      head: [["Date", "Category", "Expense Name", "Payment Mode", "Amount (INR)"]],
      body: filteredExpenses.map((expense) => [
        expense.expenseDate,
        getCategoryName(expense.categoryId),
        expense.expenseName,
        expense.paymentMode.replaceAll("_", " "),
        Number(expense.amount).toFixed(2),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [5, 150, 105] },
    });

    let finalY =
      (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ??
      40;
    finalY += 8;
    doc.setFontSize(11);
    doc.text(`Grand Total: ${money(grandTotal)}`, 14, finalY);

    if (categoryTotals.length > 0) {
      autoTable(doc, {
        startY: finalY + 7,
        head: [["Category", "Total (INR)"]],
        body: categoryTotals.map((item) => [
          item.categoryName,
          item.total.toFixed(2),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [5, 150, 105] },
      });
    }

    doc.save(
      `Expense_Report_${applied.fromDate}_to_${applied.toDate}.pdf`
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Expense Report</h1>
            <p className="mt-2 text-slate-600">
              Filter expenses by date and category, then export the report.
            </p>
          </div>
          <button
            type="button"
            onClick={() => (window.location.href = "/dashboard")}
            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            ← Back to Dashboard
          </button>
        </div>

        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="fromDate" className="mb-2 block text-sm font-semibold text-slate-700">
                From Date *
              </label>
              <input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="toDate" className="mb-2 block text-sm font-semibold text-slate-700">
                To Date *
              </label>
              <input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Categories</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={searchReport}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Search Report
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={exportPDF}
              disabled={filteredExpenses.length === 0}
              className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Export PDF
            </button>
            <button
              type="button"
              onClick={exportExcel}
              disabled={filteredExpenses.length === 0}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Export Excel
            </button>
          </div>
        </section>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Expenses</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{money(grandTotal)}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Records</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {filteredExpenses.length}
            </p>
          </div>
        </div>

        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Category-wise Summary
          </h2>
          {categoryTotals.length === 0 ? (
            <p className="text-slate-500">No category totals for the selected filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 text-sm text-slate-600">
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryTotals.map((item) => (
                    <tr key={item.categoryName} className="border-b border-slate-100">
                      <td className="px-4 py-3">{item.categoryName}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {money(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Expense Details</h2>
          {loading ? (
            <p className="py-6 text-center text-slate-500">Loading report...</p>
          ) : filteredExpenses.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-slate-500">
              No expenses found for the selected filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 text-sm text-slate-600">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Expense Name</th>
                    <th className="px-4 py-3">Payment Mode</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.expenseId} className="border-b border-slate-100 text-sm">
                      <td className="whitespace-nowrap px-4 py-4">{expense.expenseDate}</td>
                      <td className="px-4 py-4">{getCategoryName(expense.categoryId)}</td>
                      <td className="px-4 py-4">
                        {expense.expenseName}
                        {expense.description && (
                          <p className="mt-1 text-xs text-slate-500">{expense.description}</p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        {expense.paymentMode.replaceAll("_", " ")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-red-600">
                        {money(Number(expense.amount))}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={4} className="px-4 py-4 text-right">Grand Total</td>
                    <td className="px-4 py-4 text-right text-red-600">{money(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
