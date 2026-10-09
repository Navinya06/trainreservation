package com.example.trainreservation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.trainreservation.entity.Train;

@Repository
public interface TrainRepository extends JpaRepository<Train, Integer> {
}
