package com.trustspot.userservice.controller;

import com.trustspot.userservice.dto.RegisterRequest;
import com.trustspot.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// UserController handles user-related API endpoints such as registration, login, etc.
// rest controller annotation to define this class as a REST controller
@RestController
@RequestMapping("/api/users") // base path for all user-related endpoints
public class UserController {

    @Autowired // inject the UserService to handle business logic related to users
    private UserService userService;

    // 1. Register User
    @PostMapping("/register")
    // endpoint to handle user registration, accepts a RegisterRequest object in the request body
    // ResponseEntity is used to return a response with a status code and message
    // request body is expected to contain user registration details such as username, email, password, etc.
    // RegisterRequest is a DTO (Data Transfer Object) that encapsulates the registration data sent by the client
    // java object that contains data sent from the forntend when calling the API
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {

        // call the userService to handle the registration logic, passing the RegisterRequest object
        RegisterResponse response = userService.register(request);

        // return a response indicating that the user was created successfully, with an HTTP 200 OK status
        // ResponseEntity() It is a Spring Boot class used to represent the full HTTP response.
        
        return ResponseEntity.ok(response);
    }
}