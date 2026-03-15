package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Student;
import com.railway.concessionsystem.model.Application;
import com.railway.concessionsystem.repository.StudentRepository;
import com.railway.concessionsystem.repository.ApplicationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.railway.concessionsystem.service.AuditService;
import java.util.Map;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private ApplicationRepository applicationRepository;

    // ==============================
    // GET ALL STUDENTS
    // ==============================
    @GetMapping
    public List<Map<String, Object>> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::toStudentSummary)
                .collect(Collectors.toList());
    }

    // ==============================
    // GET STUDENT BY ID
    // ==============================
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable String id) {
        return studentRepository.findById(id)
                .map(student -> {
                    List<Map<String, Object>> applications = applicationRepository.findByStudent_Id(id).stream()
                            .map(this::toApplicationSummary)
                            .collect(Collectors.toList());

                    return ResponseEntity.ok(toStudentWithApplications(student, applications));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==============================
    // UPDATE STUDENT
    // ==============================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(
            @PathVariable String id,
            @RequestBody Student updatedData) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (updatedData.getName() != null)
            student.setName(updatedData.getName());

        if (updatedData.getEmail() != null)
            student.setEmail(updatedData.getEmail());

        if (updatedData.getCategory() != null)
            student.setCategory(updatedData.getCategory());

        Student saved = studentRepository.save(student);

        return ResponseEntity.ok(toStudentSummary(saved));
    }

    // ==============================
    // TOGGLE ACTIVE STATUS
    // ==============================
    @PutMapping("/{id}/toggle-active")
public ResponseEntity<?> toggleActive(@PathVariable String id) {

    Student student = studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found"));

    boolean newStatus = !student.getIsActive();
    student.setIsActive(newStatus);
    studentRepository.save(student);

    auditService.log(
            "STUDENT_STATUS_TOGGLED",
            "STAFF",
            "STUDENT",
            id,
            "Active status changed to " + newStatus
    );

    return ResponseEntity.ok("Student status updated");
}

    // ==============================
    // TOGGLE DROP YEAR
    // ==============================
    @PutMapping("/{id}/toggle-drop-year")
    public ResponseEntity<?> toggleDropYear(@PathVariable String id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setIsDropYear(!student.getIsDropYear());
        studentRepository.save(student);

        return ResponseEntity.ok("Drop year updated");
    }

    // ==============================
    // DELETE SINGLE STUDENT
    // ==============================
    @DeleteMapping("/{id}")
public ResponseEntity<?> deleteStudent(@PathVariable String id) {

    if (!studentRepository.existsById(id)) {
        return ResponseEntity.notFound().build();
    }

    studentRepository.deleteById(id);

    

    return ResponseEntity.ok("Student deleted");
}
    // ==============================
    // BULK DELETE
    // ==============================
    @DeleteMapping("/bulk-delete")
public ResponseEntity<?> bulkDelete(@RequestBody List<String> ids) {

    studentRepository.deleteAllById(ids);

    

    return ResponseEntity.ok("Students deleted");
}

@DeleteMapping("/delete-by-year")
public ResponseEntity<?> deleteStudentsByYear(@RequestBody Map<String, Object> request) {

    String department = (String) request.get("department");
    String year = (String) request.get("year");

    List<Student> students = studentRepository.findByDepartmentAndYear(department, year);
     
    studentRepository.deleteAll(students);
    return ResponseEntity.ok(
        students.size() + " students from " + department + " year " + year 
    );
}

    private Map<String, Object> toStudentSummary(Student student) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", student.getId());
        payload.put("name", student.getName());
        payload.put("dob", student.getDob());
        payload.put("email", student.getEmail());
        payload.put("gender", student.getGender());
        payload.put("department", student.getDepartment());
        payload.put("year", student.getYear());
        payload.put("category", student.getCategory());
        payload.put("isActive", student.getIsActive());
        payload.put("isDropYear", student.getIsDropYear());
        payload.put("homeStation", student.getHomeStation());
        payload.put("collegeStation", student.getCollegeStation());
        payload.put("phone", student.getPhone());
        return payload;
    }

    private Map<String, Object> toStudentWithApplications(Student student,
                                                           List<Map<String, Object>> applications) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", student.getId());
        payload.put("name", student.getName());
        payload.put("dob", student.getDob());
        payload.put("email", student.getEmail());
        payload.put("gender", student.getGender());
        payload.put("department", student.getDepartment());
        payload.put("year", student.getYear());
        payload.put("category", student.getCategory());
        payload.put("isActive", student.getIsActive());
        payload.put("isDropYear", student.getIsDropYear());
        payload.put("homeStation", student.getHomeStation());
        payload.put("collegeStation", student.getCollegeStation());
        payload.put("phone", student.getPhone());
        payload.put("applications", applications);
        return payload;
    }

    private Map<String, Object> toApplicationSummary(Application application) {
        return Map.of(
                "appId", application.getAppId(),
                "status", application.getStatus(),
                "routeFrom", application.getRouteFrom(),
                "routeTo", application.getRouteTo(),
                "applicationDate", application.getApplicationDate(),
                "validUntil", application.getValidUntil(),
                "currentCertificateNo", application.getCurrentCertificateNo()
        );
    }
}