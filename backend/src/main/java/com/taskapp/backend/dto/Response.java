package com.taskapp.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Response {
    private String status;
    private String message;
    private Object data;

    public Response(String status, String message) {
        this.status = status;
        this.message = message;
    }
}
