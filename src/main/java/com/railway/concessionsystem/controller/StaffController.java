package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Staff;
import com.railway.concessionsystem.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
//import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class StaffController {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==========================
    // Get all staff members (ADMIN – secured)
    // ==========================
    @GetMapping
    public ResponseEntity<?> getAllStaff(Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        // (Future) admin role check can be added here
        return ResponseEntity.ok(staffRepository.findAll());
    }

    // ==========================
    // Get staff by ID (secured)
    // ==========================
    @GetMapping("/{id}")
    public ResponseEntity<?> getStaffById(
            @PathVariable Integer id,
            Principal principal
    ) {

        if (principal == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        Optional<Staff> staff = staffRepository.findById(id);
        return staff.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================
    // Create new staff (ADMIN – secured)
    // ==========================
    @PostMapping
    public ResponseEntity<?> createStaff(
            @RequestBody Staff staff,
            Principal principal
    ) {

        if (principal == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        try {
            if (staffRepository.existsByEmail(staff.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email already registered"));
            }

            if (staff.getDepartment() == null || staff.getDepartment().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Department is required"));
            }

            staff.setPassword(passwordEncoder.encode(staff.getPassword()));
            Staff savedStaff = staffRepository.save(staff);
            return ResponseEntity.ok(savedStaff);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to create staff: " + e.getMessage()));
        }
    }

    // ==========================
    // Update staff (secured)
    // ==========================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(
            @PathVariable Integer id,
            @RequestBody Staff staffDetails,
            Principal principal
    ) {

        if (principal == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        Optional<Staff> staffOptional = staffRepository.findById(id);

        if (staffOptional.isPresent()) {
            Staff staff = staffOptional.get();

            if (staffDetails.getName() != null) {
                staff.setName(staffDetails.getName());
            }

            if (staffDetails.getEmail() != null &&
                    !staffDetails.getEmail().equals(staff.getEmail())) {

                if (staffRepository.existsByEmail(staffDetails.getEmail())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Email already in use"));
                }
                staff.setEmail(staffDetails.getEmail());
            }

            if (staffDetails.getPassword() != null &&
                    !staffDetails.getPassword().isEmpty()) {
                staff.setPassword(passwordEncoder.encode(staffDetails.getPassword()));
            }

            if (staffDetails.getDepartment() != null) {
                staff.setDepartment(staffDetails.getDepartment());
            }

            Staff updatedStaff = staffRepository.save(staff);
            return ResponseEntity.ok(updatedStaff);
        }

        return ResponseEntity.notFound().build();
    }

    // ==========================
    // Delete staff (ADMIN – secured)
    // ==========================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(
            @PathVariable Integer id,
            Principal principal
    ) {

        if (principal == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        if (staffRepository.existsById(id)) {
            staffRepository.deleteById(id);
            return ResponseEntity.ok(
                    Map.of("message", "Staff deleted successfully")
            );
        }

        return ResponseEntity.notFound().build();
    }

    // ==========================
    // Get staff by email (secured)
    // ==========================
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getStaffByEmail(
            @PathVariable String email,
            Principal principal
    ) {

        if (principal == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        Optional<Staff> staff = staffRepository.findByEmail(email);
        return staff.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
