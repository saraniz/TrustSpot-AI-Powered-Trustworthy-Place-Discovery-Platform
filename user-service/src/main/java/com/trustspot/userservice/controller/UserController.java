package com.trustspot.userservice.controller;

import com.trustspot.userservice.dto.*;
import com.trustspot.userservice.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/*
 * @CrossOrigin:
 * Allows frontend apps (React/Angular/etc.) to access this API

 */
// @CrossOrigin(
//         origins = "*",
//         allowedHeaders = "*",
//         methods = {
//                 RequestMethod.GET,
//                 RequestMethod.POST,
//                 RequestMethod.PUT,
//                 RequestMethod.DELETE,
//                 RequestMethod.OPTIONS
//         }
// )

/*
 * @RestController:
 * Combines @Controller + @ResponseBody
 * Means this class returns JSON responses directly
 */
@RestController

/*
 * Base URL for all endpoints in this controller
 * Example: /api/users/register
 */
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    /*
     * @Autowired:
     * Spring automatically injects UserService object here
     * (Dependency Injection)
     */
    @Autowired
    private UserService userService;

    /*
     * REGISTER USER
     * POST /api/users/register
     * @RequestBody → JSON request converted into Java object (DTO)
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {

        // Call service layer
        log.debug("HTTP POST /api/users/register email={} name={}", request.getEmail(), request.getName());
        RegisterResponse response = userService.register(request);
        log.debug("HTTP POST /api/users/register completed userId={} email={}", response.getUserId(), response.getEmail());

        // ResponseEntity wraps response + HTTP status
        return ResponseEntity.ok(response);
    }

    /*
     * LOGIN USER
     * POST /api/users/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        return ResponseEntity.ok(userService.login(request));
    }

    /*
     * GET USER BY ID
     * PathVariable → value comes from URL (/api/users/{id})
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserByIdResponse> getUserById(@PathVariable long id) {

        UserByIdResponse response = userService.getUserById(id);

        return ResponseEntity.ok(response);
    }

    /*
     * UPDATE USER
     * PUT → used for full/partial update
     */
    @PutMapping("/{id}")
    public ResponseEntity<UpdateResponse> update(
            @PathVariable long id,
            @RequestBody UpdateRequest request) {

        return ResponseEntity.ok(userService.update(id, request));
    }

    /*
     * UPDATE PROFILE IMAGE
     * Uses Map<String, String> instead of DTO
     * Example request body: { "imageUrl": "abc.jpg" }
     */
    @PostMapping("/{id}/profile-image")
    public ResponseEntity<UserByIdResponse> updateProfileImage(
            @PathVariable long id,
            @RequestBody Map<String, String> body) {

        // Extract value from JSON map
        String imageUrl = body.get("imageUrl");

        return ResponseEntity.ok(userService.updateProfileImage(id, imageUrl));
    }

    /*
     * UPDATE COVER IMAGE
     */
    @PostMapping("/{id}/cover-image")
    public ResponseEntity<UserByIdResponse> updateCoverImage(
            @PathVariable long id,
            @RequestBody Map<String, String> body) {

        String imageUrl = body.get("imageUrl");

        return ResponseEntity.ok(userService.updateCoverImage(id, imageUrl));
    }

    /*
     * VALIDATE TOKEN
     * Demonstrates multiple ways of passing token:
     * 1. Authorization header (Bearer token)
     * 2. Request param
     * 3. Request body
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "token", required = false) String tokenParam,
            @RequestBody(required = false) Map<String, String> body) {

        String token = null;

        // Case 1: Authorization: Bearer <token>
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
        // Case 2: /validate?token=abc
        else if (tokenParam != null) {
            token = tokenParam;
        }
        // Case 3: { "token": "abc" }
        else if (body != null && body.containsKey("token")) {
            token = body.get("token");
        }

        // If token is missing → return error response
        if (token == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("valid", false);
            error.put("error", "Token is missing");

            return ResponseEntity.badRequest().body(error);
        }

        // Call service to validate token
        return ResponseEntity.ok(userService.validateToken(token));
    }
}