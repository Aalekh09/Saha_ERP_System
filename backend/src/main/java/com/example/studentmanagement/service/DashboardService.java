package com.example.studentmanagement.service;

import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.model.Payment;
import com.example.studentmanagement.model.Enquiry;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.repository.PaymentRepository;
import com.example.studentmanagement.repository.EnquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private EnquiryRepository enquiryRepository;

    public Map<String, Object> getDashboardKPIs() {
        Map<String, Object> kpis = new HashMap<>();

        // Get all data
        List<Student> students = studentRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();
        List<Enquiry> enquiries = enquiryRepository.findAll();

        // Calculate current month data
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate startOfLastMonth = startOfMonth.minusMonths(1);

        // Total Students
        int totalStudents = students.size();
        long studentsThisMonth = students.stream()
                .filter(s -> s.getAdmissionDate() != null &&
                        s.getAdmissionDate().isAfter(startOfMonth.minusDays(1)))
                .count();
        long studentsLastMonth = students.stream()
                .filter(s -> s.getAdmissionDate() != null &&
                        s.getAdmissionDate().isAfter(startOfLastMonth.minusDays(1)) &&
                        s.getAdmissionDate().isBefore(startOfMonth))
                .count();

        Map<String, Object> totalStudentsKPI = new HashMap<>();
        totalStudentsKPI.put("count", totalStudents);
        totalStudentsKPI.put("trend", calculateTrend(studentsThisMonth, studentsLastMonth));
        totalStudentsKPI.put("trendDirection", studentsThisMonth >= studentsLastMonth ? "up" : "down");
        kpis.put("totalStudents", totalStudentsKPI);

        // Monthly Revenue
        Double monthlyRevenue = payments.stream()
                .filter(p -> p.getPaymentDate() != null &&
                        p.getPaymentDate().toLocalDate().isAfter(startOfMonth.minusDays(1)))
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(0.0, Double::sum);

        Double lastMonthRevenue = payments.stream()
                .filter(p -> p.getPaymentDate() != null &&
                        p.getPaymentDate().toLocalDate().isAfter(startOfLastMonth.minusDays(1)) &&
                        p.getPaymentDate().toLocalDate().isBefore(startOfMonth))
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(0.0, Double::sum);

        Map<String, Object> monthlyRevenueKPI = new HashMap<>();
        monthlyRevenueKPI.put("amount", monthlyRevenue);
        monthlyRevenueKPI.put("trend", calculateTrend(monthlyRevenue, lastMonthRevenue));
        monthlyRevenueKPI.put("trendDirection", monthlyRevenue >= lastMonthRevenue ? "up" : "down");
        kpis.put("monthlyRevenue", monthlyRevenueKPI);

        // Pending Fees
        Double pendingFees = students.stream()
                .map(s -> {
                    BigDecimal total = s.getTotalCourseFee() != null ? s.getTotalCourseFee() : BigDecimal.ZERO;
                    BigDecimal paid = s.getPaidAmount() != null ? s.getPaidAmount() : BigDecimal.ZERO;
                    BigDecimal pending = total.subtract(paid);
                    return pending.compareTo(BigDecimal.ZERO) > 0 ? pending.doubleValue() : 0.0;
                })
                .reduce(0.0, Double::sum);

        Map<String, Object> pendingFeesKPI = new HashMap<>();
        pendingFeesKPI.put("amount", pendingFees);
        pendingFeesKPI.put("trend", "-3.1%"); // Mock trend
        pendingFeesKPI.put("trendDirection", "down");
        kpis.put("pendingFees", pendingFeesKPI);

        // New Enquiries
        long newEnquiries = enquiries.stream()
                .filter(e -> e.getDateOfEnquiry() != null &&
                        e.getDateOfEnquiry().isAfter(startOfMonth.minusDays(1)))
                .count();

        long lastMonthEnquiries = enquiries.stream()
                .filter(e -> e.getDateOfEnquiry() != null &&
                        e.getDateOfEnquiry().isAfter(startOfLastMonth.minusDays(1)) &&
                        e.getDateOfEnquiry().isBefore(startOfMonth))
                .count();

        Map<String, Object> newEnquiriesKPI = new HashMap<>();
        newEnquiriesKPI.put("count", newEnquiries);
        newEnquiriesKPI.put("trend", calculateTrend(newEnquiries, lastMonthEnquiries));
        newEnquiriesKPI.put("trendDirection", newEnquiries >= lastMonthEnquiries ? "up" : "down");
        kpis.put("newEnquiries", newEnquiriesKPI);

        return kpis;
    }

    public Map<String, Object> getEnrollmentTrend(int period) {
        List<Student> students = studentRepository.findAll();
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(period - 1);

        List<String> labels = new ArrayList<>();
        List<Integer> data = new ArrayList<>();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            labels.add(date.format(DateTimeFormatter.ofPattern("MMM dd")));

            final LocalDate currentDate = date;
            int count = (int) students.stream()
                    .filter(s -> s.getAdmissionDate() != null &&
                            s.getAdmissionDate().equals(currentDate))
                    .count();
            data.add(count);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("data", data);
        return result;
    }

    public Map<String, Object> getRevenueOverview(String period) {
        List<Payment> payments = paymentRepository.findAll();
        List<String> labels = new ArrayList<>();
        List<Double> data = new ArrayList<>();

        if ("monthly".equals(period)) {
            // Last 6 months
            for (int i = 5; i >= 0; i--) {
                LocalDate date = LocalDate.now().minusMonths(i);
                labels.add(date.format(DateTimeFormatter.ofPattern("MMM")));

                Double monthlyTotal = payments.stream()
                        .filter(p -> p.getPaymentDate() != null &&
                                p.getPaymentDate().toLocalDate().getMonth() == date.getMonth() &&
                                p.getPaymentDate().toLocalDate().getYear() == date.getYear())
                        .map(Payment::getAmount)
                        .filter(Objects::nonNull)
                        .reduce(0.0, Double::sum);
                data.add(monthlyTotal);
            }
        } else if ("weekly".equals(period)) {
            // Last 8 weeks
            for (int i = 7; i >= 0; i--) {
                LocalDate endDate = LocalDate.now().minusWeeks(i);
                LocalDate startDate = endDate.minusDays(6);
                labels.add("Week " + (8 - i));

                Double weeklyTotal = payments.stream()
                        .filter(p -> p.getPaymentDate() != null &&
                                !p.getPaymentDate().toLocalDate().isBefore(startDate) &&
                                !p.getPaymentDate().toLocalDate().isAfter(endDate))
                        .map(Payment::getAmount)
                        .filter(Objects::nonNull)
                        .reduce(0.0, Double::sum);
                data.add(weeklyTotal);
            }
        } else if ("daily".equals(period)) {
            // Last 7 days
            for (int i = 6; i >= 0; i--) {
                LocalDate date = LocalDate.now().minusDays(i);
                labels.add(date.format(DateTimeFormatter.ofPattern("EEE")));

                Double dailyTotal = payments.stream()
                        .filter(p -> p.getPaymentDate() != null &&
                                p.getPaymentDate().toLocalDate().equals(date))
                        .map(Payment::getAmount)
                        .filter(Objects::nonNull)
                        .reduce(0.0, Double::sum);
                data.add(dailyTotal);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("data", data);
        return result;
    }

    public Map<String, Object> getRecentActivity(int limit) {
        List<Map<String, Object>> activities = new ArrayList<>();

        // Get recent students
        List<Student> recentStudents = studentRepository.findAll().stream()
                .filter(s -> s.getAdmissionDate() != null)
                .sorted((a, b) -> b.getAdmissionDate().compareTo(a.getAdmissionDate()))
                .limit(3)
                .collect(Collectors.toList());

        for (Student student : recentStudents) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", student.getId());
            activity.put("type", "student");
            activity.put("title", "New student enrolled");
            activity.put("description", student.getName() + " enrolled in " + student.getCourses());
            activity.put("time", getTimeAgo(student.getAdmissionDate().atStartOfDay()));
            activity.put("icon", "fa-user-plus");
            activities.add(activity);
        }

        // Get recent payments
        List<Payment> recentPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentDate() != null)
                .sorted((a, b) -> b.getPaymentDate().compareTo(a.getPaymentDate()))
                .limit(3)
                .collect(Collectors.toList());

        for (Payment payment : recentPayments) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", payment.getId());
            activity.put("type", "payment");
            activity.put("title", "Payment received");
            activity.put("description", "₹" + payment.getAmount() + " from " +
                    (payment.getStudent() != null ? payment.getStudent().getName() : "Unknown"));
            activity.put("time", getTimeAgo(payment.getPaymentDate()));
            activity.put("icon", "fa-money-bill-wave");
            activities.add(activity);
        }

        // Get recent enquiries
        List<Enquiry> recentEnquiries = enquiryRepository.findAll().stream()
                .filter(e -> e.getDateOfEnquiry() != null)
                .sorted((a, b) -> b.getDateOfEnquiry().compareTo(a.getDateOfEnquiry()))
                .limit(2)
                .collect(Collectors.toList());

        for (Enquiry enquiry : recentEnquiries) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", enquiry.getId());
            activity.put("type", "enquiry");
            activity.put("title", "New enquiry");
            activity.put("description", enquiry.getName() + " interested in " + enquiry.getCourse());
            activity.put("time", getTimeAgo(enquiry.getDateOfEnquiry().atStartOfDay()));
            activity.put("icon", "fa-phone");
            activities.add(activity);
        }

        // Sort all activities by time and limit
        activities.sort((a, b) -> {
            // This is a simplified sort - in real implementation, you'd sort by actual
            // timestamp
            return 0;
        });

        Map<String, Object> result = new HashMap<>();
        result.put("activities", activities.stream().limit(limit).collect(Collectors.toList()));
        return result;
    }

    public Map<String, Object> getCourseDistribution() {
        List<Student> students = studentRepository.findAll();
        Map<String, Long> courseCount = students.stream()
                .filter(s -> s.getCourses() != null)
                .collect(Collectors.groupingBy(Student::getCourses, Collectors.counting()));

        Map<String, Object> result = new HashMap<>();
        result.put("labels", new ArrayList<>(courseCount.keySet()));
        result.put("data", new ArrayList<>(courseCount.values()));
        return result;
    }

    public Map<String, Object> getPaymentMethodsDistribution() {
        List<Payment> payments = paymentRepository.findAll();
        Map<String, Long> methodCount = payments.stream()
                .filter(p -> p.getPaymentMethod() != null)
                .collect(Collectors.groupingBy(Payment::getPaymentMethod, Collectors.counting()));

        Map<String, Object> result = new HashMap<>();
        result.put("labels", new ArrayList<>(methodCount.keySet()));
        result.put("data", new ArrayList<>(methodCount.values()));
        return result;
    }

    private String calculateTrend(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? "+100%" : "0%";
        }

        double percentage = ((double) (current - previous) / previous) * 100;
        return String.format("%+.1f%%", percentage);
    }

    private String calculateTrend(double current, double previous) {
        if (previous == 0) {
            return current > 0 ? "+100%" : "0%";
        }

        double percentage = ((current - previous) / previous) * 100;
        return String.format("%+.1f%%", percentage);
    }

    private String getTimeAgo(LocalDateTime dateTime) {
        Duration duration = Duration.between(dateTime, LocalDateTime.now());

        long minutes = duration.toMinutes();
        if (minutes < 60) {
            return minutes + " minutes ago";
        }

        long hours = duration.toHours();
        if (hours < 24) {
            return hours + " hours ago";
        }

        long days = duration.toDays();
        return days + " days ago";
    }
}