package com.taskmanagement.repository;

import com.taskmanagement.model.Task;
import com.taskmanagement.model.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findAll(Pageable pageable);

    Page<Task> findByStatus(TaskStatus status, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR t.status = :status)")
    Page<Task> searchTasks(@Param("search") String search,
                           @Param("status") TaskStatus status,
                           Pageable pageable);

    long countByStatus(TaskStatus status);
}
