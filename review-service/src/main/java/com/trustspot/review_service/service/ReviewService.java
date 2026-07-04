package com.trustspot.review_service.service;

import com.trustspot.review_service.model.Review;
import com.trustspot.review_service.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public Review createReview(Review review) {
        if (review.getLikedByUserIds() == null) {
            review.setLikedByUserIds(new HashSet<>());
        }
        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByPlace(Long placeId) {
        return reviewRepository.findByPlaceId(placeId);
    }

    public List<Review> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    public Review updateReview(Long reviewId, Review reviewDetails) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id " + reviewId));
        if (reviewDetails.getRating() != null) review.setRating(reviewDetails.getRating());
        if (reviewDetails.getComment() != null) review.setComment(reviewDetails.getComment());
        if (reviewDetails.getImageUrls() != null) review.setImageUrls(reviewDetails.getImageUrls());
        return reviewRepository.save(review);
    }

    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id " + reviewId));
        reviewRepository.delete(review);
    }

    public Review toggleLikeReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id " + reviewId));

        if (review.getLikedByUserIds() == null) {
            review.setLikedByUserIds(new HashSet<>());
        }

        if (review.getLikedByUserIds().contains(userId)) {
            review.getLikedByUserIds().remove(userId);
            review.setLikesCount(Math.max(0, review.getLikesCount() - 1));
        } else {
            review.getLikedByUserIds().add(userId);
            review.setLikesCount(review.getLikesCount() + 1);
        }

        return reviewRepository.save(review);
    }
}
