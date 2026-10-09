/* =========================================
   RAILRESERVE - FRONTEND
========================================= */

const $ = id => document.getElementById(id);

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const RUPEE = '\u20B9';
const money = n => RUPEE + Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2 });
const TICK = '\u2705 ';
const CROSS = '\u274C ';
//asyns --->func pause and wait, await-->pause at that line until the reply arrives, then continues
async function getJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error((await res.text()) || res.statusText);
    return res.json();
}

async function postJSON(url, body) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || res.statusText);
    return text ? JSON.parse(text) : null;
}

function notify(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = 'form-message ' + (type || '');
}

function failBox(box, text) {
    box.innerHTML = '<div class="loading-card">' + esc(text) + '</div>';
}

function fillSelect(sel, items, valueFn, labelFn, placeholder) {
    const old = sel.value;
    sel.innerHTML = '<option value="">' + esc(placeholder) + '</option>' +
        items.map(i => '<option value="' + esc(valueFn(i)) + '">' + esc(labelFn(i)) + '</option>').join('');
    if ([...sel.options].some(o => o.value === old)) sel.value = old;
}

/* ---------- shared tables ---------- */

async function loadAboveAverage(tbodyId) {
    const body = $(tbodyId);
    if (!body) return;
    try {
        const rows = await getJSON('/api/reservations/above-average');
        body.innerHTML = rows.length
            ? rows.map(r => '<tr><td>' + esc(r[0]) + '</td><td><strong>' + esc(r[1]) +
                '</strong></td><td><span class="pill">' + esc(r[2]) + ' bookings</span></td></tr>').join('')
            : '<tr><td colspan="3" class="empty-cell">No train is above the average yet. Book more tickets to see results.</td></tr>';
    } catch (e) {
        body.innerHTML = '<tr><td colspan="3" class="empty-cell">Could not load data.</td></tr>';
    }
}

async function loadReservations() {
    const body = $('reservationTable');
    if (!body) return;
    try {
        const rows = await getJSON('/api/reservations/join');
        body.innerHTML = rows.length
            ? rows.map(r => '<tr><td>#' + esc(r[0]) + '</td><td><strong>' + esc(r[1]) + '</strong></td><td>' +
                esc(r[2]) + '</td><td>' + esc(r[3]) + '</td><td>' + esc(r[4]) + '</td><td>' + esc(r[5]) +
                '</td><td>' + money(r[6]) + '</td><td>' + esc(r[7]) + '</td></tr>').join('')
            : '<tr><td colspan="8" class="empty-cell">No reservations yet. Book your first ticket above.</td></tr>';
    } catch (e) {
        body.innerHTML = '<tr><td colspan="8" class="empty-cell">Could not load reservations.</td></tr>';
    }
}

/* =========================================
   HOME
========================================= */

async function setupHome() {
    if (!$('statTrains')) return;

    try {
        const [trains, routes, passengers, bookings] = await Promise.all([
            getJSON('/api/trains'), getJSON('/api/routes'),
            getJSON('/api/passengers'), getJSON('/api/reservations/join')]);

        $('statTrains').textContent = trains.length;
        $('statRoutes').textContent = routes.length;
        $('statPassengers').textContent = passengers.length;
        $('statBookings').textContent = bookings.length;

        const from = $('fromCity'), to = $('toCity');
        const sources = [...new Set(routes.map(r => r.source))];
        const dests = [...new Set(routes.map(r => r.destination))];
        const all = [...new Set([...sources, ...dests])];
        fillSelect(from, all, s => s, s => s, 'Select city');
        fillSelect(to, all, s => s, s => s, 'Select city');
        if (sources.length) from.value = sources[0];
        if (dests.length) to.value = dests[0];

        const updateLink = () => {
            $('searchBtn').href = (from.value && to.value)
                ? 'trains.html?from=' + encodeURIComponent(from.value) + '&to=' + encodeURIComponent(to.value)
                : 'trains.html';
        };
        from.onchange = updateLink;
        to.onchange = updateLink;
        const swap = () => {
            const a = from.value, b = to.value;
            from.value = b; to.value = a; updateLink();
        };
        $('swapBtn').onclick = swap;
        $('swapBtn').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); swap(); } };
        updateLink();
    } catch (e) {
        console.error(e);
    }

    loadAboveAverage('aboveAverageTable');
}

/* =========================================
   TRAINS
========================================= */

function trainCard(t) {
    const total = t.totalSeats || 0, avail = t.availableSeats || 0;
    const pct = total ? Math.round(avail / total * 100) : 0;
    const cls = avail === 0 ? 'full' : (pct < 20 ? 'low' : '');
    const label = avail === 0 ? 'Sold out' : avail + ' seats left';
    return '<div class="train-card">' +
        '<div class="train-top"><div class="train-logo">\uD83D\uDE86</div><span class="seat-badge ' + cls + '">' + label + '</span></div>' +
        '<h3>' + esc(t.trainName) + '</h3>' +
        '<div class="train-number">No. ' + esc(t.trainNumber) + '</div>' +
        '<div class="train-details">' +
        '<div class="train-detail"><small>TOTAL SEATS</small><strong>' + esc(total) + '</strong></div>' +
        '<div class="train-detail"><small>AVAILABLE</small><strong>' + esc(avail) + '</strong></div></div>' +
        '<div class="seat-meter" title="' + pct + '% available"><span style="width:' + pct + '%"></span></div>' +
        '</div>';
}

async function setupTrains() {
    const box = $('trainContainer');
    if (!box) return;

    async function load() {
        try {
            let [trains, routes] = await Promise.all([getJSON('/api/trains'), getJSON('/api/routes')]);
            const p = new URLSearchParams(location.search);
            const from = p.get('from'), to = p.get('to'), note = $('filterNote');
            if (from && to) {
                const ids = new Set(routes.filter(r => r.source === from && r.destination === to).map(r => r.trainId));
                trains = trains.filter(t => ids.has(t.trainId));
                note.innerHTML = 'Showing trains from <strong>' + esc(from) + '</strong> to <strong>' +
                    esc(to) + '</strong>. <a href="trains.html">Show all trains</a>';
                note.hidden = false;
            }
            box.innerHTML = trains.length ? trains.map(trainCard).join('')
                : '<div class="loading-card">No trains found. Add one using the form above.</div>';
        } catch (e) {
            failBox(box, 'Could not load trains. Is the server running?');
        }
    }

    $('trainForm').addEventListener('submit', async ev => {
        ev.preventDefault();
        const msg = $('trainMessage');
        notify(msg, 'Saving...', 'info');
        try {
            await postJSON('/api/trains', {
                trainName: $('trainName').value.trim(),
                trainNumber: $('trainNumber').value.trim(),
                totalSeats: Number($('totalSeats').value)
            });
            ev.target.reset();
            notify(msg, TICK + 'Train saved', 'ok');
            load();
        } catch (e) { notify(msg, CROSS + e.message, 'err'); }
    });

    load();
}

/* =========================================
   ROUTES
========================================= */

async function setupRoutes() {
    const box = $('routeContainer');
    if (!box) return;
    let trains = [];

    async function load() {
        try {
            const [t, routes] = await Promise.all([getJSON('/api/trains'), getJSON('/api/routes')]);
            trains = t;
            fillSelect($('routeTrain'), trains, x => x.trainId, x => x.trainName + ' (' + x.trainNumber + ')', 'Select train');
            const name = id => (trains.find(x => x.trainId === id) || {}).trainName || 'Train ' + id;
            box.innerHTML = routes.length ? routes.map(r =>
                '<div class="route-card"><div class="route-number">ROUTE ' + esc(r.routeId) + '</div>' +
                '<div class="route-path"><span class="route-city">' + esc(r.source) + '</span>' +
                '<span class="route-arrow">\u2192</span><span class="route-city">' + esc(r.destination) + '</span></div>' +
                '<div class="route-distance">Distance: ' + esc(r.distanceKm) + ' km &nbsp;|&nbsp; Train: ' + esc(name(r.trainId)) + '</div></div>'
            ).join('') : '<div class="loading-card">No routes yet. Add one using the form above.</div>';
        } catch (e) {
            failBox(box, 'Could not load routes. Is the server running?');
        }
    }

    $('routeForm').addEventListener('submit', async ev => {
        ev.preventDefault();
        const msg = $('routeMessage');
        notify(msg, 'Saving...', 'info');
        try {
            await postJSON('/api/routes', {
                trainId: Number($('routeTrain').value),
                source: $('routeSource').value.trim(),
                destination: $('routeDestination').value.trim(),
                distanceKm: Number($('routeDistance').value)
            });
            ev.target.reset();
            notify(msg, TICK + 'Route saved', 'ok');
            load();
        } catch (e) { notify(msg, CROSS + e.message, 'err'); }
    });

    load();
}

/* =========================================
   PASSENGERS
========================================= */

async function setupPassengers() {
    const body = $('passengerTable');
    if (!body) return;

    async function load() {
        try {
            const list = await getJSON('/api/passengers');
            body.innerHTML = list.length ? list.map(p =>
                '<tr><td>#' + esc(p.passengerId) + '</td><td><strong>' + esc(p.passengerName) + '</strong></td><td>' +
                esc(p.age) + '</td><td>' + esc(p.gender) + '</td><td>' + esc(p.phone) + '</td></tr>').join('')
                : '<tr><td colspan="5" class="empty-cell">No passengers yet. Register one using the form above.</td></tr>';
        } catch (e) {
            body.innerHTML = '<tr><td colspan="5" class="empty-cell">Could not load passengers.</td></tr>';
        }
    }

    $('passengerForm').addEventListener('submit', async ev => {
        ev.preventDefault();
        const msg = $('passengerMessage');
        notify(msg, 'Saving...', 'info');
        try {
            await postJSON('/api/passengers', {
                passengerName: $('passengerName').value.trim(),
                age: Number($('passengerAge').value),
                gender: $('passengerGender').value,
                phone: $('passengerPhone').value.trim()
            });
            ev.target.reset();
            notify(msg, TICK + 'Passenger saved', 'ok');
            load();
        } catch (e) { notify(msg, CROSS + e.message, 'err'); }
    });

    load();
}

/* =========================================
   RESERVATION FORM
========================================= */

async function setupReservation() {
    const form = $('reservationForm');
    if (!form) return;

    const message = $('reservationMessage');
    let routes = [];

    async function loadChoices() {
        const [passengers, trains, r] = await Promise.all([
            getJSON('/api/passengers'), getJSON('/api/trains'), getJSON('/api/routes')]);
        routes = r;
        fillSelect($('passengerId'), passengers, p => p.passengerId,
            p => p.passengerName + ' (ID ' + p.passengerId + ')', 'Select passenger');
        fillSelect($('trainId'), trains, t => t.trainId,
            t => t.trainName + ' - ' + t.availableSeats + ' seats left', 'Select train');
        fillRoutes();
    }

    function fillRoutes() {
        const trainId = Number($('trainId').value);
        const sel = $('routeId');
        const list = routes.filter(r => r.trainId === trainId);
        sel.disabled = !trainId;
        fillSelect(sel, list, r => r.routeId,
            r => r.source + ' to ' + r.destination + ' (' + r.distanceKm + ' km)',
            trainId ? (list.length ? 'Select route' : 'No routes for this train') : 'Select a train first');
        if (list.length === 1) sel.value = list[0].routeId;
        updateFare();
    }

    async function updateFare() {
        const route = routes.find(r => String(r.routeId) === $('routeId').value);
        const seats = Number($('seats').value);
        if (!route || seats < 1) { $('fareAmount').textContent = money(0); return; }
        try {
            const fare = await getJSON('/api/reservations/fare?distance=' + route.distanceKm + '&seats=' + seats);
            $('fareAmount').textContent = money(fare);
        } catch (e) { $('fareAmount').textContent = money(0); }
    }

    $('trainId').addEventListener('change', fillRoutes);
    $('routeId').addEventListener('change', updateFare);
    $('seats').addEventListener('input', updateFare);

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const passengerId = $('passengerId').value;
        const trainId = $('trainId').value;
        const routeId = $('routeId').value;
        const seats = $('seats').value;

        if (!passengerId || !trainId || !routeId || !seats) {
            notify(message, 'Please fill all details.', 'err');
            return;
        }

        const btn = $('bookBtn');
        btn.disabled = true;
        notify(message, 'Booking your ticket...', 'info');

        try {
            const response = await fetch(
                '/api/reservations/book?passengerId=' + passengerId + '&trainId=' + trainId +
                '&routeId=' + routeId + '&seats=' + seats, { method: 'POST' });
            const data = await response.json();

            if (response.ok) {
                notify(message, TICK + data.message, 'ok');
                await loadChoices();
                loadReservations();
                loadAboveAverage('aboveAverageTable2');
            } else {
                notify(message, CROSS + data.message, 'err');
            }
        } catch (error) {
            console.error('Booking error:', error);
            notify(message, CROSS + 'Booking failed. Please try again.', 'err');
        } finally {
            btn.disabled = false;
        }
    });

    try { await loadChoices(); }
    catch (e) { notify(message, CROSS + 'Could not load data. Is the server running?', 'err'); }

    loadReservations();
    loadAboveAverage('aboveAverageTable2');
}

/* =========================================
   START
========================================= */

document.addEventListener('DOMContentLoaded', () => {
    setupHome();
    setupTrains();
    setupRoutes();
    setupPassengers();
    setupReservation();
});