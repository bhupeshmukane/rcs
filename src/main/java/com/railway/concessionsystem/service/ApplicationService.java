package com.railway.concessionsystem.service;

import com.railway.concessionsystem.model.*;
import com.railway.concessionsystem.repository.ApplicationRepository;
import com.railway.concessionsystem.repository.ApplicationTimelineRepository;
import com.railway.concessionsystem.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.railway.concessionsystem.repository.CertificateHistoryRepository;


import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.util.Locale;
import java.util.UUID;

@Service
public class ApplicationService {

    private static final String CASTE_CERT_DIR = "uploads/caste-certificates/";
    private static final String AADHAR_CARD_DIR = "uploads/aadhar-cards/";
    private static final String OTHER_DOC_DIR = "uploads/other-documents/";

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ApplicationTimelineRepository timelineRepository;

    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private EmailService emailService;

    @Autowired
    private AuditService auditService;

    @Autowired
    private CertificateHistoryRepository certificateHistoryRepository;

    // =====================================================
    // CREATE APPLICATION
    // =====================================================
    public Application createApplication(
            String studentId,
            String studentName,
            String studentDob,
            String routeFrom,
            String routeTo,
            String category,
            String concessionType,
            String previousCertificateNo,
            MultipartFile casteCertificate,
            MultipartFile aadharCard,
            MultipartFile otherDocument,
            MultipartFile previousPass

    ) throws Exception {

        // 🔹 Validate eligibility
        validateEligibility(studentId);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        boolean isSCorST = isSCorST(category);

        if (isSCorST && (casteCertificate == null || casteCertificate.isEmpty())) {
            throw new Exception("Caste certificate is mandatory for SC/ST students");
        }

        if (!isSCorST && casteCertificate != null && !casteCertificate.isEmpty()) {
            throw new Exception("Caste certificate not required for this category");
        }

        if (aadharCard == null || aadharCard.isEmpty()) {
            throw new Exception("Aadhaar card is required");
        }

        if (previousCertificateNo == null || previousCertificateNo.trim().isEmpty()) {
            throw new Exception("Previous certificate number is required");
        }

        if (previousPass == null || previousPass.isEmpty()) {
            throw new Exception("Previous pass upload is required");
        }

        validateAadhaarFile(aadharCard);

        String castePath = null;
        if (isSCorST && casteCertificate != null) {
            castePath = saveFile(casteCertificate, CASTE_CERT_DIR, studentId, "caste");
        }

        String aadharPath = saveFile(aadharCard, AADHAR_CARD_DIR, studentId, "aadhar");

        Application application = new Application();
        application.setStudent(student);
        application.setStudentName(studentName);
        application.setStudentDob(LocalDate.parse(studentDob));
        application.setRouteFrom(routeFrom);
        application.setRouteTo(routeTo);
        application.setCategory(category);
        application.setPrevCertificateNo(previousCertificateNo.trim());
        application.setCasteCertificate(castePath);
        application.setAadharCard(aadharPath);

        String otherDocPath = null;
        if (otherDocument != null && !otherDocument.isEmpty()) {
            otherDocPath = saveFile(otherDocument, OTHER_DOC_DIR, studentId, "other");
        }
        application.setOtherDocument(otherDocPath);
        application.setStatus(ApplicationStatus.PENDING);
        application.setApplicationDate(LocalDateTime.now());
        application.setConcessionType(parseConcessionType(concessionType));

        String previousPassPath = saveFile(previousPass, OTHER_DOC_DIR, studentId, "previous_pass");
        application.setPreviousPass(previousPassPath);
        application.setOverrideAllowed(false);  
        application.setValidUntil(null);
        application.setCurrentCertificateNo(null);  
        

        Application saved = applicationRepository.save(application);

        timelineRepository.save(
                new ApplicationTimeline(saved,
                        "SUBMITTED",
                        "Application submitted by student")
        );

        if (saved.getStudent() != null && saved.getStudent().getEmail() != null) {
            emailService.sendGenericEmail(
                saved.getStudent().getEmail(),
                "Railway Concession Application Submitted",
                "Your concession application has been submitted successfully.\n\n" +
                "Application ID: " + saved.getAppId() + "\n" +
                "Route: " + saved.getRouteFrom() + " - " + saved.getRouteTo() + "\n" +
                "Status: PENDING\n\n" +
                "You will receive further updates when staff reviews your application."
            );
        }

        return saved;
    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================
    public Application updateApplicationStatus(Long appId,
                                           ApplicationStatus status,
                                           String rejectionReason) {

    Application application = applicationRepository.findById(appId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

    application.setStatus(status);

    if (status == ApplicationStatus.APPROVED) {
        application.setApproveDate(LocalDateTime.now());
    }

    if (status == ApplicationStatus.REJECTED) {
        application.setRejectionReason(rejectionReason);
        application.setCurrentCertificateNo(null);
        application.setIssueDate(null);
        application.setValidUntil(null);

        emailService.sendGenericEmail(
                application.getStudent().getEmail(),
                "Railway Concession Application Rejected",
                "Your concession application has been rejected.\n\n" +
                "Application ID: " + application.getAppId() + "\n" +
                "Reason: " + (rejectionReason == null || rejectionReason.isBlank() ? "Not specified" : rejectionReason) + "\n\n" +
                "You may update details and reapply."
        );
    }

    Application saved = applicationRepository.save(application);

        if (status == ApplicationStatus.APPROVED) {
        emailService.sendGenericEmail(
            saved.getStudent().getEmail(),
            "Railway Concession Application Approved",
            "Your concession application has been approved. " +
            "Certificate will be issued shortly by staff.\n\n" +
            "Application ID: " + saved.getAppId()
        );
        }

    timelineRepository.save(
            new ApplicationTimeline(saved,
                    status.name(),
                    "Status updated by staff")
    );

    // ✅ Proper single audit log
    auditService.log(
            "APPLICATION_STATUS_UPDATED",
            "STAFF",
            "APPLICATION",
            String.valueOf(appId),
            "Status changed to " + status
    );

    return saved;
}

    // =====================================================
    // ASSIGN CERTIFICATE
    // =====================================================
    public Application assignCertificateNumber(Long appId, String certificateNo) {

    Application application = applicationRepository.findById(appId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

    if (application.getStatus() != ApplicationStatus.APPROVED) {
        throw new RuntimeException("Application must be approved first");
    }

    application.setCurrentCertificateNo(certificateNo);
    application.setIssueDate(LocalDateTime.now());
    application.setStatus(ApplicationStatus.ISSUED);

    LocalDate today = LocalDate.now();

    if (application.getConcessionType() == ConcessionType.MONTHLY) {
        application.setValidUntil(today.plusDays(28));
    } else {
        application.setValidUntil(today.plusDays(58));
    }

    Application saved = applicationRepository.save(application);

    // ✅ SEND ISSUED EMAIL
    emailService.sendGenericEmail(
            application.getStudent().getEmail(),
            "Railway Concession Issued",
            "Your concession has been issued.\n\n" +
            "Certificate No: " + certificateNo + "\n" +
            "Valid Until: " + application.getValidUntil()
    );

    CertificateHistory history = new CertificateHistory(
        certificateNo,
        LocalDate.now(),
        application.getValidUntil(),
        "ACTIVE",
        application
);

certificateHistoryRepository.save(history);

    timelineRepository.save(
            new ApplicationTimeline(saved,
                    "ISSUED",
                    "Certificate assigned: " + certificateNo)
    );

    auditService.log(
    "CERTIFICATE_ASSIGNED",
    "STAFF",
    "APPLICATION",
    String.valueOf(appId),
    "Certificate No: " + certificateNo
    );

    return saved;
}

    // ===============================
// GET APPLICATIONS FOR MULTIPLE DEPARTMENTS
// ===============================
public List<Application> getApplicationsForMultipleDepartments(List<String> departments) {

    if (departments == null || departments.isEmpty()) {
        throw new IllegalArgumentException("Department list cannot be empty");
    }

    Set<String> normalized = new HashSet<>();
    for (String dept : departments) {
        if (dept != null && !dept.isBlank()) {
            normalized.add(dept.trim().toUpperCase(Locale.ROOT));
        }
    }

    return applicationRepository.findAll().stream()
            .filter(app -> app.getStudent() != null && app.getStudent().getDepartment() != null)
            .filter(app -> normalized.contains(app.getStudent().getDepartment().trim().toUpperCase(Locale.ROOT)))
            .toList();
}
    // =====================================================
    // ENABLE OVERRIDE
    // =====================================================
    public void enableOverrideForStudent(String studentId) {

        Optional<Application> active =
                applicationRepository.findByStudent_IdAndStatusAndValidUntilAfter(
                        studentId,
                        ApplicationStatus.APPROVED,
                        LocalDate.now()
                );

        if (active.isEmpty()) {
            throw new RuntimeException("No active concession found");
        }

        Application application = active.get();
        application.setOverrideAllowed(true);
        applicationRepository.save(application);

        timelineRepository.save(
                new ApplicationTimeline(application,
                        "OVERRIDE_ENABLED",
                        "Override enabled by staff")
        );
    }

    // =====================================================
    // VALIDATE ELIGIBILITY
    // =====================================================
    public void validateEligibility(String studentId) {

        List<Application> pending =
                applicationRepository.findByStudent_IdAndStatus(
                        studentId,
                        ApplicationStatus.PENDING
                );

        if (!pending.isEmpty()) {
            throw new RuntimeException("You already have a pending application");
        }

        Optional<Application> active =
                applicationRepository.findByStudent_IdAndStatusAndValidUntilAfter(
                        studentId,
                        ApplicationStatus.APPROVED,
                        LocalDate.now()
                );

        if (active.isPresent() &&
                !Boolean.TRUE.equals(active.get().getOverrideAllowed())) {

            throw new RuntimeException(
                    "Concession active till " + active.get().getValidUntil()
            );
        }
    }

    // ===============================
// GET APPLICATION WITH VALIDITY INFO
// ===============================
    public Map<String, Object> getApplicationWithValidity(Long appId) {

    Application application = applicationRepository.findById(appId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

    Map<String, Object> response = new HashMap<>();
    response.put("application", application);

    if (application.getValidUntil() != null) {

        LocalDate today = LocalDate.now();
        LocalDate validUntil = application.getValidUntil();

        long remainingDays = ChronoUnit.DAYS.between(today, validUntil);

        response.put("validUntil", validUntil);

        if (remainingDays > 0) {
            response.put("remainingDays", remainingDays);
            response.put("isExpired", false);
        } else {
            response.put("remainingDays", 0);
            response.put("isExpired", true);
        }
    }

    return response;
}

    // =====================================================
    // FILE SAVE
    // =====================================================
    private String saveFile(MultipartFile file,
                            String uploadDir,
                            String studentId,
                            String fileType) throws Exception {

        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String extension = getFileExtension(file.getOriginalFilename());

        String fileName = studentId + "_" + fileType + "_" +
                UUID.randomUUID().toString().substring(0, 8) +
                extension;

        Path path = Paths.get(uploadDir + fileName);
        Files.write(path, file.getBytes());

        return uploadDir + fileName;
    }

    private void validateAadhaarFile(MultipartFile file) {

        String name = file.getOriginalFilename();

        if (name == null ||
                !(name.endsWith(".jpg") ||
                  name.endsWith(".jpeg") ||
                  name.endsWith(".png") ||
                  name.endsWith(".pdf"))) {

            throw new RuntimeException("Only JPG, PNG or PDF allowed");
        }
    }

    private boolean isSCorST(String category) {
        return "SC".equalsIgnoreCase(category) ||
               "ST".equalsIgnoreCase(category);
    }

    private ConcessionType parseConcessionType(String concessionType) {
        if (concessionType == null || concessionType.isBlank()) {
            return ConcessionType.MONTHLY;
        }

        String normalized = concessionType.trim().toUpperCase();

        try {
            return ConcessionType.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException(
                    "Invalid concession type. Allowed: MONTHLY, QUARTERLY"
            );
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    // =====================================================
    // EXPIRE OLD CONCESSIONS (SCHEDULED)
    // =====================================================
    public void expireOldConcessions() {
        List<Application> expired = applicationRepository.findByStatusAndValidUntilBefore(
                ApplicationStatus.ISSUED,
                LocalDate.now()
        );

        for (Application app : expired) {
            app.setStatus(ApplicationStatus.EXPIRED);
            applicationRepository.save(app);

            timelineRepository.save(
                    new ApplicationTimeline(app,
                            "EXPIRED",
                            "Concession expired automatically")
            );

            emailService.sendGenericEmail(
                    app.getStudent().getEmail(),
                    "Concession Expired",
                    "Your railway concession with certificate number "
                    + app.getCurrentCertificateNo()
                    + " has expired."
            );
        }
    }
}

