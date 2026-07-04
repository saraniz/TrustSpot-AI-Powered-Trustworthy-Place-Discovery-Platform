package com.trustspot.userservice.service;

import com.trustspot.userservice.dto.RegisterRequest;
import com.trustspot.userservice.dto.RegisterResponse;
import com.trustspot.userservice.dto.LoginRequest;
import com.trustspot.userservice.dto.LoginResponse;
import com.trustspot.userservice.dto.UserByIdResponse;
import com.trustspot.userservice.dto.UpdateRequest;
import com.trustspot.userservice.dto.UpdateResponse;
import com.trustspot.userservice.mapper.UserMapper;
import com.trustspot.userservice.model.User;
import com.trustspot.userservice.repository.UserRepository;
import com.trustspot.userservice.security.JWTService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;

// Service layer responsibilities:
// Takes input from controller (usually Request DTOs)
// Processes business logic
// Returns output (usually Response DTOs)
// So it naturally uses both.

/*
 * @Service:
 * Marks this class as a Spring Service layer component.
 * Spring automatically creates and manages its object (bean).
 */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JWTService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public RegisterResponse register(RegisterRequest request) {
        log.debug("Register request received for email={} name={}", request.getEmail(), request.getName());
        User user = UserMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        log.debug("Saving new user email={}", user.getEmail());
        userRepository.save(user);

        log.debug("Generating JWT for userId={} email={}", user.getId(), user.getEmail());
        String token = jwtService.generateToken(user.getEmail());
        log.debug("Register completed for userId={} email={}", user.getId(), user.getEmail());
        return new RegisterResponse(token, user.getId(), user.getEmail(), user.getName());
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, user.getId(), user.getEmail(), user.getName());
    }

    public UserByIdResponse getUserById(long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserMapper.toUserByIdResponse(user);
    }

    public UpdateResponse update(long id, UpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getProfileImageUrl() != null) {
            user.setProfileImageUrl(request.getProfileImageUrl());
        }
        if (request.getCoverImageUrl() != null) {
            user.setCoverImageUrl(request.getCoverImageUrl());
        }

        userRepository.save(user);
        return new UpdateResponse(user.getId(), user.getName(), user.getEmail(), user.getBio(), user.getProfileImageUrl(), user.getCoverImageUrl());
    }

    public UserByIdResponse updateProfileImage(long id, String imageUrl) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfileImageUrl(imageUrl);
        userRepository.save(user);
        return UserMapper.toUserByIdResponse(user);
    }

    public UserByIdResponse updateCoverImage(long id, String imageUrl) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setCoverImageUrl(imageUrl);
        userRepository.save(user);
        return UserMapper.toUserByIdResponse(user);
    }

    public Map<String, Object> validateToken(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = jwtService.getEmailFromToken(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            boolean isValid = jwtService.validateToken(token, email);
            response.put("valid", isValid);
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
        } catch (Exception e) {
            response.put("valid", false);
        }
        return response;
    }
}
