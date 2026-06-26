package com.taskapp.backend.controller;


import com.taskapp.backend.Utility.Constants;
import com.taskapp.backend.dto.AuthResponseDTO;
import com.taskapp.backend.dto.LoginRequestDTO;
import com.taskapp.backend.dto.Response;
import com.taskapp.backend.dto.SignupRequestDTO;
import com.taskapp.backend.entity.User;
import com.taskapp.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/signup")
    public Response signup(@RequestBody @Valid SignupRequestDTO request) {
        User user = service.signup(request);
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("User registered successfully")
                .data(user)
                .build();
    }

    @PostMapping("/login")
    public Response login(@RequestBody LoginRequestDTO request) {
        AuthResponseDTO authResponse = service.login(request);
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("Login successful")
                .data(authResponse)
                .build();
    }


}