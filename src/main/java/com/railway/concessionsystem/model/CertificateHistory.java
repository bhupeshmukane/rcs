package com.railway.concessionsystem.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class CertificateHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String certificateNo;

    private LocalDate issueDate;

    private LocalDate validUntil;

    private String status;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;

    public CertificateHistory() {
        this.createdAt = LocalDateTime.now();
    }

    public CertificateHistory(String certificateNo, LocalDate issueDate,
                              LocalDate validUntil, String status,
                              Application application) {
        this.certificateNo = certificateNo;
        this.issueDate = issueDate;
        this.validUntil = validUntil;
        this.status = status;
        this.application = application;
        this.createdAt = LocalDateTime.now();
    }

    // getters setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCertificateNo() {
        return certificateNo;
    }

    public void setCertificateNo(String certificateNo) {
        this.certificateNo = certificateNo;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(LocalDate validUntil) {
        this.validUntil = validUntil;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }
}