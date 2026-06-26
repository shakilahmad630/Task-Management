package com.taskapp.backend.exception;


import com.taskapp.backend.Utility.Constants;
import com.taskapp.backend.dto.Response;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;


@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Response handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        return Response.builder()
                .status(Constants.FAIL)
                .message(message)
                .build();
    }

    @ExceptionHandler(RuntimeException.class)
    public Response handleRuntimeException(RuntimeException ex) {
        return Response.builder()
                .status(Constants.FAIL)
                .message(ex.getMessage())
                .build();
    }

    @ExceptionHandler(Exception.class)
    public Response handleException(Exception ex) {
        return Response.builder()
                .status(Constants.FAIL)
                .message("An unexpected error occurred: " + ex.getMessage())
                .build();
    }

}