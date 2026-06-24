package com.taskapp.backend.repository;

import com.taskapp.backend.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByTaskIdOrderByCreatedAtDesc(Long taskId);
    List<Activity> findAllByOrderByCreatedAtDesc();
    List<Activity> findByUserNameOrderByCreatedAtDesc(String userName);
    @Transactional
    @Modifying
    void deleteByTaskId(Long taskId);
}
