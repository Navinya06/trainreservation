package com.example.trainreservation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.trainreservation.entity.Route;

@Repository
public interface RouteRepository extends JpaRepository<Route, Integer> {
}
