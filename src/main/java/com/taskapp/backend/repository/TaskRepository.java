package com.taskapp.backend.repository;

import com.taskapp.backend.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task,Long> {

    Page<Task> findByUserId(Long id, Pageable pageable);
    Page<Task> findByUserIdAndStatus(Long id, String status, Pageable pageable);
    Page<Task> findByUserIdAndTitleContainingIgnoreCase(Long id, String title, Pageable pageable);

    Page<Task> findByStatus(String status, Pageable pageable);
    Page<Task> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @Modifying
    @Transactional
    void deleteByUserId(Long userId);

}