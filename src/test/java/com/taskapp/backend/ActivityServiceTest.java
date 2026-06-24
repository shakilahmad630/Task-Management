package com.taskapp.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskapp.backend.dto.ActivityRequestDTO;
import com.taskapp.backend.entity.Activity;
import com.taskapp.backend.entity.User;
import com.taskapp.backend.repository.ActivityRepository;
import com.taskapp.backend.repository.UserRepository;
import com.taskapp.backend.service.ActivityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ActivityService.
 * Uses Mockito — no database or Spring context required.
 */
@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private ObjectMapper objectMapper;

    @InjectMocks
    private ActivityService activityService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Salman Khan");
        testUser.setEmail("salman@gmail.com");
        testUser.setRole("USER");
        testUser.setPassword("hashedpassword");
    }

    // ── Test 1: logActivity saves an Activity with correct fields ────────────
    @Test
    @DisplayName("logActivity should save an Activity record with correct action and description")
    void logActivity_shouldSaveActivityWithCorrectFields() {
        // Arrange
        when(userRepository.findByEmail("salman@gmail.com")).thenReturn(Optional.of(testUser));
        when(activityRepository.save(any(Activity.class))).thenAnswer(inv -> inv.getArgument(0));

        ActivityRequestDTO request = new ActivityRequestDTO();
        request.setTaskId(10L);
        request.setAction("created");
        request.setDescription("Created task \"Fix login bug\"");
        request.setChanges(List.of());

        // Act
        Activity result = activityService.logActivity(request, "salman@gmail.com");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTaskId()).isEqualTo(10L);
        assertThat(result.getAction()).isEqualTo("created");
        assertThat(result.getDescription()).isEqualTo("Created task \"Fix login bug\"");
        assertThat(result.getUserName()).isEqualTo("Salman Khan");
        assertThat(result.getCreatedAt()).isNotNull();

        // Verify the repository was actually called to save
        verify(activityRepository, times(1)).save(any(Activity.class));
    }

    // ── Test 2: logActivity generates correct initials ────────────────────────
    @Test
    @DisplayName("logActivity should generate correct user initials from name")
    void logActivity_shouldGenerateCorrectInitials() {
        // Arrange
        when(userRepository.findByEmail("salman@gmail.com")).thenReturn(Optional.of(testUser));
        when(activityRepository.save(any(Activity.class))).thenAnswer(inv -> inv.getArgument(0));

        ActivityRequestDTO request = new ActivityRequestDTO();
        request.setTaskId(5L);
        request.setAction("updated");
        request.setDescription("Updated priority");

        // Act
        Activity result = activityService.logActivity(request, "salman@gmail.com");

        // Assert — "Salman Khan" → initials should be "SK"
        assertThat(result.getUserInitials()).isEqualTo("SK");
    }

    // ── Test 3: getAllActivities returns all for admin, filtered for user ─────
    @Test
    @DisplayName("getAllActivities should return ALL activities for admin but only own activities for user")
    void getAllActivities_adminSeesAll_userSeesOwn() {
        // Arrange
        Activity adminActivity = Activity.builder()
                .id(1L).taskId(1L).userName("Admin Boss").action("deleted").description("Deleted a task").build();
        Activity salmanActivity = Activity.builder()
                .id(2L).taskId(2L).userName("Salman Khan").action("created").description("Created a task").build();

        when(activityRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(List.of(adminActivity, salmanActivity));
        when(activityRepository.findByUserNameOrderByCreatedAtDesc("Salman Khan"))
                .thenReturn(List.of(salmanActivity));
        when(userRepository.findByEmail("salman@gmail.com")).thenReturn(Optional.of(testUser));

        // Act — as Admin
        List<Activity> adminResult = activityService.getAllActivities("admin@gmail.com", true);

        // Act — as regular User
        List<Activity> userResult = activityService.getAllActivities("salman@gmail.com", false);

        // Assert — admin sees all 2 activities
        assertThat(adminResult).hasSize(2);

        // Assert — user sees only their own 1 activity
        assertThat(userResult).hasSize(1);
        assertThat(userResult.get(0).getUserName()).isEqualTo("Salman Khan");
    }
}
