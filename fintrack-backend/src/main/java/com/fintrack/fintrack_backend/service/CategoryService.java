package com.fintrack.fintrack_backend.service;

import com.fintrack.fintrack_backend.entity.Category;
import com.fintrack.fintrack_backend.entity.Category.CategoryType;
import com.fintrack.fintrack_backend.repository.CategoryRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getCategories(Long userId, CategoryType type) {
        validateUserId(userId);

        if (type != null) {
            return categoryRepository
                    .findByUserIdAndCategoryTypeOrderByCategoryNameAsc(
                            userId, type
                    );
        }

        return categoryRepository
                .findByUserIdOrderByCategoryNameAsc(userId);
    }

    @Transactional
    public Category addCategory(
            Long userId,
            String categoryName,
            CategoryType type) {

        validateUserId(userId);
        validateCategory(categoryName, type);

        String name = categoryName.trim();

        if (categoryRepository
                .existsByUserIdAndCategoryNameIgnoreCaseAndCategoryType(
                        userId, name, type)) {
            throw new IllegalArgumentException(
                    "This category already exists."
            );
        }

        Category category = new Category();
        category.setUserId(userId);
        category.setCategoryName(name);
        category.setCategoryType(type);
        category.setActive(true);

        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(
            Long userId,
            Long categoryId,
            String categoryName,
            CategoryType type) {

        validateUserId(userId);
        validateCategory(categoryName, type);

        Category category = categoryRepository
                .findByCategoryIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Category not found."
                ));

        String name = categoryName.trim();

        if (categoryRepository
                .existsByUserIdAndCategoryNameIgnoreCaseAndCategoryTypeAndCategoryIdNot(
                        userId, name, type, categoryId)) {
            throw new IllegalArgumentException(
                    "This category already exists."
            );
        }

        category.setCategoryName(name);
        category.setCategoryType(type);

        return categoryRepository.save(category);
    }

    @Transactional
    public Category changeStatus(
            Long userId,
            Long categoryId,
            boolean active) {

        validateUserId(userId);

        Category category = categoryRepository
                .findByCategoryIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Category not found."
                ));

        category.setActive(active);

        return categoryRepository.save(category);
    }

    private void validateUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID.");
        }
    }

    private void validateCategory(
            String categoryName,
            CategoryType type) {

        if (categoryName == null || categoryName.isBlank()) {
            throw new IllegalArgumentException(
                    "Category name is required."
            );
        }

        if (categoryName.trim().length() > 100) {
            throw new IllegalArgumentException(
                    "Category name cannot exceed 100 characters."
            );
        }

        if (type == null) {
            throw new IllegalArgumentException(
                    "Category type is required."
            );
        }
    }
}