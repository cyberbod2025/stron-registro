-- Crea la tabla de clases
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date_str TEXT NOT NULL,
    time_str TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    is_private_location BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pendiente',
    min_required INTEGER NOT NULL DEFAULT 5,
    deadline_str TEXT,
    maps_url TEXT,
    waze_url TEXT,
    calendar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crea la tabla de alumnas (students)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crea la tabla de registros (registrations)
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    is_committed BOOLEAN NOT NULL DEFAULT false,
    understands_goal BOOLEAN NOT NULL DEFAULT false,
    will_cancel_in_time BOOLEAN NOT NULL DEFAULT false,
    attended BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- Configura la seguridad (Row Level Security)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Políticas temporales para V1: 
DO $$
BEGIN
    -- Classes policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clases visibles para todos' AND tablename = 'classes') THEN
        CREATE POLICY "Clases visibles para todos" ON public.classes FOR SELECT USING (true);
    END IF;
    
    -- Students policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Cualquiera puede crear estudiantes' AND tablename = 'students') THEN
        CREATE POLICY "Cualquiera puede crear estudiantes" ON public.students FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Estudiantes visibles para todos en V1' AND tablename = 'students') THEN
        CREATE POLICY "Estudiantes visibles para todos en V1" ON public.students FOR SELECT USING (true);
    END IF;

    -- Registrations policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Cualquiera puede registrarse' AND tablename = 'registrations') THEN
        CREATE POLICY "Cualquiera puede registrarse" ON public.registrations FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Registros visibles para todos en V1' AND tablename = 'registrations') THEN
        CREATE POLICY "Registros visibles para todos en V1" ON public.registrations FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Cualquiera puede actualizar en V1' AND tablename = 'registrations') THEN
        CREATE POLICY "Cualquiera puede actualizar en V1" ON public.registrations FOR UPDATE USING (true);
    END IF;
END $$;

-- Opcional: Insertar las clases iniciales (mock)
INSERT INTO public.classes (title, date_str, time_str, location, address, is_private_location, status, min_required, deadline_str, maps_url, waze_url)
VALUES 
('Strong Nation', 'Martes', '9:00 a.m.', 'Casa de Nidia', 'Ubicación compartida solo a alumnas registradas', true, 'confirmada', 5, 'lunes 8:00 p.m.', 'https://maps.app.goo.gl/DPtUq6P3PiWHNB5u7', 'WAZE_URL_CASA_DE_VIRI'),
('Strong Nation', 'Jueves', '9:00 a.m.', 'Casa de Nidia', 'Ubicación compartida solo a alumnas registradas', true, 'pendiente', 5, 'miércoles 8:00 p.m.', 'https://maps.app.goo.gl/DPtUq6P3PiWHNB5u7', 'WAZE_URL_CASA_DE_VIRI'),
('Strong Nation', 'Domingo', '8:30 a.m.', 'Day Cardio', 'Dirección Pública Day Cardio', false, 'suspendida', 5, 'sábado 8:00 p.m.', 'https://maps.app.goo.gl/wDKZqsd9wULqMp5S6', 'WAZE_URL_DAY_CARDIO');
