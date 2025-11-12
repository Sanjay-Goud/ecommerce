package com.sanjay.ecommerce.service;

import com.sanjay.ecommerce.model.*;
import com.sanjay.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long productId, Product updateData) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(updateData.getName());
        product.setDescription(updateData.getDescription());
        product.setPrice(updateData.getPrice());
        product.setStock(updateData.getStock());
        product.setCategory(updateData.getCategory());
        if (updateData.getImageUrl() != null) {
            product.setImageUrl(updateData.getImageUrl());
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        // Total users
        Long totalUsers = userRepository.count();
        analytics.put("totalUsers", totalUsers);

        // Total orders
        Long totalOrders = orderRepository.countTotalOrders();
        analytics.put("totalOrders", totalOrders);

        // Total revenue
        Double totalRevenue = orderRepository.getTotalRevenue();
        analytics.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        // Top selling products
        List<Object[]> topProducts = orderItemRepository.findTopSellingProducts();
        List<Map<String, Object>> topProductsList = new ArrayList<>();
        for (Object[] row : topProducts) {
            Map<String, Object> productData = new HashMap<>();
            productData.put("name", row[0]);
            productData.put("totalSold", row[1]);
            topProductsList.add(productData);
        }
        analytics.put("topProducts", topProductsList);

        return analytics;
    }
}