INSERT INTO public.tenants (
    id,
    nombre,
    slug,
    logo_id,
    tipo,
    tags,
    rfc,
    email,
    telefono,
    celular,
    direccion,
    tipo_plan,
    limite_usuarios,
    limite_sucursales,
    fecha_inicio,
    fecha_expiracion,
    activo,
    config_version,
    config,
    notas_admin,
    creaado_por
)
VALUES (uuid_generate_v4, 'Raapidin', 'comida-china-raapidin', NULL, 'dark_kitchen', ARRAY['chino', 'delivery','informal','comida_rápida'], 'GASD040825MM4', 'rapidin.gdl@gmail.com', '3336020586', '3311096184', 'Rafael Ramirez #108, Basilio Vadillo, Tonala, Jalisco, Mexico','enterprise','3','1','2025-06-23','2026-06-23', true, 1, '{}', 'Usuario Padre', 'Rxcode');