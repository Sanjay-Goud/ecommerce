package com.sanjay.ecommerce.service;

import com.sanjay.ecommerce.model.*;
import com.sanjay.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Cart getUserCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createCart(userId));
    }

    private Cart createCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = Cart.builder()
                .user(user)
                .build();
        return cartRepository.save(cart);
    }

    public Cart addToCart(Long userId, Long productId, Integer quantity) {
        Cart cart = getUserCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        CartItem existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .price(product.getPrice())
                    .build();
            cartItemRepository.save(cartItem);
            cart.getItems().add(cartItem);
        }

        cart.calculateTotalPrice();
        return cartRepository.save(cart);
    }

    public Cart updateCartItem(Long userId, Long itemId, Integer quantity) {
        Cart cart = getUserCart(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (item.getProduct().getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        cart.calculateTotalPrice();
        return cartRepository.save(cart);
    }

    public Cart removeFromCart(Long userId, Long itemId) {
        Cart cart = getUserCart(userId);
        cartItemRepository.deleteById(itemId);
        cart.calculateTotalPrice();
        return cartRepository.save(cart);
    }

    public void clearCart(Long userId) {
        Cart cart = getUserCart(userId);
        cart.getItems().clear();
        cart.calculateTotalPrice();
        cartRepository.save(cart);
    }
}