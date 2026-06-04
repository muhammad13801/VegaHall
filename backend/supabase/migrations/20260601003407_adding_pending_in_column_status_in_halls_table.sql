ALTER TABLE public.halls
DROP CONSTRAINT halls_status_check;

ALTER TABLE public.halls
ADD CONSTRAINT halls_status_check
CHECK (status IN ('active', 'suspended', 'pending', 'rejected'));