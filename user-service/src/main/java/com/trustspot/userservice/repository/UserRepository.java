package com.trustspot.userservice.repository;

import com.trustspot.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// A repository in Spring Boot is the part of your application that talks to the database.
// Think of it as the layer that is responsible for saving data and reading data from the database.
// Without a repository, you would need to:
// Write SQL queries yourself
// Open database connections manually
// Handle results manually
// Convert database rows into Java objects yourself

// That is slow, error-prone, and not scalable.
// Spring Repository removes all of that work.
// A repository is just a Java interface that Spring automatically turns into a working database handler at runtime.
// You do not write implementation code.

// Spring creates it for you.
// It is only responsible for:
// saving data, retrieving data

// extends JpaRepository<User, Long> means that this repository will manage User entities and the primary key of User is of type Long.
public interface UserRepository extends JpaRepository<User, Long>{

    // This method will be used to find a user by their email address.
    // Spring Data JPA will automatically generate the implementation for this method based on its name.
    // The method returns a User object if found
    // Or returns empty if not found
    // Why Optional? Instead of returning null, Spring uses:

    // Optional = safe container
    // So you avoid:
    // NullPointerException, manual null checks, Mental model:
    // Optional = "maybe a User, maybe nothing"

    // findByEmail is a query method that Spring Data JPA understands and will automatically implement to search for a User by their email field in the database.
    Optional<User> findByEmail(String email);
}
