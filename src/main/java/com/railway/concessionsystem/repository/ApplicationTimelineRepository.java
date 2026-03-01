package com.railway.concessionsystem.repository;

import com.railway.concessionsystem.model.ApplicationTimeline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationTimelineRepository
        extends JpaRepository<ApplicationTimeline, Long> {

    List<ApplicationTimeline> findByApplication_AppIdOrderByActionTimeAsc(Long appId);
}