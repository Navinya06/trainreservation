package com.example.trainreservation.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.trainreservation.entity.Reservation;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    // JOIN: reservations with passenger, train and route details
    @Query(value = """
        SELECT r.reservation_id,
               p.passenger_name,
               t.train_name,
               ro.source,
               ro.destination,
               r.seats_booked,
               r.fare,
               r.reservation_date
        FROM reservations r
        JOIN passengers p ON r.passenger_id = p.passenger_id
        JOIN trains t     ON r.train_id = t.train_id
        JOIN routes ro    ON r.route_id = ro.route_id
        ORDER BY r.reservation_id DESC
        """, nativeQuery = true)
    List<Object[]> findReservationsWithJoin();

    // SUBQUERY: trains with more reservations than the average train
    @Query(value = """
        SELECT t.train_id,
               t.train_name,
               COUNT(r.reservation_id) AS reservation_count
        FROM trains t
        JOIN reservations r ON t.train_id = r.train_id
        GROUP BY t.train_id, t.train_name
        HAVING COUNT(r.reservation_id) > (
            SELECT AVG(reservation_count)
            FROM (
                SELECT COUNT(*) AS reservation_count
                FROM reservations
                GROUP BY train_id
            ) x
        )
        """, nativeQuery = true)
    List<Object[]> findTrainsAboveAverage();

    // PROCEDURE: reserve_ticket (the trigger then updates available seats)
    @Transactional
    @Modifying
    @Query(value = "CALL reserve_ticket(:passengerId, :trainId, :routeId, :seats)", nativeQuery = true)
    void reserveTicket(@Param("passengerId") int passengerId,
                       @Param("trainId") int trainId,
                       @Param("routeId") int routeId,
                       @Param("seats") int seats);

    // FUNCTION: calculate_fare
    @Query(value = "SELECT calculate_fare(:distance, :seats)", nativeQuery = true)
    Double calculateFare(@Param("distance") double distance,
                         @Param("seats") int seats);
}
