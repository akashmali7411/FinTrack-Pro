
package com.fintrack.fintrack_backend.service;

import com.fintrack.fintrack_backend.dto.IncomeRequest;
import com.fintrack.fintrack_backend.entity.Category;
import com.fintrack.fintrack_backend.entity.Category.CategoryType;
import com.fintrack.fintrack_backend.entity.Income;
import com.fintrack.fintrack_backend.repository.CategoryRepository;
import com.fintrack.fintrack_backend.repository.IncomeRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;

    public IncomeService(
            IncomeRepository incomeRepository,
            CategoryRepository categoryRepository) {
        this.incomeRepository = incomeRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public Income createIncome(IncomeRequest request) {
        validateCategory(request.getUserId(), request.getCategoryId());

        Income income = new Income();
        copyRequestToIncome(request, income);

        return incomeRepository.save(income);
    }

    @Transactional(readOnly = true)
    public List<Income> getIncomes(Long userId) {
        validateUserId(userId);

        return incomeRepository
                .findByUserIdOrderByIncomeDateDescIncomeIdDesc(userId);
    }

    @Transactional
    public Income updateIncome(Long incomeId, IncomeRequest request) {
        validateUserId(request.getUserId());

        Income income = incomeRepository
                .findByIncomeIdAndUserId(incomeId, request.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Income not found"));

        validateCategory(request.getUserId(), request.getCategoryId());
        copyRequestToIncome(request, income);

        return incomeRepository.save(income);
    }

    @Transactional
    public void deleteIncome(Long incomeId, Long userId) {
        validateUserId(userId);

        Income income = incomeRepository
                .findByIncomeIdAndUserId(incomeId, userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Income not found"));

        incomeRepository.delete(income);
    }

    private void validateUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Valid user ID is required");
        }
    }

    private void validateCategory(Long userId, Long categoryId) {
        validateUserId(userId);

        Category category = categoryRepository
                .findByCategoryIdAndUserId(categoryId, userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Category not found for this user"));

        if (!category.isActive()) {
            throw new IllegalArgumentException("Category is inactive");
        }

        if (category.getCategoryType() != CategoryType.INCOME) {
            throw new IllegalArgumentException(
                    "Please select an income category");
        }
    }

    private void copyRequestToIncome(
            IncomeRequest request,
            Income income) {

        income.setUserId(request.getUserId());
        income.setCategoryId(request.getCategoryId());
        income.setIncomeName(request.getIncomeName().trim());
        income.setAmount(request.getAmount());
        income.setIncomeDate(request.getIncomeDate());
        income.setPaymentMode(request.getPaymentMode());
        income.setDescription(
                request.getDescription() == null
                        ? null
                        : request.getDescription().trim()
        );
    }
}
