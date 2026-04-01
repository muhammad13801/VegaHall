-- إضافة الأعمدة الناقصة لجدول halls
ALTER TABLE public.halls ADD COLUMN IF NOT EXISTS city VARCHAR(30);
ALTER TABLE public.halls ADD COLUMN IF NOT EXISTS capacity INTEGER;

-- إضافة الأعمدة الناقصة لجدول bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS guest_count INTEGER;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS total_cost INTEGER;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS created_at DATE DEFAULT CURRENT_DATE;

-- إضافة created_at للتقييمات
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS created_at DATE DEFAULT CURRENT_DATE;
