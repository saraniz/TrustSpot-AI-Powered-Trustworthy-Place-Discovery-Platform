package com.trustspot.review_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long placeId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Double rating;

    @Column(length = 2000)
    private String comment;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "review_images", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "image_url", length = 16777215)
    private List<String> imageUrls;

    private LocalDateTime createdAt;

    private int likesCount = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "review_likes", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "user_id")
    private Set<Long> likedByUserIds;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
