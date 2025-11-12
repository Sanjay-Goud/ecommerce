package com.sanjay.ecommerce.controller;

import com.sanjay.ecommerce.model.Order;
import com.sanjay.ecommerce.model.Product;
import com.sanjay.ecommerce.service.AdminService;
import com.sanjay.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = adminService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product created = adminService.createProduct(product);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product updated = adminService.updateProduct(id, product);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        adminService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        Order.OrderStatus status = Order.OrderStatus.valueOf(request.get("status"));
        Order order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> analytics = adminService.getAnalytics();
        return ResponseEntity.ok(analytics);
    }
}