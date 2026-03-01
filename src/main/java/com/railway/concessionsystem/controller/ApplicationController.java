package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Application;
import com.railway.concessionsystem.model.ApplicationStatus;
import com.railway.concessionsystem.model.Staff;
import com.railway.concessionsystem.service.ApplicationService;
import com.railway.concessionsystem.repository.ApplicationRepository;
import com.railway.concessionsystem.repository.StaffRepository;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.StringWriter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:3000")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StaffRepository staffRepository;

    // ==========================
    // CREATE APPLICATION
    // ==========================
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createApplication(
            @RequestParam String studentId,
            @RequestParam String studentName,
            @RequestParam String studentDob,
            @RequestParam String routeFrom,
            @RequestParam String routeTo,
            @RequestParam String category,
            @RequestParam String concessionType,
            @RequestParam(required = false) String previousCertificateNo,
            @RequestParam(required = false) MultipartFile casteCertificate,
            @RequestParam MultipartFile aadharCard
    ) {
        try {

            // Validate cooldown eligibility first
            applicationService.validateEligibility(studentId);

            Application saved = applicationService.createApplication(
                    studentId,
                    studentName,
                    studentDob,
                    routeFrom,
                    routeTo,
                    category,
                    concessionType,
                    previousCertificateNo,
                    casteCertificate,
                    aadharCard
            );

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================
    // GET APPLICATION BY ID
    // ==========================
    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================
    // UPDATE STATUS (STAFF)
    // ==========================
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        try {
            String statusStr = request.get("status");
            String rejectionReason = request.get("rejectionReason");

            if (statusStr == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Status is required"));
            }

            ApplicationStatus status =
                    ApplicationStatus.valueOf(statusStr.toUpperCase());

            Application updated =
                    applicationService.updateApplicationStatus(id, status, rejectionReason);

            return ResponseEntity.ok(updated);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid status value"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================
    // ASSIGN CERTIFICATE
    // ==========================
    @PutMapping("/{id}/certificate")
    public ResponseEntity<?> assignCertificateNumber(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        try {

            String certificateNo = request.get("certificateNo");

            if (certificateNo == null || certificateNo.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Certificate number is required"));
            }

            Application updated =
                    applicationService.assignCertificateNumber(id, certificateNo);

            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================
    // GET BY STUDENT
    // ==========================
    @GetMapping("/student/{studentId}")
    public List<Application> getApplicationsByStudent(@PathVariable String studentId) {
        return applicationRepository.findByStudent_Id(studentId);
    }

    // ==========================
    // STATS
    // ==========================
    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        return Map.of(
                "total", applicationRepository.count(),
                "pending", applicationRepository.countByStatus(ApplicationStatus.PENDING),
                "approved", applicationRepository.countByStatus(ApplicationStatus.APPROVED),
                "rejected", applicationRepository.countByStatus(ApplicationStatus.REJECTED)
        );
    }

    // ==========================
    // STAFF DEPARTMENT FILTER
    // ==========================
    @GetMapping("/staff/applications")
    public ResponseEntity<?> getApplicationsForStaff(HttpSession session) {

        try {
            String staffEmail =
                    (String) session.getAttribute("staffEmail");

            if (staffEmail == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Not authenticated"));
            }

            Staff staff = staffRepository.findByEmail(staffEmail)
                    .orElseThrow(() -> new RuntimeException("Staff not found"));

            List<String> allowedDepartments;

            if ("IT".equalsIgnoreCase(staff.getDepartment())) {
                allowedDepartments = List.of("FEIT", "SEIT", "TEIT", "BEIT");
            } else if ("MECH".equalsIgnoreCase(staff.getDepartment())) {
                allowedDepartments = List.of("FEMECH", "SEMECH", "TEMECH", "BEMECH");
            } else {
                allowedDepartments = List.of(staff.getDepartment());
            }

            List<Application> applications =
                    applicationService.getApplicationsForMultipleDepartments(allowedDepartments);

            return ResponseEntity.ok(applications);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================
// GET APPLICATION VALIDITY INFO
// ==========================
@GetMapping("/{id}/validity")
public ResponseEntity<?> getApplicationValidity(@PathVariable Long id) {

    try {
        return ResponseEntity.ok(
                applicationService.getApplicationWithValidity(id)
        );
    } catch (Exception e) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
    }
}

    // ==========================
    // STAFF OVERRIDE
    // ==========================
    @PutMapping("/staff/override/{studentId}")
    public ResponseEntity<?> enableOverride(@PathVariable String studentId) {

        applicationService.enableOverrideForStudent(studentId);

        return ResponseEntity.ok(
                Map.of("message", "Override enabled successfully")
        );
    }

    // ==========================
    // CSV REPORT
    // ==========================
    @GetMapping("staff/reports/applications/csv")
    public ResponseEntity<String> generateCSV() {

        List<Application> applications =
                applicationRepository.findAll();

        StringWriter csv = new StringWriter();

        csv.append("Application ID,Student ID,Route,Status,Valid Until\n");

        for (Application app : applications) {

            csv.append(app.getAppId().toString()).append(",");
            csv.append(app.getStudent().getId()).append(",");
            csv.append(app.getRouteFrom()).append(" - ")
                    .append(app.getRouteTo()).append(",");
            csv.append(app.getStatus().toString()).append(",");
            csv.append(app.getValidUntil() != null ?
                    app.getValidUntil().toString() : "").append("\n");
        }

        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition",
                        "attachment; filename=applications.csv")
                .body(csv.toString());
    }
}