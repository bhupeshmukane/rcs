package com.railway.concessionsystem.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    private String id; // College ID (example: TU4F2222016)

    @NotNull
    @Column(nullable = false)
    private String name;

    @Column(name = "dob")
    private LocalDate dob;

    @Email
    @NotNull
    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "gender")
    private String gender;

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "year", nullable = false)
    private String year;

    @Column(name = "category")
    private String category; // SC/ST/General

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_drop_year")
    private Boolean isDropYear = false;

    // Optional fields useful for printing
    @Column(name = "home_station")
    private String homeStation;

    @Column(name = "college_station")
    private String collegeStation;

    @Column(name = "phone")
    private String phone;

    @Transient
    private String password; // used only during login, not stored

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Application> applications;
}