package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.AuditLog;
import com.railway.concessionsystem.repository.AuditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class AuditController {

    @Autowired
    private AuditRepository auditRepository;

    @GetMapping
    public List<AuditLog> getAllLogs() {
        return auditRepository.findAllByOrderByTimestampDesc();
    }
}