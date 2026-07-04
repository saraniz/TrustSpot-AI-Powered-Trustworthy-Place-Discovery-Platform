package com.trustspot.review_service.controller;

import com.trustspot.review_service.model.Review;
import com.trustspot.review_service.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        return ResponseEntity.ok(reviewService.createReview(review));
    }

    @GetMapping("/place/{placeId}")
    public ResponseEntity<List<Review>> getReviewsByPlace(@PathVariable Long placeId) {
        return ResponseEntity.ok(reviewService.getReviewsByPlace(placeId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getReviewsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewsByUser(userId));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<Review> updateReview(@PathVariable Long reviewId, @RequestBody Review reviewDetails) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId, reviewDetails));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Map<String, String>> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Review deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{reviewId}/like")
    public ResponseEntity<Review> toggleLikeReview(
            @PathVariable Long reviewId,
            @RequestParam(value = "userId", required = false) Long queryUserId,
            @RequestBody(required = false) Map<String, Long> body) {
        
        Long userId = queryUserId;
        if (userId == null && body != null && body.containsKey("userId")) {
            userId = body.get("userId");
        }

        if (userId == null) {
            throw new IllegalArgumentException("User ID is required to like/unlike a review");
        }

        return ResponseEntity.ok(reviewService.toggleLikeReview(reviewId, userId));
    }
}
