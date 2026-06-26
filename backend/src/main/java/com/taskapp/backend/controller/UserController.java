package com.taskapp.backend.controller;

import com.taskapp.backend.Utility.Constants;
import com.taskapp.backend.dto.Response;
import com.taskapp.backend.entity.User;
import com.taskapp.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public Response getAllUsers() {
        List<User> users = userService.getAllUsers();
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("User list fetched successfully")
                .data(users)
                .build();
    }

    @GetMapping("/{id}")
    public Response getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("User fetched successfully")
                .data(user)
                .build();
    }

    @PatchMapping("/{id}")
    public Response updateUser(@PathVariable Long id, @RequestBody User request) {
        User user = userService.updateUser(id, request);
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("User updated successfully")
                .data(user)
                .build();
    }

    @DeleteMapping("/{id}")
    public Response deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("User deleted successfully")
                .build();
    }
}
