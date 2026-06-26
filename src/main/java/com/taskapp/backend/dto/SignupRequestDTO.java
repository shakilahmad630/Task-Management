package com.taskapp.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequestDTO {
    @NotBlank
    private String name;
    @Email
    private String email;
    @NotBlank
    private String password;


}