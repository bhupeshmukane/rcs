package com.railway.concessionsystem.service;

import com.railway.concessionsystem.model.*;
import com.railway.concessionsystem.repository.ApplicationRepository;
import com.railway.concessionsystem.repository.ApplicationTimelineRepository;
import com.railway.concessionsystem.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


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
import java.util.UUID;

@Service
public class ApplicationService {

    private static final String CASTE_CERT_DIR = "uploads/caste-certificates/";
    private static final String AADHAR_CARD_DIR = "uploads/aadhar-cards/";

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
            String previousCertificateNo,
            String concessionType,
            MultipartFile casteCertificate,
            MultipartFile aadharCard
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
        application.setPrevCertificateNo(previousCertificateNo);
        application.setCasteCertificate(castePath);
        application.setAadharCard(aadharPath);
        application.setStatus(ApplicationStatus.PENDING);
        application.setApplicationDate(LocalDateTime.now());
        application.setConcessionType(
        ConcessionType.valueOf(concessionType.toUpperCase()));

        Application saved = applicationRepository.save(application);

        timelineRepository.save(
                new ApplicationTimeline(saved,
                        "SUBMITTED",
                        "Application submitted by student")
        );

        return saved;
    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================
    public Application updateApplicationStatus(Long appId,
                                               ApplicationStatus status, String rejectionReason) {

        Application application = applicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(status);

        if (status == ApplicationStatus.APPROVED) {

    LocalDate today = LocalDate.now();

    application.setApproveDate(LocalDateTime.now());
    application.setIssueDate(LocalDateTime.now());

    if (application.getConcessionType() == ConcessionType.MONTHLY) {
        application.setValidUntil(today.plusDays(28));
    } else if (application.getConcessionType() == ConcessionType.QUARTERLY) {
        application.setValidUntil(today.plusDays(58));
    }

    // Reset override after new approval
    application.setOverrideAllowed(false);
}

        Application saved = applicationRepository.save(application);

        timelineRepository.save(
                new ApplicationTimeline(saved,
                        status.name(),
                        "Status updated by staff")
        );

        // 🔥 EMAIL NOTIFICATION
    String email = application.getStudent().getEmail();

    if (status == ApplicationStatus.APPROVED) {
        emailService.sendGenericEmail(
                email,
                "Concession Approved",
                "Your concession has been approved."
        );
    }

    if (status == ApplicationStatus.REJECTED) {
        emailService.sendGenericEmail(
                email,
                "Concession Rejected",
                "Your concession was rejected.\nReason: " + rejectionReason
        );
    }

        return saved;
    }

    // =====================================================
    // ASSIGN CERTIFICATE
    // =====================================================
    public Application assignCertificateNumber(Long appId, String certificateNo) {

    Application application = applicationRepository.findById(appId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

    if (application.getStatus() != ApplicationStatus.APPROVED) {
        throw new RuntimeException("Certificate can only be assigned after approval");
    }

    if (application.getCurrentCertificateNo() != null) {
        throw new RuntimeException("Certificate number already assigned");
    }

    // Check duplicate certificate number
    boolean exists = applicationRepository
            .existsByCurrentCertificateNo(certificateNo);

    if (exists) {
        throw new RuntimeException("Certificate number already used");
    }

    application.setCurrentCertificateNo(certificateNo);

    Application saved = applicationRepository.save(application);

    timelineRepository.save(
            new ApplicationTimeline(saved,
                    "CERTIFICATE_ASSIGNED",
                    "Certificate number assigned: " + certificateNo)
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

    return applicationRepository.findByStudent_DepartmentIn(departments);
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

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}