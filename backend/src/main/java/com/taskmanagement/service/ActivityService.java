package com.taskmanagement.service;

import com.taskmanagement.model.Activity;
import com.taskmanagement.model.User;
import com.taskmanagement.repository.ActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    @Transactional
    public Activity log(Long taskId, String action, String description, Object changes, User user) {
        Activity activity = new Activity();
        activity.setTaskId(taskId);
        activity.setAction(action);
        activity.setDescription(description);
        activity.setChanges(changes != null ? toJson(changes) : null);
        activity.setUser(user);
        return activityRepository.save(activity);
    }

    public List<Activity> getForTask(Long taskId) {
        return activityRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
    }

    public List<Activity> getAll() {
        return activityRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void clearAll() {
        activityRepository.deleteAll();
    }

    private String toJson(Object obj) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(obj);
        } catch (Exception e) {
            return obj != null ? obj.toString() : null;
        }
    }
}
