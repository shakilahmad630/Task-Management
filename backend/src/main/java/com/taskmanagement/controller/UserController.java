package com.taskmanagement.controller;

import com.taskmanagement.dto.ApiResponse;
import com.taskmanagement.dto.UserUpdateRequest;
import com.taskmanagement.model.User;
import com.taskmanagement.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<User> users = userService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        try {
            User user = userService.update(id, request);
            return ResponseEntity.ok(ApiResponse.ok("User updated", user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            userService.delete(id);
            return ResponseEntity.ok(ApiResponse.ok("User deleted", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }
}
