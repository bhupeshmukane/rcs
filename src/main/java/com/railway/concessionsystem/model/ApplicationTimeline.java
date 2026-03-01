package com.railway.concessionsystem.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "application_timeline")
public class ApplicationTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "app_id", nullable = false)
    private Application application;

    @Column(nullable = false)
    private String action;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "action_time")
    private LocalDateTime actionTime;

    public ApplicationTimeline() {}

    public ApplicationTimeline(Application application,
                               String action,
                               String remarks) {
        this.application = application;
        this.action = action;
        this.remarks = remarks;
        this.actionTime = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public Application getApplication() { return application; }
    public String getAction() { return action; }
    public String getRemarks() { return remarks; }
    public LocalDateTime getActionTime() { return actionTime; }

    public void setApplication(Application application) { this.application = application; }
    public void setAction(String action) { this.action = action; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public void setActionTime(LocalDateTime actionTime) { this.actionTime = actionTime; }
}