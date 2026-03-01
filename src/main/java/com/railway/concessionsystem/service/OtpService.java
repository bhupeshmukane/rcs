package com.railway.concessionsystem.service;

import com.railway.concessionsystem.model.Student;
import com.railway.concessionsystem.model.StudentOtp;
import com.railway.concessionsystem.repository.StudentOtpRepository;
import com.railway.concessionsystem.repository.StudentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class OtpService {

    @Autowired
    private StudentOtpRepository otpRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EmailService emailService;

    public void generateAndSendOtp(String studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);

        StudentOtp studentOtp = new StudentOtp();
        studentOtp.setStudentId(studentId);
        studentOtp.setOtpCode(otp);
        studentOtp.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        studentOtp.setVerified(false);

        otpRepository.save(studentOtp);

        emailService.sendOtpEmail(student.getEmail(), otp);
    }

    public boolean verifyOtp(String studentId, String otpCode) {

        StudentOtp latestOtp = otpRepository
                .findTopByStudentIdOrderByIdDesc(studentId)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (latestOtp.getVerified())
            return false;

        if (latestOtp.getExpiryTime().isBefore(LocalDateTime.now()))
            return false;

        if (!latestOtp.getOtpCode().equals(otpCode))
            return false;

        latestOtp.setVerified(true);
        otpRepository.save(latestOtp);

        return true;
    }
}