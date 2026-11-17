package com.fintrack.fintrack_backend.service;

import com.fintrack.fintrack_backend.dto.ExpenseRequest;
import com.fintrack.fintrack_backend.entity.Category;
import com.fintrack.fintrack_backend.entity.Category.CategoryType;
import com.fintrack.fintrack_backend.entity.Expense;
import com.fintrack.fintrack_backend.repository.CategoryRepository;
import com.fintrack.fintrack_backend.repository.ExpenseRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            CategoryRepository categoryRepository) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public Expense createExpense(ExpenseRequest request) {

        validateCategory(request.getUserId(), request.getCategoryId());

        Expense expense = new Expense();
        copyRequestToExpense(request, expense);

        return expenseRepository.save(expense);
    }

    @Transactional(readOnly = true)
    public List<Expense> getExpenses(Long userId) {

        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Valid user ID is required");
        }

        return expenseRepository
                .findByUserIdOrderByExpenseDateDescExpenseIdDesc(userId);
    }

    @Transactional
    public Expense updateExpense(Long expenseId, ExpenseRequest request) {

        Expense expense = expenseRepository
                .findByExpenseIdAndUserId(expenseId, request.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Expense not found"));

        validateCategory(request.getUserId(), request.getCategoryId());

        copyRequestToExpense(request, expense);

        return expenseRepository.save(expense);
    }

    @Transactional
    public void deleteExpense(Long expenseId, Long userId) {

        Expense expense = expenseRepository
                .findByExpenseIdAndUserId(expenseId, userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Expense not found"));

        expenseRepository.delete(expense);
    }

    private void validateCategory(Long userId, Long categoryId) {

        Category category = categoryRepository
                .findByCategoryIdAndUserId(categoryId, userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Category not found for this user"));

        if (!category.isActive()) {
            throw new IllegalArgumentException("Category is inactive");
        }

        if (category.getCategoryType() != CategoryType.EXPENSE) {
            throw new IllegalArgumentException(
                    "Please select an expense category");
        }
    }

    private void copyRequestToExpense(
            ExpenseRequest request,
            Expense expense) {

        expense.setUserId(request.getUserId());
        expense.setCategoryId(request.getCategoryId());
        expense.setExpenseName(request.getExpenseName().trim());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setPaymentMode(request.getPaymentMode());
        expense.setDescription(
                request.getDescription() == null
                        ? null
                        : request.getDescription().trim()
        );
    }
}