package com.taskmanagement.controller;

import com.taskmanagement.dto.ApiResponse;
import com.taskmanagement.model.Activity;
import com.taskmanagement.model.User;
import com.taskmanagement.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping("/log")
    public ResponseEntity<?> log(@RequestBody Map<String, Object> body,
                                  @AuthenticationPrincipal User currentUser) {
        try {
            Long taskId = Long.valueOf(body.get("taskId").toString());
            String action = (String) body.get("action");
            String description = (String) body.get("description");
            Object changes = body.get("changes");

            activityService.log(taskId, action, description, changes, currentUser);
            return ResponseEntity.ok(ApiResponse.ok("Activity logged", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<?> getForTask(@PathVariable Long taskId) {
        List<Activity> activities = activityService.getForTask(taskId);
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        List<Activity> activities = activityService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearAll() {
        activityService.clearAll();
        return ResponseEntity.ok(ApiResponse.ok("All activities cleared", null));
    }
}
