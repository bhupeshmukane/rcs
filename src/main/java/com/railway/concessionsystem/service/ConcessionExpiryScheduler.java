package com.railway.concessionsystem.service;

import com.railway.concessionsystem.model.*;
import com.railway.concessionsystem.repository.ApplicationRepository;
import com.railway.concessionsystem.repository.ApplicationTimelineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ConcessionExpiryScheduler {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ApplicationTimelineRepository timelineRepository;

    @Autowired
    private AuditService auditService;

    // Runs every midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void expireConcessions() {

        LocalDate today = LocalDate.now();

        List<Application> expiredList =
                applicationRepository.findByStatusAndValidUntilBefore(
                        ApplicationStatus.ISSUED,
                        today
                );

        for (Application app : expiredList) {

            app.setStatus(ApplicationStatus.EXPIRED);
            applicationRepository.save(app);

            // timeline update
            timelineRepository.save(
                    new ApplicationTimeline(
                            app,
                            "EXPIRED",
                            "Concession automatically expired"
                    )
            );

            // audit log
            auditService.log(
                    "CONCESSION_EXPIRED",
                    "SYSTEM",
                    "APPLICATION",
                    String.valueOf(app.getAppId()),
                    "Concession expired automatically"
            );
        }

        System.out.println("Expired concessions processed: " + expiredList.size());
    }
}