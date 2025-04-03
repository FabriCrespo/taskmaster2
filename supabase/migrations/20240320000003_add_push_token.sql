-- Agregar columna push_token a la tabla users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Actualizar la función handle_new_user para incluir push_token
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, agent_name, email, push_token)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'agent_name', NEW.email, NULL);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 