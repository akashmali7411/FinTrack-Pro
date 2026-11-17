
package com.fintrack.fintrack_backend.repository;

import com.fintrack.fintrack_backend.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    // All income entries for a user
    List<Income> findByUserIdOrderByIncomeDateDescIncomeIdDesc(Long userId);

    // Find income belonging to a specific user
    Optional<Income> findByIncomeIdAndUserId(Long incomeId, Long userId);

    // Total income for a user
    @Query("""
        SELECT COALESCE(SUM(i.amount), 0)
        FROM Income i
        WHERE i.userId = :userId
    """)
    BigDecimal getTotalIncomeByUserId(
            @Param("userId") Long userId
    );

    // Current month's income
    @Query("""
        SELECT COALESCE(SUM(i.amount), 0)
        FROM Income i
        WHERE i.userId = :userId
          AND i.incomeDate >= :startDate
          AND i.incomeDate < :nextMonthStart
    """)
    BigDecimal getMonthlyIncome(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("nextMonthStart") LocalDate nextMonthStart
    );
}
