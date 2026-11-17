
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const USER_ID = 1;
const API_BASE_URL = "http://localhost:8080/api";

type DashboardSummary = {
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
  todayExpenses?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
};

function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || !Number.isFinite(value)) {
    return "₹0.00";
  }

  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DashboardPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Sidebar default collapsed as requested.
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState("User");

  // Initial server/client render same rahil.
  useEffect(() => {
    setMounted(true);

    // Logged-in user cha name/email localStorage madhun shodha.
    // Login page user object save karat asel tar tyatun suddha read karto.
    try {
      const directValue = [
        "userName", "username", "name", "userEmail", "email", "loggedInEmail"
      ]
        .map((key) => localStorage.getItem(key))
        .find((value) => Boolean(value && value.trim()));

      let profileValue = directValue?.trim() || "";
      const serializedUser = localStorage.getItem("user");
      if (!profileValue && serializedUser) {
        try {
          const user = JSON.parse(serializedUser) as {
            name?: string;
            userName?: string;
            username?: string;
            email?: string;
          };
          profileValue =
            user.name?.trim() ||
            user.userName?.trim() ||
            user.username?.trim() ||
            user.email?.trim() ||
            "";
        } catch {
          // 'user' JSON nasel tar tyakade durlaksha kara.
        }
      }

      if (profileValue) setDisplayName(profileValue);
    } catch (error) {
      console.warn("Unable to read logged-in user details:", error);
    }
  }, []);

  const loadDashboardSummary = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/dashboard/summary?userId=${USER_ID}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(`Dashboard API error: ${response.status}`);
      }

      const data: DashboardSummary = await response.json();
      setSummary(data);
    } catch (err) {
      console.error("Dashboard API error:", err);
      setError(
        "Dashboard data load zale nahi. Spring Boot backend ani API check kara."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      void loadDashboardSummary();
    }
  }, [mounted, loadDashboardSummary]);

  const monthlyIncome = summary?.monthlyIncome ?? 0;
  const monthlyExpenses = summary?.monthlyExpenses ?? 0;
  const maximum = Math.max(monthlyIncome, monthlyExpenses, 1);

  // Server ani first browser render donhi same.
  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-100">
        <header className="bg-slate-900 px-6 py-5 text-white sm:px-10">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-xl font-bold text-slate-900">
              F
            </div>
            <div>
              <h1 className="text-xl font-bold">FinTrack Pro</h1>
              <p className="text-sm text-slate-300">
                Personal Finance Management
              </p>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="rounded-2xl bg-white p-8 text-slate-500 shadow-sm">
            Loading dashboard...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 px-6 py-5 text-white sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarExpanded((current) => !current)}
              aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={sidebarExpanded}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-800 text-2xl text-white transition hover:bg-slate-700"
              title={sidebarExpanded ? "Collapse menu" : "Expand menu"}
            >
              {sidebarExpanded ? "×" : "☰"}
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-xl font-bold text-slate-900">
              F
            </div>

            <div>
              <h1 className="text-xl font-bold">FinTrack Pro</h1>
              <p className="text-sm text-slate-300">
                Personal Finance Management
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              className="flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-700"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 font-bold text-slate-900">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="max-w-36 truncate">{displayName}</span>
              <span aria-hidden="true" className="text-xs">{profileMenuOpen ? "▲" : "▼"}</span>
            </button>

            {profileMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 text-slate-800 shadow-xl"
              >
                <div className="border-b border-slate-100 px-4 py-2">
                  <p className="text-xs text-slate-500">Signed in as</p>
                  <p className="truncate font-semibold">{displayName}</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    try {
                      localStorage.removeItem("token");
                      localStorage.removeItem("authToken");
                    } catch (error) {
                      console.warn("Unable to clear login data:", error);
                    }
                    router.push("/login");
                  }}
                  className="w-full px-4 py-3 text-left font-semibold text-red-600 transition hover:bg-red-50"
                >
                  ↪ Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Collapsible sidebar: Quick Actions moved here. */}
      <aside
        className={`fixed bottom-0 left-0 top-[88px] z-40 border-r border-slate-200 bg-white shadow-lg transition-all duration-300 ${
          sidebarExpanded ? "w-64" : "w-[72px]"
        }`}
        aria-label="Main navigation"
      >
        <nav className="flex flex-col gap-2 p-3">
          {[
            { label: "Dashboard", icon: "🏠", path: "/dashboard" },
            { label: "Add Expense", icon: "💸", path: "/expenses" },
            { label: "Expense Report", icon: "📊", path: "/reports" },
            { label: "Add Income", icon: "💰", path: "/income" },
          ].map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => router.push(item.path)}
              title={!sidebarExpanded ? item.label : undefined}
              className={`flex min-h-12 items-center rounded-xl text-left font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 ${
                sidebarExpanded ? "gap-3 px-3" : "justify-center px-2"
              }`}
            >
              <span className="w-8 shrink-0 text-center text-xl" aria-hidden="true">
                {item.icon}
              </span>
              {sidebarExpanded && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <section className={`max-w-7xl px-5 py-10 sm:px-8 transition-all duration-300 ${
        sidebarExpanded ? "ml-64" : "ml-[72px]"
      }`}>
        {/* Welcome */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Welcome to FinTrack! 👋
            </h2>
            <p className="mt-2 text-slate-600">
              Manage your money and take control of your finances.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboardSummary()}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={() => void loadDashboardSummary()}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Balance
            </p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {loading ? "Loading..." : formatCurrency(summary?.totalBalance)}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Total income minus total expenses
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Income</p>
            <h3 className="mt-3 text-3xl font-bold text-emerald-600">
              {loading ? "Loading..." : formatCurrency(summary?.totalIncome)}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Your total recorded income
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Expenses</p>
            <h3 className="mt-3 text-3xl font-bold text-rose-600">
              {loading ? "Loading..." : formatCurrency(summary?.totalExpenses)}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Your total recorded expenses
            </p>
          </div>
        </div>

        {/* Monthly Overview */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-xl font-bold text-slate-900">
            Monthly Income vs Expenses
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Compare your income and expenses for the current month.
          </p>

          {loading ? (
            <div className="mt-8 flex h-64 items-center justify-center text-slate-500">
              Loading chart...
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-8 sm:gap-16">
              <div className="flex flex-col items-center">
                <div className="flex h-64 w-full max-w-48 items-end justify-center rounded-xl bg-slate-50 px-6">
                  <div
                    className="w-full rounded-t-xl bg-emerald-500 transition-all"
                    style={{
                      height:
                        monthlyIncome > 0
                          ? `${Math.max(5, (monthlyIncome / maximum) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Monthly Income
                </p>
                <p className="mt-1 text-lg font-bold text-emerald-600">
                  {formatCurrency(monthlyIncome)}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-64 w-full max-w-48 items-end justify-center rounded-xl bg-slate-50 px-6">
                  <div
                    className="w-full rounded-t-xl bg-rose-500 transition-all"
                    style={{
                      height:
                        monthlyExpenses > 0
                          ? `${Math.max(5, (monthlyExpenses / maximum) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Monthly Expenses
                </p>
                <p className="mt-1 text-lg font-bold text-rose-600">
                  {formatCurrency(monthlyExpenses)}
                </p>
              </div>
            </div>
          )}

          {!loading &&
            summary?.monthlyIncome === undefined &&
            summary?.monthlyExpenses === undefined && (
              <p className="mt-4 text-sm text-amber-700">
                Monthly values API madhye uplabdha nahit. Backend madhye
                monthlyIncome ani monthlyExpenses fields add karave lagtil.
              </p>
            )}
        </section>

        {/* Monthly Summary */}
        {summary && (
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summary.todayExpenses !== undefined && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Today&apos;s Expenses</p>
                <p className="mt-2 text-2xl font-bold text-rose-600">
                  {formatCurrency(summary.todayExpenses)}
                </p>
              </div>
            )}

            {summary.monthlyExpenses !== undefined && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  This Month&apos;s Expenses
                </p>
                <p className="mt-2 text-2xl font-bold text-rose-600">
                  {formatCurrency(summary.monthlyExpenses)}
                </p>
              </div>
            )}

            {summary.monthlyIncome !== undefined && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  This Month&apos;s Income
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {formatCurrency(summary.monthlyIncome)}
                </p>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
