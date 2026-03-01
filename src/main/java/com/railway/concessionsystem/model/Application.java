package com.railway.concessionsystem.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "application")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "app_id")
    private Long appId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonBackReference
    private Student student;

    private String studentName;
    private LocalDate studentDob;
    private String category;

    private String routeFrom;
    private String routeTo;

    private String prevCertificateNo;
    private String currentCertificateNo;

    private String casteCertificate;
    private String aadharCard;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "concession_type")
    private ConcessionType concessionType;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "override_allowed")
    private Boolean overrideAllowed = false;

    private LocalDateTime applicationDate;
    private LocalDateTime approveDate;
    private LocalDateTime issueDate;

    // Getters & Setters

    public Long getAppId() { return appId; }
    public void setAppId(Long appId) { this.appId = appId; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public LocalDate getStudentDob() { return studentDob; }
    public void setStudentDob(LocalDate studentDob) { this.studentDob = studentDob; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getRouteFrom() { return routeFrom; }
    public void setRouteFrom(String routeFrom) { this.routeFrom = routeFrom; }

    public String getRouteTo() { return routeTo; }
    public void setRouteTo(String routeTo) { this.routeTo = routeTo; }

    public String getPrevCertificateNo() { return prevCertificateNo; }
    public void setPrevCertificateNo(String prevCertificateNo) { this.prevCertificateNo = prevCertificateNo; }

    public String getCurrentCertificateNo() { return currentCertificateNo; }
    public void setCurrentCertificateNo(String currentCertificateNo) { this.currentCertificateNo = currentCertificateNo; }

    public String getCasteCertificate() { return casteCertificate; }
    public void setCasteCertificate(String casteCertificate) { this.casteCertificate = casteCertificate; }

    public String getAadharCard() { return aadharCard; }
    public void setAadharCard(String aadharCard) { this.aadharCard = aadharCard; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public ConcessionType getConcessionType() { return concessionType; }
    public void setConcessionType(ConcessionType concessionType) { this.concessionType = concessionType; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDate getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDate validUntil) { this.validUntil = validUntil; }

    public Boolean getOverrideAllowed() { return overrideAllowed; }
    public void setOverrideAllowed(Boolean overrideAllowed) { this.overrideAllowed = overrideAllowed; }

    public LocalDateTime getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDateTime applicationDate) { this.applicationDate = applicationDate; }

    public LocalDateTime getApproveDate() { return approveDate; }
    public void setApproveDate(LocalDateTime approveDate) { this.approveDate = approveDate; }

    public LocalDateTime getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDateTime issueDate) { this.issueDate = issueDate; }
}