-- Crear enum para el tipo de tarea
CREATE TYPE task_type AS ENUM (
    'personal',
    'trabajo',
    'estudio',
    'salud',
    'otro'
);

-- Crear enum para el estado de la tarea
CREATE TYPE task_status AS ENUM (
    'pendiente',
    'en_progreso',
    'completada'
);

-- Crear la tabla de tareas
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    task_type task_type NOT NULL,
    status task_status DEFAULT 'pendiente' NOT NULL,
    due_date DATE NOT NULL,
    due_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Los usuarios pueden ver sus propias tareas"
    ON public.tasks
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias tareas"
    ON public.tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias tareas"
    ON public.tasks
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias tareas"
    ON public.tasks
    FOR DELETE
    USING (auth.uid() = user_id);

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_task_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
CREATE TRIGGER set_task_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_task_updated_at();

-- Crear función para actualizar completed_at cuando el status cambia a completada
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completada' AND OLD.status != 'completada' THEN
        NEW.completed_at = TIMEZONE('utc'::text, NOW());
    ELSIF NEW.status != 'completada' AND OLD.status = 'completada' THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar completed_at
CREATE TRIGGER set_task_completion
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_task_completion();

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date); 