package com.example.trainreservation.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.trainreservation.repository.ReservationRepository;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationRepository reservationRepository;

    public ReservationController(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    // BOOK TICKET (calls the stored procedure)
    @PostMapping("/book")
    public ResponseEntity<Map<String, String>> bookTicket(
            @RequestParam int passengerId,
            @RequestParam int trainId,
            @RequestParam int routeId,
            @RequestParam int seats) {
        try {
            reservationRepository.reserveTicket(passengerId, trainId, routeId, seats);
            return ResponseEntity.ok(Map.of("message", "Ticket reserved successfully!"));
        } catch (Exception e) {
            Throwable root = e;
            while (root.getCause() != null) {
                root = root.getCause();
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("message", String.valueOf(root.getMessage())));
        }
    }

    // JOIN
    @GetMapping("/join")
    public List<Object[]> getReservationsWithJoin() {
        return reservationRepository.findReservationsWithJoin();
    }

    // SUBQUERY
    @GetMapping("/above-average")
    public List<Object[]> getTrainsAboveAverage() {
        return reservationRepository.findTrainsAboveAverage();
    }

    // FUNCTION // ticket fare = distance x Rs.1.50 per km x seats
    @GetMapping("/fare")
    public Double calculateFare(@RequestParam double distance, @RequestParam int seats) {
        return reservationRepository.calculateFare(distance, seats);
    }
}
