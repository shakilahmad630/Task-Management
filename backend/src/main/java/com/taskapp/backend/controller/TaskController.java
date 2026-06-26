package com.taskapp.backend.controller;

import com.taskapp.backend.Utility.Constants;
import com.taskapp.backend.dto.Response;
import com.taskapp.backend.dto.TaskRequestDTO;
import com.taskapp.backend.entity.Task;
import com.taskapp.backend.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    @Autowired
    private TaskService service;

    @PostMapping("/create")
    public Response create(@RequestBody TaskRequestDTO request, Authentication auth) {
        Task task = service.create(request, auth.getName());
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("Task created successfully")
                .data(task)
                .build();
    }

    @GetMapping("/getAll")
    public Response getAll(Authentication auth,
                           @RequestParam(required = false) String status,
                           @RequestParam(required = false) String search,
                           @RequestParam(defaultValue = "0") int page,
                           @RequestParam(defaultValue = "10") int size) {

        Page<Task> tasks = service.getTasks(auth.getName(), status, search, page, size);
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("Task list fetched successfully")
                .data(tasks)
                .build();
    }

    @GetMapping("/get/{id}")
    public Response get(@PathVariable Long id, Authentication auth) {
        Task task = service.getById(id, auth.getName());
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("Task fetched successfully")
                .data(task)
                .build();
    }

    @PatchMapping("/update/{id}")
    public Response update(@PathVariable Long id,
                           @RequestBody TaskRequestDTO request,
                           Authentication auth) {
        Task task = service.update(id, request, auth.getName());
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("Task updated successfully")
                .data(task)
                .build();
    }

    @DeleteMapping("/delete/{id}")
    public Response delete(@PathVariable Long id, Authentication auth) {
        service.delete(id, auth.getName());
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("Task deleted successfully")
                .build();
    }
}