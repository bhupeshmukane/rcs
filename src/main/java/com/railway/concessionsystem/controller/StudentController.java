package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Student;
import com.railway.concessionsystem.repository.StudentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.railway.concessionsystem.service.AuditService;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AuditService auditService;

    // ==============================
    // GET ALL STUDENTS
    // ==============================
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // ==============================
    // GET STUDENT BY ID
    // ==============================
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable String id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
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

        studentRepository.save(student);

        return ResponseEntity.ok(student);
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
}