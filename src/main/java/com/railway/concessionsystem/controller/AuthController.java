package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Staff;
import com.railway.concessionsystem.model.Student;
import com.railway.concessionsystem.repository.StaffRepository;
import com.railway.concessionsystem.repository.StudentRepository;
import com.railway.concessionsystem.service.OtpService;

import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OtpService otpService;

    // =========================================================
    // 1️⃣ STUDENT REQUEST OTP (DOB VERIFIED FIRST)
    // =========================================================
    @PostMapping("/student/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> request) {

        String studentId = request.get("studentId");
        String dobString = request.get("dob");

        try {
            LocalDate dob = LocalDate.parse(dobString);

            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            if (!student.getDob().equals(dob)) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Invalid DOB"));
            }

            otpService.generateAndSendOtp(studentId);

            return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid request"));
        }
    }

    // =========================================================
    // 2️⃣ STUDENT VERIFY OTP (FINAL LOGIN)
    // =========================================================
    @PostMapping("/student/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request,
                                       HttpServletRequest httpRequest) {

        String studentId = request.get("studentId");
        String otp = request.get("otp");

        boolean valid = otpService.verifyOtp(studentId, otp);

        if (!valid) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid or expired OTP"));
        }

        // Regenerate session
        HttpSession oldSession = httpRequest.getSession(false);
        if (oldSession != null) oldSession.invalidate();

        HttpSession session = httpRequest.getSession(true);

        session.setAttribute("studentId", studentId);
        session.setAttribute("userRole", "student");

        Student student = studentRepository.findById(studentId).get();

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "student", student,
                "role", "student"
        ));
    }

    // =========================================================
    // 3️⃣ STAFF LOGIN
    // =========================================================
    @PostMapping("/staff/login")
    public ResponseEntity<?> staffLogin(@RequestBody Map<String, String> credentials,
                                        HttpServletRequest request) {

        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<Staff> staff = staffRepository.findByEmail(email);

        if (staff.isPresent() &&
                passwordEncoder.matches(password, staff.get().getPassword())) {

            HttpSession oldSession = request.getSession(false);
            if (oldSession != null) oldSession.invalidate();

            HttpSession session = request.getSession(true);

            session.setAttribute("staffEmail", email);
            session.setAttribute("staffId", staff.get().getId());
            session.setAttribute("staffDepartment", staff.get().getDepartment());
            session.setAttribute("userRole", "staff");

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "staff", staff.get(),
                    "role", "staff"
            ));
        }

        return ResponseEntity.status(401)
                .body(Map.of("error", "Invalid email or password"));
    }

    // =========================================================
    // 4️⃣ GET CURRENT USER (FOR FRONTEND AUTO LOGIN)
    // =========================================================
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Not authenticated"));
        }

        String role = (String) session.getAttribute("userRole");

        if ("student".equals(role)) {
            String studentId = (String) session.getAttribute("studentId");
            Student student = studentRepository.findById(studentId).orElse(null);

            return ResponseEntity.ok(Map.of(
                    "user", student,
                    "role", "student"
            ));
        }

        if ("staff".equals(role)) {
            String email = (String) session.getAttribute("staffEmail");
            Staff staff = staffRepository.findByEmail(email).orElse(null);

            return ResponseEntity.ok(Map.of(
                    "user", staff,
                    "role", "staff"
            ));
        }

        return ResponseEntity.status(401)
                .body(Map.of("error", "Not authenticated"));
    }

    // =========================================================
    // 5️⃣ LOGOUT
    // =========================================================
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request,
                                    HttpServletResponse response) {

        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();

        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }
}