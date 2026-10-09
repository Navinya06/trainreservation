package com.example.trainreservation.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.trainreservation.entity.Train;
import com.example.trainreservation.repository.TrainRepository;

@RestController
@RequestMapping("/api/trains")
public class TrainController {

    private final TrainRepository repository;

    public TrainController(TrainRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Train> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Train add(@RequestBody Train train) {
        train.setTrainId(null);
        if (train.getAvailableSeats() == null) {
            train.setAvailableSeats(train.getTotalSeats());
        }
        return repository.save(train);
    }
}