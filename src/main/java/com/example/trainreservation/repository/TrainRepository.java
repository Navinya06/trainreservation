package com.example.trainreservation.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.trainreservation.entity.Train;

public interface TrainRepository extends JpaRepository<Train, Integer> {

}