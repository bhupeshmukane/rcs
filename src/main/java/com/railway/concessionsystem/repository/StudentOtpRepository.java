package com.railway.concessionsystem.repository;

import com.railway.concessionsystem.model.StudentOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentOtpRepository extends JpaRepository<StudentOtp, Long> {

    Optional<StudentOtp> findTopByStudentIdOrderByIdDesc(String studentId);
}