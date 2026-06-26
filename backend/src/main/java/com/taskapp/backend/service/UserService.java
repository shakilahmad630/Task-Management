package com.taskapp.backend.service;

import com.taskapp.backend.entity.User;
import com.taskapp.backend.repository.UserRepository;
import com.taskapp.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUser(Long id, User details) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Prevent changing own email/role to avoid lockout if needed, 
        // but let's allow it as a generic admin capability.
        if (details.getName() != null && !details.getName().trim().isEmpty()) {
            user.setName(details.getName().trim());
        }
        if (details.getEmail() != null && !details.getEmail().trim().isEmpty()) {
            user.setEmail(details.getEmail().trim());
        }
        if (details.getRole() != null && !details.getRole().trim().isEmpty()) {
            user.setRole(details.getRole().trim());
        }
        
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        // Cascade delete tasks
        taskRepository.deleteByUserId(id);
        // Delete user
        userRepository.delete(user);
    }
}
