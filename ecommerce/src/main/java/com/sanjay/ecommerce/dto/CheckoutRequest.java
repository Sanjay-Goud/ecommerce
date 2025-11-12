package com.sanjay.ecommerce.dto;

import com.sanjay.ecommerce.model.Payment;
import lombok.Data;

@Data
public class CheckoutRequest {
    private Long addressId;
    private Payment.PaymentMethod paymentMethod;
}
