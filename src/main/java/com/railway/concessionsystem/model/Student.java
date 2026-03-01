package com.railway.concessionsystem.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "student")
@Data
public class Student {
    
    @Id
    @Column(length = 20)
    private String id; // College ID (e.g., TU4F2222016)
    
    @NotNull
    private String name;
    
    @NotNull
    private LocalDate dob;
    
    @Email
    @NotNull
    @Column(unique = true)
    private String email;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_drop_year")
    private Boolean isDropYear = false;

    public Boolean getIsActive() {
    return isActive;
}

public void setIsActive(Boolean isActive) {
    this.isActive = isActive;
}

public Boolean getIsDropYear() {
    return isDropYear;
}

public void setIsDropYear(Boolean isDropYear) {
    this.isDropYear = isDropYear;
}
    
    private String password; // Hashed password (null initially)
    
    private String category; // SC/ST or null for general students

    @Column(nullable = false)
    private String department;

    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference // Add this annotation
    private List<Application> applications;
}