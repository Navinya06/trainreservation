package com.example.trainreservation.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.trainreservation.entity.Passenger;

public interface PassengerRepository extends JpaRepository<Passenger, Integer> {

}