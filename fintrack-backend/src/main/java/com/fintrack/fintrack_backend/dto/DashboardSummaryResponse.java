
package com.fintrack.fintrack_backend.dto;

import java.math.BigDecimal;

public class DashboardSummaryResponse {

    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal totalBalance;

    private BigDecimal todayExpenses;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpenses;

    public DashboardSummaryResponse(
            BigDecimal totalIncome,
            BigDecimal totalExpenses,
            BigDecimal totalBalance,
            BigDecimal todayExpenses,
            BigDecimal monthlyIncome,
            BigDecimal monthlyExpenses) {

        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.totalBalance = totalBalance;
        this.todayExpenses = todayExpenses;
        this.monthlyIncome = monthlyIncome;
        this.monthlyExpenses = monthlyExpenses;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public BigDecimal getTotalBalance() {
        return totalBalance;
    }

    public BigDecimal getTodayExpenses() {
        return todayExpenses;
    }

    public BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }

    public BigDecimal getMonthlyExpenses() {
        return monthlyExpenses;
    }
}
