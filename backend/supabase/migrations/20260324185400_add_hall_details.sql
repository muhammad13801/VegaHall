-- Add capacity and city to the halls table
-- These were added to support the frontend's HallData interface.
ALTER TABLE public.halls
ADD COLUMN IF NOT EXISTS capacity integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS city varchar(30) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS address varchar(100) NOT NULL DEFAULT '';

-- Add price column to hall_services to manage service-specific pricing
ALTER TABLE public.hall_services
ADD COLUMN IF NOT EXISTS price integer DEFAULT 0;

ALTER TABLE public.hall_services
DROP COLUMN IF EXISTS description;

-- Create a new table to store meal options for halls that offer dinner services
CREATE TABLE public.meal_options (
    id serial PRIMARY KEY,
    hall_id integer NOT NULL REFERENCES public.halls(id) ON DELETE CASCADE,
    name varchar(50) NOT NULL,
    price_per_person integer NOT NULL
);

-- Create a new table to store secondary contacts for halls
CREATE TABLE public.secondary_contacts (
    id serial PRIMARY KEY,
    hall_id integer NOT NULL REFERENCES public.halls(id) ON DELETE CASCADE,
    first_name varchar(30) NOT NULL,
    last_name varchar(30) NOT NULL,
    phone_number varchar(16) NOT NULL
);
