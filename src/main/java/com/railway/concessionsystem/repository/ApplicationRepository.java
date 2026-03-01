package com.railway.concessionsystem.repository;

import com.railway.concessionsystem.model.Application;
import com.railway.concessionsystem.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // ===============================
    // BASIC STUDENT QUERIES
    // ===============================

    List<Application> findByStudent_Id(String studentId);

    List<Application> findByStudent_IdAndStatus(
            String studentId,
            ApplicationStatus status
    );

    Optional<Application> findByStudent_IdAndStatusAndValidUntilAfter(
            String studentId,
            ApplicationStatus status,
            LocalDate date
    );

    // ===============================
    // STATUS QUERIES
    // ===============================

    List<Application> findByStatus(ApplicationStatus status);

    long countByStatus(ApplicationStatus status);

    // ===============================
    // CERTIFICATE RANGE FILTER
    // ===============================
    boolean existsByCurrentCertificateNo(String certificateNo);
    List<Application> findByCurrentCertificateNoBetween(
            String startCertificate,
            String endCertificate
    );

    // ===============================
    // DEPARTMENT FILTERING
    // ===============================

    List<Application> findByStudent_Department(String department);

    List<Application> findByStudent_DepartmentIn(List<String> departments);

    // Distinct departments
    @Query("SELECT DISTINCT a.student.department FROM Application a WHERE a.student.department IS NOT NULL")
    List<String> findAllDistinctDepartments();

}