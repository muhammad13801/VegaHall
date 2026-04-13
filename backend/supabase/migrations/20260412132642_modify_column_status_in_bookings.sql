ALTER TABLE bookings 
  DROP COLUMN status;

ALTER TABLE bookings 
  ADD COLUMN status VARCHAR(20) 
  CHECK (status IN ('confirmed', 'owner_rescheduled', 'owner_cancelled', 'customer_cancelled')) 
  NOT NULL 
  DEFAULT 'confirmed';