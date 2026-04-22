// RegisterResponse is a DTO (Data Transfer Object) used to define what data is sent back to the client after a successful registration.

// Instead of returning the full User entity (which may contain sensitive or unnecessary fields), this class ensures that only the required information is exposed:

// token → for authentication
// email → confirmation of the registered user

// This improves security, keeps the API response clean, and decouples internal data models from external responses.

package com.trustspot.userservice.dto;

public class RegisterResponse {

    private String token;
    private String email;

    public RegisterResponse(String token, String email) {
        this.token = token;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public String getEmail() {
        return email;
    }
}