package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Staff;
import com.railway.concessionsystem.model.Student;
import com.railway.concessionsystem.repository.StaffRepository;
import com.railway.concessionsystem.repository.StudentRepository;
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

    // ===============================
    // STUDENT LOGIN
    // ===============================
    @PostMapping("/student/login")
    public ResponseEntity<?> studentLogin(@RequestBody Map<String, String> credentials,
                                          HttpServletRequest request) {

        String studentId = credentials.get("studentId");
        String dobString = credentials.get("dob");

        try {
            LocalDate dob = LocalDate.parse(dobString);
            Optional<Student> student = studentRepository.findById(studentId);

            if (student.isPresent() && student.get().getDob().equals(dob)) {

                // 🔐 regenerate session
                HttpSession oldSession = request.getSession(false);
                if (oldSession != null) oldSession.invalidate();

                HttpSession session = request.getSession(true);
                session.setAttribute("studentId", studentId);
                session.setAttribute("userRole", "student");

                return ResponseEntity.ok(Map.of(
                        "message", "Login successful",
                        "student", student.get(),
                        "role", "student"
                ));
            }

            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid student ID or date of birth"));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid date format"));
        }
    }

    // ===============================
    // STAFF LOGIN
    // ===============================
    @PostMapping("/staff/login")
    public ResponseEntity<?> staffLogin(@RequestBody Map<String, String> credentials,
                                        HttpServletRequest request) {

        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<Staff> staff = staffRepository.findByEmail(email);

        if (staff.isPresent() &&
                passwordEncoder.matches(password, staff.get().getPassword())) {

            // 🔐 regenerate session
            HttpSession oldSession = request.getSession(false);
            if (oldSession != null) oldSession.invalidate();

            HttpSession session = request.getSession(true);

            session.setAttribute("staffEmail", email);
            session.setAttribute("staffId", staff.get().getId());
            session.setAttribute("staffName", staff.get().getName());
            session.setAttribute("staffDepartment", staff.get().getDepartment());
            session.setAttribute("userRole", "staff");

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("staff", staff.get());
            response.put("role", "staff");

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401)
                .body(Map.of("error", "Invalid email or password"));
    }

    // ===============================
    // LOGOUT (FIXED)
    // ===============================
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request,
                                    HttpServletResponse response) {

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // 🔴 remove JSESSIONID cookie
        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    // ===============================
    // SESSION CHECK
    // ===============================
    @GetMapping("/check-session")
public ResponseEntity<?> checkSession(HttpServletRequest request) {

    HttpSession session = request.getSession(false); // do NOT create new

    Map<String, Object> response = new HashMap<>();

    if (session == null) {
        response.put("isAuthenticated", false);
        response.put("userRole", null);
        response.put("staffEmail", null);
        response.put("studentId", null);
        response.put("sessionId", null);
        return ResponseEntity.ok(response);
    }

    String staffEmail = (String) session.getAttribute("staffEmail");
    String studentId = (String) session.getAttribute("studentId");
    String userRole = (String) session.getAttribute("userRole");

    response.put("isAuthenticated", staffEmail != null || studentId != null);
    response.put("userRole", userRole);
    response.put("staffEmail", staffEmail);
    response.put("studentId", studentId);
    response.put("sessionId", session.getId());

    return ResponseEntity.ok(response);
}


    // ===============================
    // STUDENT REGISTER
    // ===============================
    @PostMapping("/student/register")
    public ResponseEntity<?> studentRegister(@RequestBody Student student) {

        try {
            if (studentRepository.existsById(student.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Student ID exists"));
            }

            if (studentRepository.existsByEmail(student.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email exists"));
            }

            Student savedStudent = studentRepository.save(student);

            return ResponseEntity.ok(Map.of(
                    "message", "Registration successful",
                    "student", savedStudent
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Registration failed"));
        }
    }
}
