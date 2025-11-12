package com.sanjay.ecommerce.controller;

import com.sanjay.ecommerce.model.Address;
import com.sanjay.ecommerce.model.User;
import com.sanjay.ecommerce.service.UserService;
import com.sanjay.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody User updateData, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        User updated = userService.updateProfile(user.getId(), updateData);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<Address>> getAddresses(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Address> addresses = userService.getUserAddresses(user.getId());
        return ResponseEntity.ok(addresses);
    }

    @PostMapping("/addresses")
    public ResponseEntity<Address> addAddress(@RequestBody Address address, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Address saved = userService.addAddress(user.getId(), address);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<Address> updateAddress(@PathVariable Long id, @RequestBody Address address) {
        Address updated = userService.updateAddress(id, address);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        userService.deleteAddress(id);
        return ResponseEntity.ok().build();
    }
}
