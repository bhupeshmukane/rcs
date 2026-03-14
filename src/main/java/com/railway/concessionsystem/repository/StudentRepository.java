package com.railway.concessionsystem.repository;

import com.railway.concessionsystem.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    Optional<Student> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Student> findByIdAndDob(String id, LocalDate dob);
    List<Student> findByNameContainingOrEmailContaining(String name, String email);
    List<Student> findByDepartmentAndYear(String department, String year);
}