package com.example.trainreservation.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.trainreservation.entity.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

}