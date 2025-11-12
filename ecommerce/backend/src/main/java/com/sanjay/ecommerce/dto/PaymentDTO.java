package com.sanjay.ecommerce.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class PaymentDTO {
    private Long id;
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    private String transactionId;
    private LocalDateTime paymentDate;
}