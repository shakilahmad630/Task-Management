package com.taskapp.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskapp.backend.dto.ActivityRequestDTO;
import com.taskapp.backend.entity.Activity;
import com.taskapp.backend.entity.User;
import com.taskapp.backend.repository.ActivityRepository;
import com.taskapp.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public Activity logActivity(ActivityRequestDTO request, String username) {
        User user = userRepository.findByEmail(username).orElse(null);
        String name = user != null ? user.getName() : username;
        
        String initials = "?";
        if (name != null && !name.isEmpty()) {
            String[] parts = name.split("[\\s@._-]+");
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < Math.min(2, parts.length); i++) {
                if (!parts[i].isEmpty()) {
                    sb.append(Character.toUpperCase(parts[i].charAt(0)));
                }
            }
            initials = sb.toString();
        }

        String changesJson = "[]";
        try {
            if (request.getChanges() != null) {
                changesJson = objectMapper.writeValueAsString(request.getChanges());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        Activity activity = Activity.builder()
                .taskId(request.getTaskId())
                .action(request.getAction())
                .description(request.getDescription())
                .changesJson(changesJson)
                .userName(name)
                .userInitials(initials)
                .createdAt(LocalDateTime.now())
                .build();

        return activityRepository.save(activity);
    }

    public List<Activity> getActivitiesForTask(Long taskId) {
        return activityRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
    }

    public List<Activity> getAllActivities(String username, boolean isAdmin) {
        if (isAdmin) {
            return activityRepository.findAllByOrderByCreatedAtDesc();
        } else {
            User user = userRepository.findByEmail(username).orElse(null);
            String name = user != null ? user.getName() : username;
            return activityRepository.findByUserNameOrderByCreatedAtDesc(name);
        }
    }

    public void clearAllActivities() {
        activityRepository.deleteAll();
    }
    
    public void deleteActivitiesForTask(Long taskId) {
        activityRepository.deleteByTaskId(taskId);
    }
}
