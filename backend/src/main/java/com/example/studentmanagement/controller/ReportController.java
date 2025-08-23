package com.example.studentmanagement.controller;

import com.example.studentmanagement.model.Enquiry;
import com.example.studentmanagement.model.Payment;
import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.repository.EnquiryRepository;
import com.example.studentmanagement.repository.PaymentRepository;
import com.example.studentmanagement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private EnquiryRepository enquiryRepository;

    // 1. Monthly Student Admissions (by id, fallback: not perfect if no createdAt)
    @GetMapping("/monthly-student-admissions")
    public List<Map<String, Object>> getMonthlyStudentAdmissions() {
        List<Student> students = studentRepository.findAll();
        Map<YearMonth, Long> monthlyCounts = students.stream()
                .filter(s -> s.getAdmissionDate() != null)
                .collect(Collectors.groupingBy(
                        s -> YearMonth.from(s.getAdmissionDate()),
                        Collectors.counting()));
        // Get last 12 months
        List<YearMonth> last12Months = new ArrayList<>();
        YearMonth now = YearMonth.now();
        for (int i = 11; i >= 0; i--) {
            last12Months.add(now.minusMonths(i));
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (YearMonth ym : last12Months) {
            Map<String, Object> row = new HashMap<>();
            row.put("month", ym.toString());
            row.put("count", monthlyCounts.getOrDefault(ym, 0L));
            result.add(row);
        }
        return result;
    }

    // 2. Monthly Payments Collected
    @GetMapping("/monthly-payments")
    public List<Map<String, Object>> getMonthlyPayments() {
        List<Payment> payments = paymentRepository.findAll();
        Map<YearMonth, Double> monthlyTotals = payments.stream()
                .filter(p -> p.getPaymentDate() != null)
                .collect(Collectors.groupingBy(
                        p -> YearMonth.from(p.getPaymentDate().toLocalDate()),
                        Collectors.summingDouble(Payment::getAmount)));
        // Get last 12 months
        List<YearMonth> last12Months = new ArrayList<>();
        YearMonth now = YearMonth.now();
        for (int i = 11; i >= 0; i--) {
            last12Months.add(now.minusMonths(i));
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (YearMonth ym : last12Months) {
            Map<String, Object> row = new HashMap<>();
            row.put("month", ym.toString());
            row.put("totalPayments", monthlyTotals.getOrDefault(ym, 0.0));
            result.add(row);
        }
        return result;
    }

    // 3. Pending Fees
    @GetMapping("/pending-fees")
    public List<Map<String, Object>> getPendingFees() {
        List<Student> students = studentRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Student s : students) {
            if (s.getRemainingAmount() != null && s.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0) {
                Map<String, Object> row = new HashMap<>();
                row.put("studentName", s.getName());
                row.put("course", s.getCourses());
                row.put("pendingAmount", s.getRemainingAmount());
                row.put("admissionDate", s.getAdmissionDate());
                result.add(row);
            }
        }
        return result;
    }

    // 3.1. Pending Fees by Month
    @GetMapping("/pending-fees-by-month")
    public List<Map<String, Object>> getPendingFeesByMonth(String month) {
        if (month == null || month.isEmpty()) {
            return getPendingFees();
        }

        YearMonth yearMonth = YearMonth.parse(month);
        List<Student> students = studentRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Student s : students) {
            if (s.getRemainingAmount() != null && s.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0) {
                // Check if student was admitted in the specified month
                if (s.getAdmissionDate() != null && YearMonth.from(s.getAdmissionDate()).equals(yearMonth)) {
                    Map<String, Object> row = new HashMap<>();
                    row.put("studentName", s.getName());
                    row.put("course", s.getCourses());
                    row.put("pendingAmount", s.getRemainingAmount());
                    row.put("admissionDate", s.getAdmissionDate());
                    result.add(row);
                }
            }
        }
        return result;
    }

    // 4. Monthly Enquiry Summary
    @GetMapping("/monthly-enquiries")
    public List<Map<String, Object>> getMonthlyEnquiries() {
        List<Enquiry> enquiries = enquiryRepository.findAll();
        Map<YearMonth, Long> monthlyCounts = enquiries.stream()
                .filter(e -> e.getDateOfEnquiry() != null)
                .collect(Collectors.groupingBy(
                        e -> YearMonth.from(e.getDateOfEnquiry()),
                        Collectors.counting()));
        // Get last 12 months
        List<YearMonth> last12Months = new ArrayList<>();
        YearMonth now = YearMonth.now();
        for (int i = 11; i >= 0; i--) {
            last12Months.add(now.minusMonths(i));
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (YearMonth ym : last12Months) {
            Map<String, Object> row = new HashMap<>();
            row.put("month", ym.toString());
            row.put("totalEnquiries", monthlyCounts.getOrDefault(ym, 0L));
            result.add(row);
        }
        return result;
    }

    // 5. List students added in a given month with details
    @GetMapping("/students-by-month")
    public List<Map<String, Object>> getStudentsByMonth(String month) {
        // month format: YYYY-MM
        YearMonth yearMonth = YearMonth.parse(month);
        List<Student> students = studentRepository.findAll();
        return students.stream()
                .filter(s -> s.getAdmissionDate() != null && YearMonth.from(s.getAdmissionDate()).equals(yearMonth))
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", s.getName());
                    map.put("fatherName", s.getFatherName());
                    map.put("courses", s.getCourses());
                    return map;
                })
                .collect(Collectors.toList());
    }

    // 6. Receipt Lookup - Find student details by receipt number
    @GetMapping("/receipt-lookup")
    public Map<String, Object> lookupReceipt(@RequestParam String receiptNumber) {
        Map<String, Object> response = new HashMap<>();

        if (receiptNumber == null || receiptNumber.trim().isEmpty()) {
            response.put("found", false);
            response.put("error", "Receipt number is required");
            return response;
        }

        // Find payment by receipt number
        Optional<Payment> paymentOpt = paymentRepository.findAll().stream()
                .filter(p -> receiptNumber.trim().equalsIgnoreCase(p.getReceiptNumber()))
                .findFirst();

        if (!paymentOpt.isPresent()) {
            response.put("found", false);
            response.put("receiptNumber", receiptNumber.trim());
            return response;
        }

        Payment payment = paymentOpt.get();
        Student student = payment.getStudent();

        if (student == null) {
            response.put("found", false);
            response.put("error", "Student information not found for this receipt");
            return response;
        }

        // Build receipt details
        Map<String, Object> receiptDetails = new HashMap<>();
        receiptDetails.put("receiptNumber", payment.getReceiptNumber());
        receiptDetails.put("amount", payment.getAmount());
        receiptDetails.put("paymentDate", payment.getPaymentDate());
        receiptDetails.put("paymentMethod", payment.getPaymentMethod());
        receiptDetails.put("description", payment.getDescription());
        receiptDetails.put("status", payment.getStatus());

        // Build student details
        Map<String, Object> studentDetails = new HashMap<>();
        studentDetails.put("id", student.getId());
        studentDetails.put("name", student.getName());
        studentDetails.put("fatherName", student.getFatherName());
        studentDetails.put("contactNumber", student.getPhoneNumber());
        studentDetails.put("email", student.getEmail());
        studentDetails.put("courses", student.getCourses());
        studentDetails.put("admissionDate", student.getAdmissionDate());
        studentDetails.put("totalCourseFee", student.getTotalCourseFee());
        studentDetails.put("remainingAmount", student.getRemainingAmount());

        response.put("found", true);
        response.put("receipt", receiptDetails);
        response.put("student", studentDetails);

        return response;
    }
}