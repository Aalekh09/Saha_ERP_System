package com.example.studentmanagement.controller;

import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        return ResponseEntity.ok(studentService.createStudent(student));
    }

    @PostMapping("/with-document")
    public ResponseEntity<Student> createStudentWithDocument(
            @RequestParam("name") String name,
            @RequestParam("fatherName") String fatherName,
            @RequestParam("motherName") String motherName,
            @RequestParam("dob") String dob,
            @RequestParam("email") String email,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam("address") String address,
            @RequestParam("courses") String courses,
            @RequestParam("courseDuration") String courseDuration,
            @RequestParam("totalCourseFee") String totalCourseFee,
            @RequestParam("admissionDate") String admissionDate,
            @RequestParam(value = "tenthClassDocument", required = false) MultipartFile tenthClassDocument) {
        
        try {
            System.out.println("Creating student with document upload...");
            System.out.println("Student name: " + name);
            System.out.println("File received: " + (tenthClassDocument != null ? tenthClassDocument.getOriginalFilename() : "null"));
            System.out.println("File size: " + (tenthClassDocument != null ? tenthClassDocument.getSize() : "0"));
            
            Student student = new Student();
            student.setName(name);
            student.setFatherName(fatherName);
            student.setMotherName(motherName);
            student.setDob(dob);
            student.setEmail(email);
            student.setPhoneNumber(phoneNumber);
            student.setAddress(address);
            student.setCourses(courses);
            student.setCourseDuration(courseDuration);
            student.setTotalCourseFee(new java.math.BigDecimal(totalCourseFee));
            student.setPaidAmount(java.math.BigDecimal.ZERO);
            student.setRemainingAmount(new java.math.BigDecimal(totalCourseFee));
            student.setAdmissionDate(java.time.LocalDate.parse(admissionDate));

            // Handle file upload
            if (tenthClassDocument != null && !tenthClassDocument.isEmpty()) {
                System.out.println("Processing file upload...");
                String documentPath = saveDocument(tenthClassDocument, "tenth_class");
                student.setTenthClassDocument(documentPath);
                System.out.println("Document saved with filename: " + documentPath);
            } else {
                System.out.println("No file to upload");
            }

            Student savedStudent = studentService.createStudent(student);
            System.out.println("Student created with ID: " + savedStudent.getId());
            return ResponseEntity.ok(savedStudent);
        } catch (Exception e) {
            System.out.println("Error creating student: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student student) {
        return ResponseEntity.ok(studentService.updateStudent(id, student));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Student>> searchStudents(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {
        return ResponseEntity.ok(studentService.searchStudents(name, email, phone));
    }

    @GetMapping("/document/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> getDocument(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("frontend/uploads/documents/" + filename);
            System.out.println("Looking for file at: " + filePath.toAbsolutePath());
            
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                System.out.println("File found and readable: " + filename);
                return ResponseEntity.ok()
                        .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                System.out.println("File not found or not readable: " + filename);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.out.println("Error serving file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/test-document")
    public ResponseEntity<String> testDocument() {
        try {
            Path filePath = Paths.get("frontend/uploads/documents/test.txt");
            System.out.println("Test file path: " + filePath.toAbsolutePath());
            System.out.println("File exists: " + Files.exists(filePath));
            System.out.println("File readable: " + Files.isReadable(filePath));
            
            if (Files.exists(filePath)) {
                String content = Files.readString(filePath);
                return ResponseEntity.ok("File content: " + content);
            } else {
                return ResponseEntity.ok("Test file not found at: " + filePath.toAbsolutePath());
            }
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }

    @PostMapping("/fix-document-paths")
    public ResponseEntity<String> fixDocumentPaths() {
        try {
            List<Student> students = studentService.getAllStudents();
            int fixedCount = 0;
            
            for (Student student : students) {
                if (student.getTenthClassDocument() != null && 
                    student.getTenthClassDocument().startsWith("uploads/documents/")) {
                    // Extract just the filename
                    String filename = student.getTenthClassDocument().substring("uploads/documents/".length());
                    student.setTenthClassDocument(filename);
                    studentService.updateStudent(student.getId(), student);
                    fixedCount++;
                }
            }
            
            return ResponseEntity.ok("Fixed " + fixedCount + " student document paths");
        } catch (Exception e) {
            return ResponseEntity.ok("Error fixing paths: " + e.getMessage());
        }
    }

    @GetMapping("/list-documents")
    public ResponseEntity<String> listDocuments() {
        try {
            Path documentsDir = Paths.get("frontend/uploads/documents/");
            System.out.println("Documents directory: " + documentsDir.toAbsolutePath());
            
            if (!Files.exists(documentsDir)) {
                return ResponseEntity.ok("Documents directory does not exist: " + documentsDir.toAbsolutePath());
            }
            
            StringBuilder result = new StringBuilder();
            result.append("Documents directory: ").append(documentsDir.toAbsolutePath()).append("\n");
            result.append("Files found:\n");
            
            Files.list(documentsDir).forEach(file -> {
                result.append("- ").append(file.getFileName()).append(" (").append(Files.isReadable(file) ? "readable" : "not readable").append(")\n");
            });
            
            // Also check students with documents
            List<Student> students = studentService.getAllStudents();
            result.append("\nStudents with documents:\n");
            for (Student student : students) {
                if (student.getTenthClassDocument() != null) {
                    result.append("- Student ID ").append(student.getId()).append(": ").append(student.getTenthClassDocument()).append("\n");
                }
            }
            
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.ok("Error listing documents: " + e.getMessage());
        }
    }

    @PostMapping("/test-upload")
    public ResponseEntity<String> testUpload(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("Test upload received:");
            System.out.println("- Original filename: " + file.getOriginalFilename());
            System.out.println("- Size: " + file.getSize());
            System.out.println("- Content type: " + file.getContentType());
            
            if (file.isEmpty()) {
                return ResponseEntity.ok("File is empty");
            }
            
            String filename = saveDocument(file, "test");
            return ResponseEntity.ok("File uploaded successfully: " + filename);
        } catch (Exception e) {
            System.out.println("Test upload error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok("Upload failed: " + e.getMessage());
        }
    }

    @PostMapping("/cleanup-missing-documents")
    public ResponseEntity<String> cleanupMissingDocuments() {
        try {
            List<Student> students = studentService.getAllStudents();
            int cleanedCount = 0;
            
            for (Student student : students) {
                if (student.getTenthClassDocument() != null) {
                    Path filePath = Paths.get("frontend/uploads/documents/" + student.getTenthClassDocument());
                    if (!Files.exists(filePath)) {
                        System.out.println("Removing missing document reference for student " + student.getId() + ": " + student.getTenthClassDocument());
                        student.setTenthClassDocument(null);
                        studentService.updateStudent(student.getId(), student);
                        cleanedCount++;
                    }
                }
            }
            
            return ResponseEntity.ok("Cleaned up " + cleanedCount + " missing document references");
        } catch (Exception e) {
            return ResponseEntity.ok("Error cleaning up: " + e.getMessage());
        }
    }

    private String saveDocument(MultipartFile file, String documentType) throws IOException {
        // Create uploads directory if it doesn't exist
        String uploadDir = "frontend/uploads/documents/";
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
            System.out.println("Created directory: " + directory.getAbsolutePath());
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = documentType + "_" + UUID.randomUUID().toString() + fileExtension;
        
        // Save file
        Path filePath = Paths.get(uploadDir + uniqueFilename);
        Files.write(filePath, file.getBytes());
        
        System.out.println("File saved successfully: " + filePath.toAbsolutePath());
        System.out.println("Returning filename: " + uniqueFilename);
        
        // Return just the filename for storage in database
        return uniqueFilename;
    }
} 