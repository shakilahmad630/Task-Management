package com.taskapp.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ActivityRequestDTO {
    private Long taskId;
    private String action;
    private String description;
    private List<ChangeDTO> changes;
    
    @Data
    public static class ChangeDTO {
        private String field;
        private String label;
        private String oldValue;
        private String newValue;
    }
}
