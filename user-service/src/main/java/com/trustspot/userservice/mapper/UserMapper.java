package com.trustspot.userservice.mapper;

// Bringing external classes into this file.
// Because: User is in model package, RegisterRequest is in dto package
import com.trustspot.userservice.dto.RegisterRequest;
import com.trustspot.userservice.model.User;

public class UserMapper {

    // a) public
    // Accessible from anywhere in the project
    // Service layer can call it
    // b) static
    // Very important.
    // Meaning: You don’t need to create an object.
    // c) User
    // Return type
    // Meaning: This method returns a User entity object
    // d) toEntity
    // Method name
    // Meaning: Convert DTO → Entity
    public static User toEntity(RegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        return user;
    }
}