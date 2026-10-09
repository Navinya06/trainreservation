package com.example.trainreservation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handle(RuntimeException e) {
        Throwable root = e;
        while (root.getCause() != null) {
            root = root.getCause();
        }
        return ResponseEntity.badRequest().body(String.valueOf(root.getMessage()));
    }
}
