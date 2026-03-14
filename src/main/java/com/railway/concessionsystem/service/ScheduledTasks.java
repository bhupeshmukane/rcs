package com.railway.concessionsystem.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {

    @Autowired
    private ApplicationService applicationService;

    @Scheduled(cron = "0 0 1 * * ?") // Run every day at 1 AM
    public void expireConcessions() {
        applicationService.expireOldConcessions();
    }
}
