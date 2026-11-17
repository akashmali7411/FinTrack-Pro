package com.fintrack.fintrack_backend.repository;

import com.fintrack.fintrack_backend.entity.Category;
import com.fintrack.fintrack_backend.entity.Category.CategoryType;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository
        extends JpaRepository<Category, Long> {

    List<Category> findByUserIdOrderByCategoryNameAsc(Long userId);

    List<Category> findByUserIdAndCategoryTypeOrderByCategoryNameAsc(
            Long userId,
            CategoryType categoryType
    );

    Optional<Category> findByCategoryIdAndUserId(
            Long categoryId,
            Long userId
    );

    boolean existsByUserIdAndCategoryNameIgnoreCaseAndCategoryType(
            Long userId,
            String categoryName,
            CategoryType categoryType
    );

    boolean existsByUserIdAndCategoryNameIgnoreCaseAndCategoryTypeAndCategoryIdNot(
            Long userId,
            String categoryName,
            CategoryType categoryType,
            Long categoryId
    );
}