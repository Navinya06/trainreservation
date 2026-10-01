package com.example.trainreservation.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.trainreservation.entity.Train;
import com.example.trainreservation.repository.TrainRepository;

@RestController
@RequestMapping("/api/trains")
public class TrainController {

    private final TrainRepository trainRepository;

    public TrainController(TrainRepository trainRepository) {
        this.trainRepository = trainRepository;
    }

    @GetMapping
    public List<Train> getAllTrains() {
        return trainRepository.findAll();
    }
}