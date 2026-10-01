package com.example.trainreservation.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.trainreservation.entity.Passenger;
import com.example.trainreservation.repository.PassengerRepository;

@RestController
@RequestMapping("/api/passengers")
public class PassengerController {

    private final PassengerRepository passengerRepository;

    public PassengerController(PassengerRepository passengerRepository) {
        this.passengerRepository = passengerRepository;
    }

    @GetMapping
    public List<Passenger> getAllPassengers() {
        return passengerRepository.findAll();
    }
}