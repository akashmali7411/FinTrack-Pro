package com.fintrack.fintrack_backend.controller;

import com.fintrack.fintrack_backend.dto.DashboardSummaryResponse;
import com.fintrack.fintrack_backend.service.DashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            @RequestParam Long userId) {

        return ResponseEntity.ok(
                dashboardService.getSummary(userId)
        );
    }
}