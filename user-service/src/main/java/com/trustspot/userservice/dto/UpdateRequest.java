package com.trustspot.userservice.dto;

public class UpdateRequest{

    private String name;
    private String email;
    private String bio;
    private String profileImageUrl;
    private String coverImageUrl;

    public String getName(){
        return name;
    }

    public String getEmail(){
        return email;
    }

    public String getBio(){
        return bio;
    }

    public String getProfileImageUrl(){
        return profileImageUrl;
    }

    public String getCoverImageUrl(){
        return coverImageUrl;
    }

    public void setName(String name){
        this.name = name;
    }

    public void setEmail(String email){
        this.email = email;
    }

    public void setBio(String bio){
        this.bio = bio;
    }

    public void setProfileImageUrl(String profileImageUrl){
        this.profileImageUrl = profileImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl){
        this.coverImageUrl = coverImageUrl;
    }


}