package com.trustspot.userservice.service;

import com.trustspot.userservice.dto.RegisterRequest;
import com.trustspot.userservice.mapper.UserMapper;
import com.trustspot.userservice.model.User;
import com.trustspot.userservice.repository.UserRepository;
import org.springframework.stereotype.Service;

// The Service layer is the part of your backend where business logic is written.

// It sits between:
// Controller (API layer)
// Repository (database layer)
// Simple meaning

// Service layer means: “What should the system do with the data?”

// Not:how to receive data (Controller) ,how to store data (Repository)

// Only: rules, logic, processing

// Automatically detects this class during scanning
// Creates an object (bean) of it
// Keeps it in Spring container
@Service //Marks this class as a Service layer component in Spring.
public class UserService{

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // request is a method parameter object of type RegisterRequest.
    public void register(RegisterRequest request){

        User user = UserMapper.toEntity(request); // Converts the RegisterRequest DTO to a User entity using the UserMapper.
        userRepository.save(user); // Saves the User entity to the database using the userRepository.

    }
}