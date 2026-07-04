package com.trustspot.userservice.mapper;

// Bringing external classes into this file.
// Because: User is in model package, RegisterRequest is in dto package
import com.trustspot.userservice.dto.RegisterRequest;
import com.trustspot.userservice.model.User;
import com.trustspot.userservice.dto.UserByIdResponse;

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

    // Entity → DTO (Response)
    // A method that converts User → UserByIdResponse so service doesn’t manually map fields anymore.
    public static UserByIdResponse toUserByIdResponse(User user) {
        return new UserByIdResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getBio(),
                user.getProfileImageUrl(),
                user.getCoverImageUrl()
        );
    }
}