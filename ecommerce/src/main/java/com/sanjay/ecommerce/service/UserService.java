package com.sanjay.ecommerce.service;

import com.sanjay.ecommerce.model.User;
import com.sanjay.ecommerce.model.Address;
import com.sanjay.ecommerce.repository.UserRepository;
import com.sanjay.ecommerce.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(Long userId, User updateData) {
        User user = getUserById(userId);
        user.setFullName(updateData.getFullName());
        user.setPhone(updateData.getPhone());
        return userRepository.save(user);
    }

    public List<Address> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    public Address addAddress(Long userId, Address address) {
        User user = getUserById(userId);
        address.setUser(user);
        return addressRepository.save(address);
    }

    public Address updateAddress(Long addressId, Address updateData) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        address.setFullName(updateData.getFullName());
        address.setPhone(updateData.getPhone());
        address.setAddressLine1(updateData.getAddressLine1());
        address.setAddressLine2(updateData.getAddressLine2());
        address.setCity(updateData.getCity());
        address.setState(updateData.getState());
        address.setZipCode(updateData.getZipCode());
        address.setCountry(updateData.getCountry());
        return addressRepository.save(address);
    }

    public void deleteAddress(Long addressId) {
        addressRepository.deleteById(addressId);
    }
}