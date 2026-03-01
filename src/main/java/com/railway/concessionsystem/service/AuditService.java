package com.railway.concessionsystem.service;

import com.railway.concessionsystem.model.AuditLog;
import com.railway.concessionsystem.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditRepository;

    public void log(String actor, String action, String details) {

        AuditLog log = new AuditLog();
        log.setActor(actor);
        log.setAction(action);
        log.setDetails(details);

        auditRepository.save(log);
    }
}