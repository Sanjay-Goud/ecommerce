package com.sanjay.ecommerce.controller;

import com.sanjay.ecommerce.model.Wishlist;
import com.sanjay.ecommerce.model.User;
import com.sanjay.ecommerce.repository.UserRepository;
import com.sanjay.ecommerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Wishlist>> getWishlist(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Wishlist> wishlist = wishlistService.getUserWishlist(user.getId());
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<Wishlist> addToWishlist(@PathVariable Long productId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Wishlist wishlist = wishlistService.addToWishlist(user.getId(), productId);
        return ResponseEntity.ok(wishlist);
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long productId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        wishlistService.removeFromWishlist(user.getId(), productId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/move-to-cart/{productId}")
    public ResponseEntity<Void> moveToCart(@PathVariable Long productId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        wishlistService.moveToCart(user.getId(), productId);
        return ResponseEntity.ok().build();
    }
}