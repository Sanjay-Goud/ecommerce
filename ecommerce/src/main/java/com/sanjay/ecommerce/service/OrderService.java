package com.sanjay.ecommerce.service;

import com.sanjay.ecommerce.model.*;
import com.sanjay.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public Order placeOrder(Long userId, Long addressId, Payment.PaymentMethod paymentMethod) {
        Cart cart = cartService.getUserCart(userId);

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // Check stock availability
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
        }

        // Create order
        Order order = Order.builder()
                .user(user)
                .deliveryAddress(address)
                .totalAmount(cart.getTotalPrice())
                .status(Order.OrderStatus.PROCESSING)
                .build();
        order = orderRepository.save(order);

        // Create order items and update stock
        Set<OrderItem> orderItems = new HashSet<>();
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice())
                    .build();
            orderItems.add(orderItem);
            orderItemRepository.save(orderItem);

            // Reduce stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }
        order.setItems(orderItems);

        // Simulate payment
        Payment payment = processPayment(order, paymentMethod);
        order.setPayment(payment);

        // Clear cart
        cartService.clearCart(userId);

        return orderRepository.save(order);
    }

    private Payment processPayment(Order order, Payment.PaymentMethod paymentMethod) {
        // Simulate payment processing (90% success rate)
        boolean isSuccess = Math.random() < 0.9;

        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .paymentMethod(paymentMethod)
                .status(isSuccess ? Payment.PaymentStatus.SUCCESS : Payment.PaymentStatus.FAILED)
                .transactionId(UUID.randomUUID().toString())
                .build();

        return paymentRepository.save(payment);
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        return orderRepository.save(order);
    }
}