package com.trustspot.userservice.model; //define where this class belongs in project structure

// JPA entity is a java class that represent a table in a database
// This imports JPA (Java Persistence API) annotations.
// It allows this class to become a database table mapping model.
// @Entity @Table @Id @GeneratedValue @Column All come from this package.
import jakarta.persistence.*; 

@Entity //marks this class as a database entity, meaning it will be mapped to a table in the database
@Table(name = "users")
public class User {

    @Id //marks this field as the primary key of the entity, meaning it will be the unique identifier for each record in the database table
    @GeneratedValue(strategy = GenerationType.IDENTITY) //Automatically generates ID when a new user is created.
    private long id;

    private String name;

    // add constraints to database column 
    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length= 250)
    private String bio;

    @Column(length = 16777215)
    private String profileImageUrl;

    @Column(length = 16777215)
    private String coverImageUrl;

    //constructor
    public User(){

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
