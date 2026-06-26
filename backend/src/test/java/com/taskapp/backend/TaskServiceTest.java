package com.taskapp.backend;

import com.taskapp.backend.dto.TaskRequestDTO;
import com.taskapp.backend.entity.Task;
import com.taskapp.backend.entity.User;
import com.taskapp.backend.repository.TaskRepository;
import com.taskapp.backend.repository.UserRepository;
import com.taskapp.backend.service.ActivityService;
import com.taskapp.backend.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TaskService.
 * Uses Mockito — no database or Spring context required.
 */
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private ActivityService activityService;

    @InjectMocks
    private TaskService taskService;

    private User regularUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        regularUser = new User();
        regularUser.setId(1L);
        regularUser.setName("Salman Khan");
        regularUser.setEmail("salman@gmail.com");
        regularUser.setRole("USER");
        regularUser.setPassword("hash");

        adminUser = new User();
        adminUser.setId(2L);
        adminUser.setName("Admin");
        adminUser.setEmail("admin@gmail.com");
        adminUser.setRole("ADMIN");
        adminUser.setPassword("hash");
    }

    // ── Test 4: create() builds Task correctly and saves to DB ───────────────
    @Test
    @DisplayName("create() should save a new task with all fields set correctly")
    void create_shouldSaveTaskWithCorrectFields() {
        // Arrange
        when(userRepo.findByEmail("salman@gmail.com")).thenReturn(Optional.of(regularUser));
        when(taskRepo.save(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setId(99L); // simulate DB assigning ID
            return t;
        });

        TaskRequestDTO request = new TaskRequestDTO();
        request.setTitle("Fix login bug");
        request.setDescription("The login page crashes on mobile");
        request.setStatus("TODO");
        request.setPriority("HIGH");
        request.setDueDate(LocalDate.now().plusDays(7));

        // Act
        Task result = taskService.create(request, "salman@gmail.com");

        // Assert
        assertThat(result.getId()).isEqualTo(99L);
        assertThat(result.getTitle()).isEqualTo("Fix login bug");
        assertThat(result.getStatus()).isEqualTo("TODO");
        assertThat(result.getPriority()).isEqualTo("HIGH");
        assertThat(result.getUser()).isEqualTo(regularUser);
        assertThat(result.getCreatedDate()).isNotNull();

        verify(taskRepo, times(1)).save(any(Task.class));
    }

    // ── Test 5: update() only modifies provided fields (partial update) ───────
    @Test
    @DisplayName("update() should only modify the provided fields and ignore null values")
    void update_shouldOnlyModifyProvidedFields() {
        // Arrange — existing task in DB
        Task existingTask = new Task();
        existingTask.setId(10L);
        existingTask.setTitle("Original Title");
        existingTask.setDescription("Original Description");
        existingTask.setStatus("TODO");
        existingTask.setPriority("LOW");
        existingTask.setDueDate(LocalDate.now());
        existingTask.setCreatedDate(LocalDateTime.now());
        existingTask.setUser(regularUser);

        when(taskRepo.findById(10L)).thenReturn(Optional.of(existingTask));
        when(userRepo.findByEmail("salman@gmail.com")).thenReturn(Optional.of(regularUser));
        when(taskRepo.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        // Only updating the status — everything else should remain unchanged
        TaskRequestDTO updateRequest = new TaskRequestDTO();
        updateRequest.setStatus("DONE");
        // title, description, priority, dueDate are all null (not sent by frontend)

        // Act
        Task result = taskService.update(10L, updateRequest, "salman@gmail.com");

        // Assert — status changed, nothing else did
        assertThat(result.getStatus()).isEqualTo("DONE");
        assertThat(result.getTitle()).isEqualTo("Original Title");
        assertThat(result.getDescription()).isEqualTo("Original Description");
        assertThat(result.getPriority()).isEqualTo("LOW");
    }

    // ── Test 6: getById() throws if a user tries to access another user's task ─
    @Test
    @DisplayName("getById() should throw RuntimeException if non-admin accesses another user's task")
    void getById_shouldThrowForUnauthorizedAccess() {
        // Arrange
        User otherUser = new User();
        otherUser.setId(99L);
        otherUser.setName("Other User");
        otherUser.setEmail("other@gmail.com");
        otherUser.setRole("USER");
        otherUser.setPassword("hash");

        Task taskOwnedByOther = new Task();
        taskOwnedByOther.setId(55L);
        taskOwnedByOther.setTitle("Secret Task");
        taskOwnedByOther.setUser(otherUser); // owned by "other@gmail.com"

        when(taskRepo.findById(55L)).thenReturn(Optional.of(taskOwnedByOther));
        when(userRepo.findByEmail("salman@gmail.com")).thenReturn(Optional.of(regularUser));

        // Act & Assert — salman@gmail.com should NOT be able to access other user's task
        assertThatThrownBy(() -> taskService.getById(55L, "salman@gmail.com"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Not allowed");
    }
}
