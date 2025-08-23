package com.example.studentmanagement.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.studentmanagement.model.Payment;
import com.example.studentmanagement.repository.PaymentRepository;
import com.example.studentmanagement.repository.StudentRepository;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private StudentRepository studentRepository;

    public Payment createPayment(Payment payment) {
        // Set receipt number based on manual entry or auto-generation
        if (payment.getManualReceiptNumber() != null && !payment.getManualReceiptNumber().trim().isEmpty()) {
            payment.setReceiptNumber(payment.getManualReceiptNumber());
            payment.setIsManualReceipt(true);
        } else {
            payment.setReceiptNumber(generateReceiptNumber(payment));
            payment.setIsManualReceipt(false);
        }
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus("PAID");
        return paymentRepository.save(payment);
    }

    public List<Payment> getPaymentsByStudentId(Long studentId) {
        return paymentRepository.findByStudentId(studentId);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id).orElse(null);
    }

    public Payment updatePayment(Long id, Payment paymentDetails) {
        Payment payment = paymentRepository.findById(id).orElse(null);
        if (payment != null) {
            // Only update fields that are provided (not null)
            if (paymentDetails.getAmount() != null) {
                payment.setAmount(paymentDetails.getAmount());
            }
            if (paymentDetails.getPaymentMethod() != null) {
                payment.setPaymentMethod(paymentDetails.getPaymentMethod());
            }
            if (paymentDetails.getDescription() != null) {
                payment.setDescription(paymentDetails.getDescription());
            }
            if (paymentDetails.getStatus() != null) {
                payment.setStatus(paymentDetails.getStatus());
            }
            
            // Update payment date if provided
            if (paymentDetails.getPaymentDate() != null) {
                payment.setPaymentDate(paymentDetails.getPaymentDate());
            }
            
            // Update receipt number - handle both direct receipt number and manual receipt number
            if (paymentDetails.getReceiptNumber() != null && !paymentDetails.getReceiptNumber().trim().isEmpty()) {
                payment.setReceiptNumber(paymentDetails.getReceiptNumber());
                payment.setManualReceiptNumber(paymentDetails.getReceiptNumber());
                payment.setIsManualReceipt(true);
            } else if (paymentDetails.getManualReceiptNumber() != null && !paymentDetails.getManualReceiptNumber().trim().isEmpty()) {
                payment.setReceiptNumber(paymentDetails.getManualReceiptNumber());
                payment.setManualReceiptNumber(paymentDetails.getManualReceiptNumber());
                payment.setIsManualReceipt(true);
            }
            
            return paymentRepository.save(payment);
        }
        return null;
    }

    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }

    public List<Payment> getStudentLedger(Long studentId) {
        return paymentRepository.findByStudentIdOrderByPaymentDateDesc(studentId);
    }

    private String generateReceiptNumber(Payment payment) {
        // Format: REC-YYYYMMDD-XXXX where XXXX is a sequential number
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String sequence = String.format("%04d", paymentRepository.count() + 1);
        return "REC-" + date + "-" + sequence;
    }
} 