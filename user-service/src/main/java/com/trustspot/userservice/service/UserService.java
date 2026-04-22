package com.trustspot.userservice.service;

import com.trustspot.userservice.dto.RegisterRequest;
import com.trustspot.userservice.dto.RegisterResponse;
import com.trustspot.userservice.mapper.UserMapper;
import com.trustspot.userservice.model.User;
import com.trustspot.userservice.repository.UserRepository;
import com.trustspot.userservice.security.JwtService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;

    }

    // request is a method parameter object of type RegisterRequest.
    public void register(RegisterRequest request){

        User user = UserMapper.toEntity(request); // Converts the RegisterRequest DTO to a User entity using the UserMapper.

        //hash password before saving to database
        user.setPassword(passwordEncoder.encode(user.getPassword())); // Hashes the password from the RegisterRequest using BCryptPasswordEncoder and sets it in the User entity.
        userRepository.save(user); // Saves the User entity to the database using the userRepository.

        //generate JWT token for the user
        String token = jwtService.generateToken(user.getEmail()); // Generates a JWT token for the user using the JwtService.
    
        return new RegisterResponse(token, user.getEmail()); // Returns a RegisterResponse containing the generated JWT token.
    }
}