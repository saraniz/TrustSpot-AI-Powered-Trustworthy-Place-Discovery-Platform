package com.trustspot.userservice.dto;

public class UpdateResponse {

    private long id;
    private String name;
    private String email;
    private String bio;
    private String profileImageUrl;
    private String coverImageUrl;

    public UpdateResponse() {}

    public UpdateResponse(long id, String name, String email, String bio, String profileImageUrl, String coverImageUrl) {
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

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }
}