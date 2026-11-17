
package com.fintrack.fintrack_backend.controller;

import com.fintrack.fintrack_backend.dto.IncomeRequest;
import com.fintrack.fintrack_backend.entity.Income;
import com.fintrack.fintrack_backend.service.IncomeService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
public class IncomeController {

    private final IncomeService incomeService;

    public IncomeController(IncomeService incomeService) {
        this.incomeService = incomeService;
    }

    // Add new income
    @PostMapping
    public ResponseEntity<Income> createIncome(
            @Valid @RequestBody IncomeRequest request) {

        Income savedIncome = incomeService.createIncome(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedIncome);
    }

    // Get all income entries for a user
    @GetMapping
    public ResponseEntity<List<Income>> getIncomes(
            @RequestParam Long userId) {

        return ResponseEntity.ok(
                incomeService.getIncomes(userId)
        );
    }

    // Update existing income
    @PutMapping("/{incomeId}")
    public ResponseEntity<Income> updateIncome(
            @PathVariable Long incomeId,
            @Valid @RequestBody IncomeRequest request) {

        return ResponseEntity.ok(
                incomeService.updateIncome(incomeId, request)
        );
    }

    // Delete income
    @DeleteMapping("/{incomeId}")
    public ResponseEntity<Void> deleteIncome(
            @PathVariable Long incomeId,
            @RequestParam Long userId) {

        incomeService.deleteIncome(incomeId, userId);

        return ResponseEntity.noContent().build();
    }
}
