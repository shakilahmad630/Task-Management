package com.taskapp.backend.service;

import com.taskapp.backend.dto.TaskRequestDTO;
import com.taskapp.backend.entity.Task;
import com.taskapp.backend.entity.User;
import com.taskapp.backend.repository.TaskRepository;
import com.taskapp.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class TaskService {

    @Autowired
    private TaskRepository taskRepo;

    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private ActivityService activityService;


    public Task create(TaskRequestDTO request, String email) {
        User user = userRepo.findByEmail(email).get();

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setCreatedDate(LocalDateTime.now());
        
        if (request.getAssignedToEmail() != null && !request.getAssignedToEmail().trim().isEmpty() && "ADMIN".equals(user.getRole())) {
            User assignedUser = userRepo.findByEmail(request.getAssignedToEmail().trim()).orElse(user);
            task.setUser(assignedUser);
        } else {
            task.setUser(user);
        }

        return taskRepo.save(task);
    }


    public Page<Task> getTasks(String email, String status, String search, int page, int size) {
        User user = userRepo.findByEmail(email).get();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());

        boolean isAdmin = "ADMIN".equals(user.getRole());

        if (search != null && !search.isEmpty()) {
            return isAdmin 
                ? taskRepo.findByTitleContainingIgnoreCase(search, pageable)
                : taskRepo.findByUserIdAndTitleContainingIgnoreCase(user.getId(), search, pageable);
        }

        if (status != null && !status.isEmpty()) {
            return isAdmin
                ? taskRepo.findByStatus(status, pageable)
                : taskRepo.findByUserIdAndStatus(user.getId(), status, pageable);
        }

        return isAdmin
            ? taskRepo.findAll(pageable)
            : taskRepo.findByUserId(user.getId(), pageable);
    }


    public Task getById(Long id, String email) {
        Task task = taskRepo.findById(id).orElseThrow();
        User user = userRepo.findByEmail(email).get();
        boolean isAdmin = "ADMIN".equals(user.getRole());

        if (!isAdmin && !task.getUser().getEmail().equals(email))
            throw new RuntimeException("Not allowed");

        return task;
    }

    public Task update(Long id, TaskRequestDTO request, String email) {
        Task task = getById(id, email);
        User requestingUser = userRepo.findByEmail(email).get();
        
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

        if (request.getAssignedToEmail() != null && !request.getAssignedToEmail().trim().isEmpty() && "ADMIN".equals(requestingUser.getRole())) {
            userRepo.findByEmail(request.getAssignedToEmail().trim()).ifPresent(task::setUser);
        }

        return taskRepo.save(task);
    }

    public void delete(Long id, String email) {
        Task task = getById(id, email);
        activityService.deleteActivitiesForTask(id);
        taskRepo.delete(task);
    }
}