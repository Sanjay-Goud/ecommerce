package com.sanjay.ecommerce.service;

import com.sanjay.ecommerce.model.*;
import com.sanjay.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public Review addReview(Long userId, Long productId, Integer rating, String comment) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if user already reviewed
        if (reviewRepository.findByProductIdAndUserId(productId, userId).isPresent()) {
            throw new RuntimeException("You have already reviewed this product");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(rating)
                .comment(comment)
                .build();

        review = reviewRepository.save(review);

        // Update product rating
        updateProductRating(product);

        return review;
    }

    public Review updateReview(Long reviewId, Integer rating, String comment) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setRating(rating);
        review.setComment(comment);
        review = reviewRepository.save(review);

        // Update product rating
        updateProductRating(review.getProduct());

        return review;
    }

    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        Product product = review.getProduct();
        reviewRepository.deleteById(reviewId);

        // Update product rating
        updateProductRating(product);
    }

    private void updateProductRating(Product product) {
        Double avgRating = reviewRepository.getAverageRating(product.getId());
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());

        product.setAverageRating(avgRating != null ? avgRating : 0.0);
        product.setReviewCount(reviews.size());
        productRepository.save(product);
    }
}