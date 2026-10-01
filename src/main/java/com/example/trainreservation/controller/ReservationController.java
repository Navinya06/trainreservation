package com.example.trainreservation.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final JdbcTemplate jdbcTemplate;

    public ReservationController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/book")
    public Map<String, String> bookTicket(
            @RequestParam int passengerId,
            @RequestParam int trainId,
            @RequestParam int routeId,
            @RequestParam int seats) {

        try {

            jdbcTemplate.update(
                "CALL reserve_ticket(?, ?, ?, ?)",
                passengerId,
                trainId,
                routeId,
                seats
            );

            return Map.of(
                "message",
                "Ticket reserved successfully!"
            );

        } catch (Exception e) {

            return Map.of(
                "message",
                "Booking failed: " + e.getMessage()
            );
        }
    }
}