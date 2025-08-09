package com.example.studentmanagement.controller;

import com.example.studentmanagement.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> getDashboardKPIs() {
        try {
            Map<String, Object> kpis = dashboardService.getDashboardKPIs();
            return ResponseEntity.ok(kpis);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/enrollment-trend")
    public ResponseEntity<Map<String, Object>> getEnrollmentTrend(
            @RequestParam(defaultValue = "30") int period) {
        try {
            Map<String, Object> enrollmentData = dashboardService.getEnrollmentTrend(period);
            return ResponseEntity.ok(enrollmentData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/revenue-overview")
    public ResponseEntity<Map<String, Object>> getRevenueOverview(
            @RequestParam(defaultValue = "monthly") String period) {
        try {
            Map<String, Object> revenueData = dashboardService.getRevenueOverview(period);
            return ResponseEntity.ok(revenueData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<Map<String, Object>> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            Map<String, Object> activityData = dashboardService.getRecentActivity(limit);
            return ResponseEntity.ok(activityData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/course-distribution")
    public ResponseEntity<Map<String, Object>> getCourseDistribution() {
        try {
            Map<String, Object> courseData = dashboardService.getCourseDistribution();
            return ResponseEntity.ok(courseData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<Map<String, Object>> getPaymentMethodsDistribution() {
        try {
            Map<String, Object> paymentData = dashboardService.getPaymentMethodsDistribution();
            return ResponseEntity.ok(paymentData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}