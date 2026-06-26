package com.taskapp.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequestDTO {

    @NotBlank
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate dueDate;
    private String assignedToEmail;


}