package com.trustspot.userservice.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// Marks this class as a Spring configuration class, Spring will scan it and load beans from it
// This class is responsible for configuring security-related beans, such as the password encoder. By defining a BCryptPasswordEncoder bean, we can use it throughout the application to hash passwords securely before storing them in the database.
@Configuration
public class SecurityConfig {

    // Define a bean for BCryptPasswordEncoder, which is a password hashing function that incorporates a salt to protect against rainbow table attacks. By using this encoder, we can ensure that user passwords are stored securely in the database.
    // @Bean Tells Spring: “Create and manage this object for me”
    @Bean
    // BCryptPasswordEncoder From Spring Security
    // Used to: Hash passwords, Verify passwords securely
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // This creates a global password encoder object that can be injected into other parts of the application where password hashing is needed, such as during user registration or authentication processes.
    }
}