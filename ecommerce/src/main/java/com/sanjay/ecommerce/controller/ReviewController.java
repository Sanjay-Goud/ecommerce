package com.sanjay.ecommerce.controller;

import com.sanjay.ecommerce.model.Review;
import com.sanjay.ecommerce.model.User;
import com.sanjay.ecommerce.repository.UserRepository;
import com.sanjay.ecommerce.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        List<Review> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    public ResponseEntity<Review> addReview(@RequestBody Map<String, Object> request, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long productId = Long.valueOf(request.get("productId").toString());
        Integer rating = Integer.valueOf(request.get("rating").toString());
        String comment = request.get("comment").toString();

        Review review = reviewService.addReview(user.getId(), productId, rating, comment);
        return ResponseEntity.ok(review);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request
    ) {
        Integer rating = Integer.valueOf(request.get("rating").toString());
        String comment = request.get("comment").toString();
        Review review = reviewService.updateReview(id, rating, comment);
        return ResponseEntity.ok(review);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok().build();
    }
}
