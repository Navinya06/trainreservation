const API_URL = "";


/* =========================================
   LOAD TRAINS
========================================= */

function loadTrains() {

    const container =
        document.getElementById("trainContainer");

    if (!container) {
        return;
    }


    fetch(API_URL + "/api/trains")

        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load trains");
            }

            return response.json();

        })

        .then(trains => {

            container.innerHTML = "";


            trains.forEach(train => {

                const card =
                    document.createElement("div");

                card.className = "train-card";


                const available =
                    train.availableSeats;


                card.innerHTML = `

                    <div class="train-top">

                        <div class="train-logo">
                            🚆
                        </div>

                        <span class="seat-badge">
                            ${available} seats available
                        </span>

                    </div>


                    <h3>
                        ${train.trainName}
                    </h3>


                    <div class="train-number">
                        TRAIN ${train.trainNumber}
                    </div>


                    <div class="train-details">

                        <div class="train-detail">

                            <small>
                                Total Seats
                            </small>

                            <strong>
                                ${train.totalSeats}
                            </strong>

                        </div>


                        <div class="train-detail">

                            <small>
                                Available
                            </small>

                            <strong>
                                ${train.availableSeats}
                            </strong>

                        </div>

                    </div>


                    <br>


                    <a href="reservation.html"
                       class="btn-primary">

                        Reserve →

                    </a>

                `;


                container.appendChild(card);

            });

        })

        .catch(error => {

            console.error(error);

            container.innerHTML = `

                <div class="loading-card">

                    Unable to load trains.

                    <br><br>

                    Please make sure Spring Boot
                    is running.

                </div>

            `;

        });

}


/* =========================================
   LOAD PASSENGERS
========================================= */

function loadPassengers() {

    const table =
        document.getElementById("passengerTable");

    if (!table) {
        return;
    }


    fetch(API_URL + "/api/passengers")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Failed to load passengers"
                );
            }

            return response.json();

        })

        .then(passengers => {

            table.innerHTML = "";


            passengers.forEach(passenger => {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        #${passenger.passengerId}
                    </td>

                    <td>
                        <strong>
                            ${passenger.passengerName}
                        </strong>
                    </td>

                    <td>
                        ${passenger.age}
                    </td>

                    <td>
                        ${passenger.gender}
                    </td>

                    <td>
                        ${passenger.phone}
                    </td>

                `;


                table.appendChild(row);

            });

        })

        .catch(error => {

            console.error(error);

            table.innerHTML = `

                <tr>

                    <td colspan="5"
                        class="table-loading">

                        Unable to load passengers.

                    </td>

                </tr>

            `;

        });

}


/* =========================================
   LOAD ROUTES
========================================= */

function loadRoutes() {

    const container =
        document.getElementById("routeContainer");

    if (!container) {
        return;
    }


    fetch(API_URL + "/api/routes")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Failed to load routes"
                );
            }

            return response.json();

        })

        .then(routes => {

            container.innerHTML = "";


            routes.forEach(route => {

                const card =
                    document.createElement("div");

                card.className = "route-card";


                card.innerHTML = `

                    <div class="route-number">

                        ROUTE #${route.routeId}

                    </div>


                    <div class="route-path">

                        <span class="route-city">

                            ${route.source}

                        </span>


                        <span class="route-arrow">
                            →
                        </span>


                        <span class="route-city">

                            ${route.destination}

                        </span>

                    </div>


                    <p class="route-distance">

                        🛤️ Distance:

                        <strong>
                            ${route.distanceKm} km
                        </strong>

                    </p>

                `;


                container.appendChild(card);

            });

        })

        .catch(error => {

            console.error(error);

            container.innerHTML = `

                <div class="loading-card">

                    Unable to load routes.

                </div>

            `;

        });

}


/* =========================================
   RESERVATION DROPDOWNS
========================================= */

function loadReservationData() {

    const passengerSelect =
        document.getElementById("passengerId");

    const trainSelect =
        document.getElementById("trainId");

    const routeSelect =
        document.getElementById("routeId");


    if (!passengerSelect) {
        return;
    }


    /* PASSENGERS */

    fetch(API_URL + "/api/passengers")

        .then(response => response.json())

        .then(passengers => {

            passengers.forEach(passenger => {

                const option =
                    document.createElement("option");

                option.value =
                    passenger.passengerId;

                option.textContent =
                    passenger.passengerName;

                passengerSelect.appendChild(option);

            });

        });


    /* TRAINS */

    fetch(API_URL + "/api/trains")

        .then(response => response.json())

        .then(trains => {

            trains.forEach(train => {

                const option =
                    document.createElement("option");

                option.value =
                    train.trainId;

                option.textContent =
                    train.trainName +
                    " - " +
                    train.trainNumber;

                trainSelect.appendChild(option);

            });

        });


    /* ROUTES */

    fetch(API_URL + "/api/routes")

        .then(response => response.json())

        .then(routes => {

            routes.forEach(route => {

                const option =
                    document.createElement("option");

                option.value =
                    route.routeId;

                option.textContent =
                    route.source +
                    " → " +
                    route.destination;

                routeSelect.appendChild(option);

            });

        });

}


/* =========================================
   RESERVATION FORM
========================================= */

function setupReservation() {

    const form =
        document.getElementById("reservationForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const passengerId =
                document.getElementById(
                    "passengerId"
                ).value;


            const trainId =
                document.getElementById(
                    "trainId"
                ).value;


            const routeId =
                document.getElementById(
                    "routeId"
                ).value;


            const seats =
                document.getElementById(
                    "seats"
                ).value;


            const message =
                document.getElementById(
                    "reservationMessage"
                );


            if (
                !passengerId ||
                !trainId ||
                !routeId ||
                !seats
            ) {

                message.innerHTML =
                    "Please fill all details.";

                return;

            }


            /*
             * IMPORTANT:
             *
             * We will connect this button
             * to the Spring Boot procedure
             * API after creating the endpoint.
             */

            message.innerHTML =

                "Booking details ready. " +
                "Reservation API will be connected next.";

        }
    );

}


/* =========================================
   PAGE INITIALIZATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadTrains();

        loadPassengers();

        loadRoutes();

        loadReservationData();

        setupReservation();

    }
);