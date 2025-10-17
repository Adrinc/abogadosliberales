-- ============================================
-- Políticas RLS para public.customers
-- ============================================
-- Este script configura las políticas de seguridad necesarias
-- para que el frontend pueda insertar/actualizar/leer customers

-- 1. Habilitar RLS en la tabla customers (si no está habilitado)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 2. Permitir INSERT público (anon) para crear nuevos customers
CREATE POLICY "Allow public insert on customers" 
ON public.customers
FOR INSERT 
TO anon
WITH CHECK (true);

-- 3. Permitir SELECT público (anon) para buscar customers por email
CREATE POLICY "Allow public select on customers" 
ON public.customers
FOR SELECT 
TO anon
USING (true);

-- 4. Permitir UPDATE público (anon) para actualizar datos de customers
CREATE POLICY "Allow public update on customers" 
ON public.customers
FOR UPDATE 
TO anon
USING (true)
WITH CHECK (true);

-- ============================================
-- Índices para optimizar búsquedas
-- ============================================

-- Índice en email (búsquedas frecuentes por email)
CREATE INDEX IF NOT EXISTS idx_customers_email 
ON public.customers(email);

-- Índice en status (filtrado por estado)
CREATE INDEX IF NOT EXISTS idx_customers_status 
ON public.customers(status);

-- Índice en created_at (ordenamiento por fecha)
CREATE INDEX IF NOT EXISTS idx_customers_created_at 
ON public.customers(created_at DESC);

-- ============================================
-- Constraint para email único
-- ============================================

-- Asegurar que email sea único (si no existe el constraint)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'customers_email_unique'
  ) THEN
    ALTER TABLE public.customers 
    ADD CONSTRAINT customers_email_unique UNIQUE (email);
  END IF;
END $$;

-- ============================================
-- Verificación de Políticas
-- ============================================

-- Para verificar que las políticas se aplicaron correctamente:
-- SELECT * FROM pg_policies WHERE tablename = 'customers';

-- Para verificar los índices:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'customers';

-- ============================================
-- Notas de Seguridad
-- ============================================

/*
IMPORTANTE: Estas políticas son muy permisivas (anon puede INSERT/SELECT/UPDATE).
Para producción, considera:

1. Restringir UPDATE solo a campos específicos:
   - Permitir actualizar solo first_name, last_name, mobile_phone
   - NO permitir actualizar email (clave única)
   
2. Implementar autenticación:
   - Usuarios autenticados (authenticated role) en lugar de anon
   - Cada usuario solo puede ver/editar su propio registro
   
3. Logging de auditoría:
   - Crear tabla de auditoría para registrar cambios
   - Trigger para rastrear quién modificó qué y cuándo

Ejemplo de política más restrictiva:

CREATE POLICY "Users can update only their own data" 
ON public.customers
FOR UPDATE 
TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);
*/
