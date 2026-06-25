package com.taskmanagement.dto;

import com.taskmanagement.model.Role;

public class UserUpdateRequest {

    private String name;

    private String email;

    private Role role;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
