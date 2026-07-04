package com.trustspot.userservice.dto;

public class RegisterResponse {

    private String token;
    private long userId;
    private String email;
    private String name;

    public RegisterResponse(String token, long userId, String email, String name) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.name = name;
    }

    public String getToken() {
        return token;
    }

    public long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }
}