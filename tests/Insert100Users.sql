INSERT INTO tenant_001.users (email, password_hash, role, profile, created_at, updated_at)
WITH restaurant_users AS (
    SELECT gs, 
           CASE gs % 50
               WHEN 0 THEN 'María'
               WHEN 1 THEN 'Carmen'
               WHEN 2 THEN 'Ana'
               WHEN 3 THEN 'Isabel'
               WHEN 4 THEN 'Pilar'
               WHEN 5 THEN 'Dolores'
               WHEN 6 THEN 'Teresa'
               WHEN 7 THEN 'Rosa'
               WHEN 8 THEN 'Francisca'
               WHEN 9 THEN 'Antonia'
               WHEN 10 THEN 'José'
               WHEN 11 THEN 'Antonio'
               WHEN 12 THEN 'Manuel'
               WHEN 13 THEN 'Francisco'
               WHEN 14 THEN 'Juan'
               WHEN 15 THEN 'David'
               WHEN 16 THEN 'Carlos'
               WHEN 17 THEN 'Miguel'
               WHEN 18 THEN 'Luis'
               WHEN 19 THEN 'Rafael'
               WHEN 20 THEN 'Alejandro'
               WHEN 21 THEN 'Diego'
               WHEN 22 THEN 'Fernando'
               WHEN 23 THEN 'Sergio'
               WHEN 24 THEN 'Adrián'
               WHEN 25 THEN 'Pablo'
               WHEN 26 THEN 'Jorge'
               WHEN 27 THEN 'Roberto'
               WHEN 28 THEN 'Óscar'
               WHEN 29 THEN 'Rubén'
               WHEN 30 THEN 'Laura'
               WHEN 31 THEN 'Marta'
               WHEN 32 THEN 'Elena'
               WHEN 33 THEN 'Cristina'
               WHEN 34 THEN 'Paula'
               WHEN 35 THEN 'Raquel'
               WHEN 36 THEN 'Natalia'
               WHEN 37 THEN 'Patricia'
               WHEN 38 THEN 'Andrea'
               WHEN 39 THEN 'Lucía'
               WHEN 40 THEN 'Javier'
               WHEN 41 THEN 'Daniel'
               WHEN 42 THEN 'Alberto'
               WHEN 43 THEN 'Jesús'
               WHEN 44 THEN 'Víctor'
               WHEN 45 THEN 'Gonzalo'
               WHEN 46 THEN 'Raúl'
               WHEN 47 THEN 'Iván'
               WHEN 48 THEN 'Álvaro'
               ELSE 'Héctor'
           END as nombre,
           CASE (gs + 17) % 50
               WHEN 0 THEN 'García'
               WHEN 1 THEN 'Rodríguez'
               WHEN 2 THEN 'González'
               WHEN 3 THEN 'Fernández'
               WHEN 4 THEN 'López'
               WHEN 5 THEN 'Martínez'
               WHEN 6 THEN 'Sánchez'
               WHEN 7 THEN 'Pérez'
               WHEN 8 THEN 'Gómez'
               WHEN 9 THEN 'Martín'
               WHEN 10 THEN 'Jiménez'
               WHEN 11 THEN 'Ruiz'
               WHEN 12 THEN 'Hernández'
               WHEN 13 THEN 'Díaz'
               WHEN 14 THEN 'Moreno'
               WHEN 15 THEN 'Muñoz'
               WHEN 16 THEN 'Álvarez'
               WHEN 17 THEN 'Romero'
               WHEN 18 THEN 'Alonso'
               WHEN 19 THEN 'Gutiérrez'
               WHEN 20 THEN 'Navarro'
               WHEN 21 THEN 'Torres'
               WHEN 22 THEN 'Domínguez'
               WHEN 23 THEN 'Vázquez'
               WHEN 24 THEN 'Ramos'
               WHEN 25 THEN 'Gil'
               WHEN 26 THEN 'Ramírez'
               WHEN 27 THEN 'Serrano'
               WHEN 28 THEN 'Blanco'
               WHEN 29 THEN 'Suárez'
               WHEN 30 THEN 'Molina'
               WHEN 31 THEN 'Morales'
               WHEN 32 THEN 'Ortega'
               WHEN 33 THEN 'Delgado'
               WHEN 34 THEN 'Castro'
               WHEN 35 THEN 'Ortiz'
               WHEN 36 THEN 'Rubio'
               WHEN 37 THEN 'Marín'
               WHEN 38 THEN 'Sanz'
               WHEN 39 THEN 'Iglesias'
               WHEN 40 THEN 'Medina'
               WHEN 41 THEN 'Garrido'
               WHEN 42 THEN 'Cortés'
               WHEN 43 THEN 'Castillo'
               WHEN 44 THEN 'Santos'
               WHEN 45 THEN 'Lozano'
               WHEN 46 THEN 'Guerrero'
               WHEN 47 THEN 'Cano'
               WHEN 48 THEN 'Prieto'
               ELSE 'Méndez'
           END as apellido,
           CASE gs % 10
               WHEN 0 THEN 'gmail.com'
               WHEN 1 THEN 'hotmail.com'
               WHEN 2 THEN 'yahoo.es'
               WHEN 3 THEN 'outlook.com'
               WHEN 4 THEN 'restaurante.com'
               WHEN 5 THEN 'gastro.es'
               WHEN 6 THEN 'cocina.com'
               WHEN 7 THEN 'chef.es'
               WHEN 8 THEN 'hosteleria.com'
               ELSE 'foodservice.es'
           END as dominio,
           CASE 
               WHEN gs <= 3 THEN 'Propietario'
               WHEN gs <= 8 THEN 'Administrador General'
               WHEN gs <= 15 THEN 'Gerente de Restaurante'
               WHEN gs <= 22 THEN 'Chef Ejecutivo'
               WHEN gs <= 28 THEN 'Sous Chef'
               WHEN gs <= 35 THEN 'Jefe de Cocina'
               WHEN gs <= 45 THEN 'Cocinero'
               WHEN gs <= 52 THEN 'Ayudante de Cocina'
               WHEN gs <= 60 THEN 'Jefe de Sala'
               WHEN gs <= 70 THEN 'Camarero/Mesero'
               WHEN gs <= 78 THEN 'Cajero'
               WHEN gs <= 85 THEN 'Recepcionista'
               WHEN gs <= 90 THEN 'Bartender'
               WHEN gs <= 95 THEN 'Personal de Limpieza'
               ELSE 'Invitado'
           END as rol,
           CASE 
               WHEN gs <= 3 THEN '4000-8000'
               WHEN gs <= 8 THEN '3000-5000'
               WHEN gs <= 15 THEN '2500-4000'
               WHEN gs <= 22 THEN '2800-4200'
               WHEN gs <= 28 THEN '2200-3200'
               WHEN gs <= 35 THEN '1800-2800'
               WHEN gs <= 45 THEN '1400-2200'
               WHEN gs <= 52 THEN '1100-1600'
               WHEN gs <= 60 THEN '1600-2400'
               WHEN gs <= 70 THEN '1200-1800'
               WHEN gs <= 78 THEN '1300-1900'
               WHEN gs <= 85 THEN '1200-1700'
               WHEN gs <= 90 THEN '1400-2000'
               WHEN gs <= 95 THEN '1100-1400'
               ELSE '0'
           END as salario,
           CASE 
               WHEN gs <= 3 THEN jsonb_build_array('full_access', 'restaurant_management', 'financial_reports', 'staff_management', 'menu_management')
               WHEN gs <= 8 THEN jsonb_build_array('restaurant_management', 'staff_management', 'inventory_management', 'reports', 'menu_editing')
               WHEN gs <= 15 THEN jsonb_build_array('daily_operations', 'staff_scheduling', 'customer_service', 'sales_reports', 'table_management')
               WHEN gs <= 22 THEN jsonb_build_array('kitchen_management', 'menu_creation', 'recipe_management', 'food_cost_control', 'staff_supervision')
               WHEN gs <= 28 THEN jsonb_build_array('kitchen_operations', 'recipe_access', 'inventory_kitchen', 'food_prep_scheduling')
               WHEN gs <= 35 THEN jsonb_build_array('kitchen_supervision', 'food_preparation', 'quality_control', 'inventory_requests')
               WHEN gs <= 45 THEN jsonb_build_array('food_preparation', 'recipe_access', 'kitchen_equipment')
               WHEN gs <= 52 THEN jsonb_build_array('basic_kitchen_tasks', 'cleaning', 'food_prep_assistance')
               WHEN gs <= 60 THEN jsonb_build_array('table_management', 'customer_service', 'staff_coordination', 'reservation_management')
               WHEN gs <= 70 THEN jsonb_build_array('order_taking', 'customer_service', 'table_service', 'pos_system')
               WHEN gs <= 78 THEN jsonb_build_array('pos_system', 'payment_processing', 'daily_closing', 'customer_service')
               WHEN gs <= 85 THEN jsonb_build_array('reservation_management', 'customer_reception', 'phone_service')
               WHEN gs <= 90 THEN jsonb_build_array('bar_service', 'beverage_preparation', 'inventory_bar')
               WHEN gs <= 95 THEN jsonb_build_array('cleaning', 'maintenance_basic')
               ELSE jsonb_build_array('menu_viewing')
           END as permisos,
           CASE gs % 8
               WHEN 0 THEN 'Cocina'
               WHEN 1 THEN 'Sala'
               WHEN 2 THEN 'Bar'
               WHEN 3 THEN 'Administración'
               WHEN 4 THEN 'Caja'
               WHEN 5 THEN 'Almacén'
               WHEN 6 THEN 'Limpieza'
               ELSE 'Recepción'
           END as departamento,
           CASE gs % 6
               WHEN 0 THEN 'Turno Mañana'
               WHEN 1 THEN 'Turno Tarde'
               WHEN 2 THEN 'Turno Noche'
               WHEN 3 THEN 'Fin de Semana'
               WHEN 4 THEN 'Tiempo Completo'
               ELSE 'Medio Tiempo'
           END as horario,
           CASE (gs + 7) % 12
               WHEN 0 THEN 'Restaurante Central Madrid'
               WHEN 1 THEN 'Sucursal Barcelona'
               WHEN 2 THEN 'Local Valencia'
               WHEN 3 THEN 'Restaurante Sevilla'
               WHEN 4 THEN 'Franquicia Bilbao'
               WHEN 5 THEN 'Local Málaga'
               WHEN 6 THEN 'Restaurante Zaragoza'
               WHEN 7 THEN 'Sucursal Murcia'
               WHEN 8 THEN 'Local Palma'
               WHEN 9 THEN 'Restaurante Las Palmas'
               WHEN 10 THEN 'Sucursal Córdoba'
               ELSE 'Local Valladolid'
           END as ubicacion
    FROM generate_series(1, 100) gs
)
SELECT 
    lower(nombre) || '.' || lower(apellido) || gs || '@' || dominio as email,
    '$2b$12$' || encode(digest(random()::text || gs::text, 'sha256'), 'hex') as password_hash,
    rol as role,
    jsonb_build_object(
        'first_name', nombre,
        'last_name', apellido,
        'age', (18 + (gs % 45)),
        'phone', '+34' || (600000000 + gs * 100 + (random() * 99)::int),
        'department', departamento,
        'salary_range', salario,
        'permissions', permisos,
        'employee_id', 'REST' || lpad(gs::text, 4, '0'),
        'restaurant_location', ubicacion,
        'work_schedule', horario,
        'experience_years', CASE 
            WHEN gs <= 8 THEN (10 + (gs % 15))
            WHEN gs <= 22 THEN (8 + (gs % 12))
            WHEN gs <= 35 THEN (5 + (gs % 8))
            WHEN gs <= 60 THEN (2 + (gs % 6))
            ELSE (gs % 3)
        END,
        'certifications', CASE departamento
            WHEN 'Cocina' THEN jsonb_build_array('Manipulación de Alimentos', 'HACCP')
            WHEN 'Bar' THEN jsonb_build_array('Servicio Responsable de Alcohol', 'Coctelería Básica')
            WHEN 'Administración' THEN jsonb_build_array('Gestión Hotelera', 'Contabilidad Básica')
            ELSE jsonb_build_array('Atención al Cliente')
        END,
        'emergency_contact', '+34' || (650000000 + gs * 73 + (random() * 99)::int),
        'active', CASE WHEN gs % 20 = 0 THEN false ELSE true END,
        'hire_date', (NOW() - INTERVAL '1 day' * (gs * 15 + (random() * 180)::int))::date::text,
        'last_login', CASE 
            WHEN gs % 20 = 0 THEN null
            ELSE (NOW() - INTERVAL '1 hour' * (gs % 72 + (random() * 12)::int))::text
        END
    ) as profile,
    NOW() - INTERVAL '1 day' * (gs * 2 + (random() * 14)::int) as created_at,
    NOW() - INTERVAL '1 hour' * (gs % 24 + (random() * 6)::int) as updated_at
FROM restaurant_users;