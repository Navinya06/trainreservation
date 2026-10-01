package com.example.trainreservation.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.trainreservation.entity.Route;

public interface RouteRepository extends JpaRepository<Route, Integer> {

}