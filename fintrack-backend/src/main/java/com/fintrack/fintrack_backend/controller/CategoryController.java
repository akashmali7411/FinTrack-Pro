package com.fintrack.fintrack_backend.controller;

import com.fintrack.fintrack_backend.entity.Category;
import com.fintrack.fintrack_backend.entity.Category.CategoryType;
import com.fintrack.fintrack_backend.service.CategoryService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    public record CategoryRequest(
            @NotBlank
            @Size(max = 100)
            String categoryName,

            @NotNull
            CategoryType categoryType
    ) {}

    public record StatusRequest(
            boolean active
    ) {}

    @GetMapping
    public List<Category> getCategories(
            @RequestParam Long userId,
            @RequestParam(required = false) CategoryType type) {

        return categoryService.getCategories(userId, type);
    }

    @PostMapping
    public ResponseEntity<?> addCategory(
            @RequestParam Long userId,
            @Valid @RequestBody CategoryRequest request) {

        try {
            Category category = categoryService.addCategory(
                    userId,
                    request.categoryName(),
                    request.categoryType()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(category);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<?> updateCategory(
            @RequestParam Long userId,
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryRequest request) {

        try {
            Category category = categoryService.updateCategory(
                    userId,
                    categoryId,
                    request.categoryName(),
                    request.categoryType()
            );

            return ResponseEntity.ok(category);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @PatchMapping("/{categoryId}/status")
    public ResponseEntity<?> changeStatus(
            @RequestParam Long userId,
            @PathVariable Long categoryId,
            @RequestBody StatusRequest request) {

        try {
            Category category = categoryService.changeStatus(
                    userId,
                    categoryId,
                    request.active()
            );

            return ResponseEntity.ok(category);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }
}