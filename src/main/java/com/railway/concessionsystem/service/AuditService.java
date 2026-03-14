package com.railway.concessionsystem.service;

import com.railway.concessionsystem.model.AuditLog;
import com.railway.concessionsystem.repository.AuditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    @Autowired
    private AuditRepository auditRepository;

    public void log(String action,
                    String performedBy,
                    String entityType,
                    String entityId,
                    String details) {

        AuditLog log = new AuditLog(
                action,
                performedBy,
                entityType,
                entityId,
                details
        );

        auditRepository.save(log);
    }
}