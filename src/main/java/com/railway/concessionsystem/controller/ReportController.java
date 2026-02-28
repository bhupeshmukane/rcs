package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Application;
import com.railway.concessionsystem.model.Staff;
import com.railway.concessionsystem.repository.ApplicationRepository;
import com.railway.concessionsystem.repository.StaffRepository;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.StringWriter;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StaffRepository staffRepository;

    // ==========================
    // Generate CSV report (DEPARTMENT FILTERED)
    // ==========================
    @GetMapping("/applications/csv")
    public ResponseEntity<String> generateApplicationsCSV(HttpSession session) {

        if (session.getAttribute("userRole") == null) {
            return ResponseEntity.status(401).body("Login required");
        }


        // 1️⃣ Logged-in staff
        String email = (String) session.getAttribute("staffEmail");
        String department = (String) session.getAttribute("staffDepartment");
        String role = (String) session.getAttribute("userRole");

        if (email == null || !"staff".equals(role)) {
           return ResponseEntity.status(401).body("Unauthorized access");
        }

        Staff staff = staffRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Staff not found"));


        // 2️⃣ Allowed departments mapping
        List<String> allowedDepartments;

        if ("IT".equalsIgnoreCase(staff.getDepartment())) {
            allowedDepartments = List.of("FEIT", "SEIT", "TEIT", "BEIT");
        } else if ("MECH".equalsIgnoreCase(staff.getDepartment())) {
            allowedDepartments = List.of("FEMECH", "SEMECH", "TEMECH", "BEMECH");
        } else {
            throw new RuntimeException("Unsupported staff department");
        }

        // 3️⃣ Fetch ONLY allowed applications
        List<Application> applications =
                applicationRepository.findByStudent_DepartmentIn(allowedDepartments);

        // 4️⃣ Build CSV
        StringWriter csvWriter = new StringWriter();
        csvWriter.append(
            "Application ID,Student ID,Student Name,Department,Route From,Route To,Status,Certificate No,Application Date\n"
        );

        for (Application app : applications) {
            csvWriter.append(String.valueOf(app.getAppId())).append(",");
            csvWriter.append(app.getStudent().getId()).append(",");
            csvWriter.append(escapeCsv(app.getStudentName())).append(",");
            csvWriter.append(app.getStudent().getDepartment()).append(",");
            csvWriter.append(escapeCsv(app.getRouteFrom())).append(",");
            csvWriter.append(escapeCsv(app.getRouteTo())).append(",");
            csvWriter.append(app.getStatus().toString()).append(",");
            csvWriter.append(
                app.getCurrentCertificateNo() != null ? app.getCurrentCertificateNo() : ""
            ).append(",");
            csvWriter.append(app.getApplicationDate().toString()).append("\n");
        }

        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=applications.csv")
                .body(csvWriter.toString());
    }

    // CSV safety
    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
