
package com.fintrack.fintrack_backend.service;

import com.fintrack.fintrack_backend.dto.DashboardSummaryResponse;
import com.fintrack.fintrack_backend.repository.ExpenseRepository;
import com.fintrack.fintrack_backend.repository.IncomeRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;

@Service
public class DashboardService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;

    public DashboardService(
            IncomeRepository incomeRepository,
            ExpenseRepository expenseRepository) {

        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(Long userId) {

        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException(
                    "Valid user ID is required");
        }

        BigDecimal totalIncome =
                incomeRepository.getTotalIncomeByUserId(userId);

        BigDecimal totalExpenses =
                expenseRepository.getTotalExpensesByUserId(userId);

        LocalDate today = LocalDate.now();
        LocalDate monthStart = YearMonth.from(today).atDay(1);
        LocalDate nextMonthStart = YearMonth.from(today)
                .plusMonths(1)
                .atDay(1);

        BigDecimal todayExpenses =
                expenseRepository.getTodayExpenses(userId, today);

        BigDecimal monthlyIncome =
                incomeRepository.getMonthlyIncome(
                        userId, monthStart, nextMonthStart);

        BigDecimal monthlyExpenses =
                expenseRepository.getMonthlyExpenses(
                        userId, monthStart, nextMonthStart);

        // Safety fallback
        if (totalIncome == null) {
            totalIncome = BigDecimal.ZERO;
        }

        if (totalExpenses == null) {
            totalExpenses = BigDecimal.ZERO;
        }

        if (todayExpenses == null) {
            todayExpenses = BigDecimal.ZERO;
        }

        if (monthlyIncome == null) {
            monthlyIncome = BigDecimal.ZERO;
        }

        if (monthlyExpenses == null) {
            monthlyExpenses = BigDecimal.ZERO;
        }

        BigDecimal totalBalance = totalIncome.subtract(totalExpenses);

        return new DashboardSummaryResponse(
                totalIncome,
                totalExpenses,
                totalBalance,
                todayExpenses,
                monthlyIncome,
                monthlyExpenses
        );
    }
}
