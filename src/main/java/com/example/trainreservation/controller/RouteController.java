package com.example.trainreservation.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.trainreservation.entity.Route;
import com.example.trainreservation.repository.RouteRepository;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteRepository repository;

    public RouteController(RouteRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Route> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Route add(@RequestBody Route route) {
        route.setRouteId(null);
        return repository.save(route);
    }
}