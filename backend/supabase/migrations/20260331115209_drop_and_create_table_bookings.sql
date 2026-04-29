DROP TABLE bookings;

CREATE TABLE bookings(
    id SERIAL PRIMARY KEY,
    hall_id INT REFERENCES halls(id) ON DELETE CASCADE,
    customer_id INT REFERENCES users(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    guests_number INT NOT NULL,
    services JSONB,
    proposed_date DATE,
    status VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);