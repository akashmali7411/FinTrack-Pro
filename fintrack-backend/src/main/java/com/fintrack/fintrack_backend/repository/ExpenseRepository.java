
package com.fintrack.fintrack_backend.repository;

import com.fintrack.fintrack_backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserIdOrderByExpenseDateDescExpenseIdDesc(Long userId);

    Optional<Expense> findByExpenseIdAndUserId(Long expenseId, Long userId);

    // Total expenses for a user
    @Query("""
        SELECT COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.userId = :userId
    """)
    BigDecimal getTotalExpensesByUserId(
            @Param("userId") Long userId
    );

    // Today's expenses
    @Query("""
        SELECT COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.userId = :userId
          AND e.expenseDate = :today
    """)
    BigDecimal getTodayExpenses(
            @Param("userId") Long userId,
            @Param("today") LocalDate today
    );

    // Current month's expenses
    @Query("""
        SELECT COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.userId = :userId
          AND e.expenseDate >= :startDate
          AND e.expenseDate < :nextMonthStart
    """)
    BigDecimal getMonthlyExpenses(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("nextMonthStart") LocalDate nextMonthStart
    );
}
