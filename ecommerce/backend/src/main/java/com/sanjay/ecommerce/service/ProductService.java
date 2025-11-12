package com.sanjay.ecommerce.service;

import com.sanjay.ecommerce.model.Product;
import com.sanjay.ecommerce.model.Category;
import com.sanjay.ecommerce.repository.ProductRepository;
import com.sanjay.ecommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Product> searchProducts(String query) {
        return productRepository.searchProducts(query);
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> filterAndSortProducts(Long categoryId, String sortBy, Double minPrice, Double maxPrice) {
        List<Product> products;

        if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId);
        } else {
            products = productRepository.findAll();
        }

        // Filter by price
        if (minPrice != null || maxPrice != null) {
            products = products.stream()
                    .filter(p -> {
                        if (minPrice != null && p.getPrice().doubleValue() < minPrice) return false;
                        if (maxPrice != null && p.getPrice().doubleValue() > maxPrice) return false;
                        return true;
                    })
                    .collect(Collectors.toList());
        }

        // Sort
        if (sortBy != null) {
            switch (sortBy) {
                case "price_low":
                    products.sort(Comparator.comparing(Product::getPrice));
                    break;
                case "price_high":
                    products.sort(Comparator.comparing(Product::getPrice).reversed());
                    break;
                case "rating":
                    products.sort(Comparator.comparing(Product::getAverageRating).reversed());
                    break;
                case "newest":
                    products.sort(Comparator.comparing(Product::getCreatedAt).reversed());
                    break;
            }
        }

        return products;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}