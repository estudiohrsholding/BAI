-- ============================================================
-- Script SQL para crear usuario administrador en producción
-- ============================================================
-- 
-- USO:
-- 1. Conecta a tu base de datos de producción PostgreSQL
-- 2. Ejecuta este script SQL
-- 3. Usa las credenciales generadas para iniciar sesión
--
-- ============================================================

-- Hash generado para contraseña: 'admin_prod_password'
-- Hash bcrypt: $2b$12$ifXjKQkQH.Uahn80ym23q.Cr6S2Clw8PW6RAarom6QBSR5eZLL0IG

-- Opción 1: Usuario Administrador con plan PARTNER
INSERT INTO "user" (
    email,
    hashed_password,
    full_name,
    plan_tier,
    subscription_status,
    role,
    is_active,
    features
) VALUES (
    'admin@club.com',
    '$2b$12$ifXjKQkQH.Uahn80ym23q.Cr6S2Clw8PW6RAarom6QBSR5eZLL0IG',
    'Administrador B.A.I.',
    'PARTNER',
    'active',
    'admin',
    true,
    NULL
)
ON CONFLICT (email) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    is_active = true,
    role = 'admin',
    plan_tier = 'PARTNER';

-- Opción 2: Usuario Cliente de prueba con plan MOTOR
-- Descomenta si necesitas un usuario de prueba
/*
INSERT INTO "user" (
    email,
    hashed_password,
    full_name,
    plan_tier,
    subscription_status,
    role,
    is_active
) VALUES (
    'test@baibussines.com',
    '$2b$12$ifXjKQkQH.Uahn80ym23q.Cr6S2Clw8PW6RAarom6QBSR5eZLL0IG',
    'Usuario de Prueba',
    'MOTOR',
    'active',
    'client',
    true
)
ON CONFLICT (email) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    is_active = true;
*/

-- Verificar que el usuario fue creado correctamente
SELECT 
    id,
    email,
    full_name,
    plan_tier,
    subscription_status,
    role,
    is_active,
    created_at
FROM "user"
WHERE email = 'admin@club.com';

-- ============================================================
-- CREDENCIALES DE ACCESO:
-- ============================================================
-- Email: admin@club.com
-- Contraseña: admin_prod_password
-- ============================================================

