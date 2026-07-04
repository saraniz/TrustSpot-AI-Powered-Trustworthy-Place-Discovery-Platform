package com.trustspot.userservice.dto;

public class UserByIdResponse{

    private long id;
    private String name;
    private String email;
    private String bio;
    private String profileImageUrl;
    private String coverImageUrl;

    public UserByIdResponse(long id, String name, String email, String bio, String profileImageUrl, String coverImageUrl){
        
        this.id = id;
        this.name = name;
        this.email = email;
        this.bio = bio;
        this.profileImageUrl = profileImageUrl;
        this.coverImageUrl = coverImageUrl;

    }

    public long getId() {
    return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getBio() {
        return bio;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

}