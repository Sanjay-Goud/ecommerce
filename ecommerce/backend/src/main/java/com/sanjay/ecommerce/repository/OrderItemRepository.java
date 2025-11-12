package com.sanjay.ecommerce.repository;

import com.sanjay.ecommerce.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("SELECT oi.product.name, SUM(oi.quantity) as total FROM OrderItem oi GROUP BY oi.product.id, oi.product.name ORDER BY total DESC")
    List<Object[]> findTopSellingProducts();
}