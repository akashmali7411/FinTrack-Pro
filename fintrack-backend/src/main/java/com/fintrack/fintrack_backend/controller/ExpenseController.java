package com.fintrack.fintrack_backend.controller;

import com.fintrack.fintrack_backend.dto.ExpenseRequest;
import com.fintrack.fintrack_backend.entity.Expense;
import com.fintrack.fintrack_backend.service.ExpenseService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<?> createExpense(
            @Valid @RequestBody ExpenseRequest request) {

        try {
            Expense expense = expenseService.createExpense(request);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Expense saved successfully",
                            "expenseId", expense.getExpenseId(),
                            "userId", expense.getUserId(),
                            "categoryId", expense.getCategoryId(),
                            "expenseName", expense.getExpenseName(),
                            "amount", expense.getAmount(),
                            "expenseDate", expense.getExpenseDate(),
                            "paymentMode", expense.getPaymentMode(),
                            "description", expense.getDescription() == null
                                    ? ""
                                    : expense.getDescription()
                    ));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getExpenses(
            @RequestParam Long userId) {

        try {
            List<Expense> expenses = expenseService.getExpenses(userId);
            return ResponseEntity.ok(expenses);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<?> updateExpense(
            @PathVariable Long expenseId,
            @Valid @RequestBody ExpenseRequest request) {

        try {
            Expense expense = expenseService.updateExpense(
                    expenseId, request);

            return ResponseEntity.ok(Map.of(
                    "message", "Expense updated successfully",
                    "expenseId", expense.getExpenseId()
            ));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<?> deleteExpense(
            @PathVariable Long expenseId,
            @RequestParam Long userId) {

        try {
            expenseService.deleteExpense(expenseId, userId);

            return ResponseEntity.ok(
                    Map.of("message", "Expense deleted successfully"));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", ex.getMessage()));
        }
    }
}