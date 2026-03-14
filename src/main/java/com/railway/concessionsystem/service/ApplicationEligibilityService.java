package com.railway.concessionsystem.service;

import com.railway.concessionsystem.model.Application;
import com.railway.concessionsystem.model.ApplicationStatus;
import com.railway.concessionsystem.model.Student;
import com.railway.concessionsystem.repository.ApplicationRepository;
import com.railway.concessionsystem.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ApplicationEligibilityService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public Map<String, Object> checkEligibility(String studentId) {

        Map<String, Object> response = new HashMap<>();

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // 1️⃣ Active check
        if (!Boolean.TRUE.equals(student.getIsActive())) {
            response.put("canApply", false);
            response.put("reason", "Account is deactivated");
            return response;
        }

        // 2️⃣ Drop year check
        if (Boolean.TRUE.equals(student.getIsDropYear())) {
            response.put("canApply", false);
            response.put("reason", "Drop year students not eligible");
            return response;
        }

        // 3️⃣ Pending check
        List<Application> pendingApps =
                applicationRepository.findByStudent_IdAndStatus(
                        studentId,
                        ApplicationStatus.PENDING
                );

        if (!pendingApps.isEmpty()) {
            response.put("canApply", false);
            response.put("reason", "You already have a pending application");
            return response;
        }

        // 4️⃣ Approved but valid check
        Optional<Application> activeApproval =
                applicationRepository.findByStudent_IdAndStatusAndValidUntilAfter(
                        studentId,
                        ApplicationStatus.APPROVED,
                        LocalDate.now()
                );

        if (activeApproval.isPresent()
                && !Boolean.TRUE.equals(activeApproval.get().getOverrideAllowed())) {

            response.put("canApply", false);
            response.put("reason", "Concession active till "
                    + activeApproval.get().getValidUntil());
            response.put("nextEligibleDate",
                    activeApproval.get().getValidUntil().plusDays(1));
            return response;
        }

        response.put("canApply", true);
        return response;
    }
}