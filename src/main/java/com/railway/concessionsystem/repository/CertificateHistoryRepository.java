package com.railway.concessionsystem.repository;

import com.railway.concessionsystem.model.CertificateHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CertificateHistoryRepository
        extends JpaRepository<CertificateHistory, Long> {

    List<CertificateHistory> findByApplication_Student_IdOrderByIssueDateDesc(String studentId);
}