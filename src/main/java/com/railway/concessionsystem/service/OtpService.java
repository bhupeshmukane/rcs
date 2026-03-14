package com.railway.concessionsystem.service;

import com.railway.concessionsystem.model.Student;
import com.railway.concessionsystem.model.StudentOtp;
import com.railway.concessionsystem.repository.StudentOtpRepository;
import com.railway.concessionsystem.repository.StudentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class OtpService {

    @Autowired
    private StudentOtpRepository otpRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EmailService emailService;

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 30;

    private final SecureRandom secureRandom = new SecureRandom();

    // =====================================================
    // GENERATE OTP
    // =====================================================
    public void generateAndSendOtp(String studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getEmail() == null || student.getEmail().isBlank()) {
            throw new RuntimeException("Student email not found");
        }

        // 🔒 Prevent rapid resend
        Optional<StudentOtp> latestOtpOpt =
                otpRepository.findTopByStudentIdOrderByIdDesc(studentId);

        if (latestOtpOpt.isPresent()) {
            StudentOtp latest = latestOtpOpt.get();

            long secondsSinceLast =
                    ChronoUnit.SECONDS.between(
                            latest.getCreatedAt(),
                            LocalDateTime.now()
                    );

            if (secondsSinceLast < RESEND_COOLDOWN_SECONDS) {
                throw new RuntimeException(
                        "Please wait " +
                        (RESEND_COOLDOWN_SECONDS - secondsSinceLast) +
                        " seconds before requesting new OTP"
                );
            }
        }

        // 🔐 Secure OTP generation
        String otp = String.valueOf(100000 + secureRandom.nextInt(900000));

        StudentOtp studentOtp = new StudentOtp();
        studentOtp.setStudentId(studentId);
        studentOtp.setOtpCode(otp);
        studentOtp.setExpiryTime(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        studentOtp.setVerified(false);
        studentOtp.setCreatedAt(LocalDateTime.now());

        otpRepository.save(studentOtp);

        // 📧 Send to registered student email
        emailService.sendOtpEmail(student.getEmail(), otp);
    }

    // =====================================================
    // VERIFY OTP
    // =====================================================
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
