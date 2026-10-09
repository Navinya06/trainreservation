package com.example.trainreservation.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.trainreservation.entity.Passenger;
import com.example.trainreservation.repository.PassengerRepository;

@RestController
@RequestMapping("/api/passengers")
public class PassengerController {

    private final PassengerRepository repository;

    public PassengerController(PassengerRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Passenger> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Passenger add(@RequestBody Passenger passenger) {
        passenger.setPassengerId(null);
        return repository.save(passenger);
    }
}