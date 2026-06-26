package com.taskapp.backend.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.*;


@Entity
@Data
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotNull(message = "Created date is required")
    private LocalDateTime createdDate;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

}