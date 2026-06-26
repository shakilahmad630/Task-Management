package com.taskapp.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long taskId;
    
    private String action; // created, updated, status_changed, deleted, file_uploaded
    
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String changesJson; // Store the diff JSON here

    private String userName;
    
    private String userInitials;
    
    private LocalDateTime createdAt;
}
