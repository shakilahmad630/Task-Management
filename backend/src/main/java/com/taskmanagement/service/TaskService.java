package com.taskmanagement.service;

import com.taskmanagement.dto.TaskRequest;
import com.taskmanagement.model.*;
import com.taskmanagement.repository.TaskRepository;
import com.taskmanagement.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public Page<Task> getAll(String search, TaskStatus status, int page, int size, String sortBy, String sortOrder) {
        Sort sort = Sort.by(
                "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy != null ? sortBy : "createdAt"
        );
        Pageable pageable = PageRequest.of(page, size, sort);

        if (search != null || status != null) {
            return taskRepository.searchTasks(search, status, pageable);
        }
        return taskRepository.findAll(pageable);
    }

    public Task getById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @Transactional
    public Task create(TaskRequest request, User currentUser) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO);
        task.setPriority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM);
        task.setDueDate(request.getDueDate());
        task.setCreatedBy(currentUser);

        if (request.getAssignedToEmail() != null) {
            User assigned = userRepository.findByEmail(request.getAssignedToEmail())
                    .orElseThrow(() -> new RuntimeException("User not found: " + request.getAssignedToEmail()));
            task.setAssignedTo(assigned);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public Task update(Long id, TaskRequest request) {
        Task task = getById(id);

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getAssignedToEmail() != null) {
            User assigned = userRepository.findByEmail(request.getAssignedToEmail())
                    .orElseThrow(() -> new RuntimeException("User not found: " + request.getAssignedToEmail()));
            task.setAssignedTo(assigned);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public void delete(Long id) {
        Task task = getById(id);
        taskRepository.delete(task);
    }

    public long countByStatus(TaskStatus status) {
        return taskRepository.countByStatus(status);
    }
}
