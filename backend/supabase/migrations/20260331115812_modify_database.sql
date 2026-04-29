DROP TABLE payments;
DROP TABLE bookings;
DROP TABLE favoritehalls;

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

CREATE TABLE cutomer_payments(
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(id) ON DELETE CASCADE,
    booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    type VARCHAR(10) NOT NULL,
    status VARCHAR(10) NOT NULL,
    payment_intent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE favorite_halls(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    hall_id INT REFERENCES halls(id) ON DELETE CASCADE
);

ALTER TABLE hall_services DROP COLUMN status;