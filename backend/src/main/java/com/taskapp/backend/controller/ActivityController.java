package com.taskapp.backend.controller;

import com.taskapp.backend.Utility.Constants;
import com.taskapp.backend.dto.ActivityRequestDTO;
import com.taskapp.backend.dto.Response;
import com.taskapp.backend.entity.Activity;
import com.taskapp.backend.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping("/log")
    public Response logActivity(@RequestBody ActivityRequestDTO request, Authentication auth) {
        Activity activity = activityService.logActivity(request, auth.getName());
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("Activity logged successfully")
                .data(activity)
                .build();
    }

    @GetMapping("/task/{taskId}")
    public Response getActivitiesForTask(@PathVariable Long taskId) {
        List<Activity> activities = activityService.getActivitiesForTask(taskId);
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("Activities fetched successfully")
                .data(activities)
                .build();
    }

    @GetMapping("/all")
    public Response getAllActivities(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ADMIN") || role.equals("ROLE_ADMIN"));
        
        List<Activity> activities = activityService.getAllActivities(auth.getName(), isAdmin);
        return Response.builder()
                .status(Constants.SUCCESS)
                .message("Activities fetched successfully")
                .data(activities)
                .build();
    }

    @DeleteMapping("/clear")
    public Response clearAllActivities(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ADMIN") || role.equals("ROLE_ADMIN"));
        
        if (isAdmin) {
            activityService.clearAllActivities();
            return Response.builder()
                    .status(Constants.SUCCESS)
                    .message("All activities cleared successfully")
                    .build();
        } else {
            return Response.builder()
                    .status(Constants.ERROR)
                    .message("Unauthorized to clear activities")
                    .build();
        }
    }
}
