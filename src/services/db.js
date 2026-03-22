import Dexie from 'dexie';

export const db = new Dexie('PromocionesRelationalDB');

// Declaramos las 15 tablas explícitamente y sus índices (primary keys primero con ++)
db.version(2).stores({
  tipoIdentificacion: '++id_tipo_identificacion, nombre',
  tipoPersona: '++id_tipo_persona, nombre',
  departamento: '++id_departamento, nombre',
  ciudad: '++id_ciudad, nombre, id_departamento',
  planComercial: '++id_plan_comercial, nombre',
  actividadEconomica: '++id_actividad_economica, nombre',
  calificacionFinanciera: '++id_calificacion_financiera, nombre',
  cliente: '++id_cliente, identificacion, nombre, id_tipo_persona, id_ciudad, id_plan_comercial, id_actividad_economica, id_calificacion_financiera, id_tipo_identificacion',
  promocion: '++id_promocion, nombre',
  promocionAdmiteCiudad: '[id_ciudad+id_promocion], id_ciudad, id_promocion',
  promocionAdmitePlanComercial: '[id_plan_comercial+id_promocion], id_plan_comercial, id_promocion',
  promocionAdmiteActividadEconomica: '[id_actividad_economica+id_promocion], limite_anual, id_actividad_economica, id_promocion',
  promocionAdmiteCalificacionFinanciera: '[id_calificacion_financiera+id_promocion], id_calificacion_financiera, id_promocion',
  vigenciaPromocion: '++id_vigencia_promocion, id_promocion',
  clienteAplicaPromocion: '[id_cliente+id_vigencia_promocion], id_cliente, id_vigencia_promocion'
});

// Evento que se dispara SOLO la primera vez que se crea la base de datos en el navegador
db.on('populate', async () => {
  // --- CATALOGOS BASICOS ---
  await db.tipoIdentificacion.bulkAdd([
    { nombre: 'Cédula de Ciudadanía' },
    { nombre: 'NIT' },
    { nombre: 'Pasaporte' }
  ]);
  
  await db.tipoPersona.bulkAdd([
    { nombre: 'Natural' },
    { nombre: 'Jurídica' }
  ]);

  await db.departamento.bulkAdd([
    { nombre: 'Valle del Cauca' },
    { nombre: 'Antioquia' },
    { nombre: 'Nariño' },
    { nombre: 'Cauca' },
    { nombre: 'Quindío' }
  ]);
  
  await db.ciudad.bulkAdd([
    { nombre: 'Cali', id_departamento: 1 },
    { nombre: 'Jamundí', id_departamento: 1 },
    { nombre: 'Yumbo', id_departamento: 1 },
    { nombre: 'Palmira', id_departamento: 1 },
    { nombre: 'Medellín', id_departamento: 2 },
    { nombre: 'Pasto', id_departamento: 3 },
    { nombre: 'Popayán', id_departamento: 4 },
    { nombre: 'Armenia', id_departamento: 5 },
    { nombre: 'Ipiales', id_departamento: 3 }
  ]);

  await db.planComercial.bulkAdd([
    { nombre: 'Básico', descripcion: 'Plan inicial' },
    { nombre: 'Estándar', descripcion: 'Plan intermedio' },
    { nombre: 'Plata', descripcion: 'Plan avanzado' },
    { nombre: 'Platino', descripcion: 'Plan premium' },
    { nombre: 'Premium', descripcion: 'Plan ultra' },
  ]);
  
  await db.actividadEconomica.bulkAdd([
    { nombre: 'Residencial', descripcion: 'Uso doméstico enfocado en entretenimiento' },
    { nombre: 'Restaurante', descripcion: 'Requieren conectividad estable para facturación (POS)' },
    { nombre: 'Bar', descripcion: 'Consumo alto por streaming' },
    { nombre: 'Hospital / Salud', descripcion: 'Actividad de misión crítica' },
    { nombre: 'Universidad / Educación', descripcion: 'Densidad alta de usuarios' }
  ]);

  await db.calificacionFinanciera.bulkAdd([
    { nombre: 'Excelente', descripcion: 'Pagos realizados siempre a tiempo' },
    { nombre: 'Bueno', descripcion: 'Pagos puntuales, demoras leves' },
    { nombre: 'Regular', descripcion: 'Demoras tolerables' },
    { nombre: 'Malo', descripcion: 'Demora superior a 30 días' },
    { nombre: 'Pésimo', descripcion: 'Deuda superior a 60 días' }
  ]);

  // --- ENTIDADES PRINCIPALES Y RELACIONES ---
  await db.promocion.bulkAdd([
    { nombre: 'Exclusividad Iquitos Premium', descripcion: 'Beneficio total para clientes...', porcentaje_descuento: 50, facturacion_min: 150000, facturacion_max: null },
    { nombre: 'Impulso Gastronómico Cali', descripcion: 'Apoyo a la reactivación de...', porcentaje_descuento: 10, facturacion_min: 90000, facturacion_max: 1000000 },
    { nombre: 'Conectividad Salud Crítica', descripcion: 'Tarifa especial para centros...', porcentaje_descuento: 30, facturacion_min: 200000, facturacion_max: 3000000 },
    { nombre: 'Descuento 10% Cargo Básico', descripcion: 'Promoción especial de la regla de negocio para Bares y Restaurantes.', porcentaje_descuento: 10, facturacion_min: 80000, facturacion_max: null }
  ]);

  await db.vigenciaPromocion.bulkAdd([
    { id_promocion: 1, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31' },
    { id_promocion: 2, fecha_inicio: '2026-02-01', fecha_fin: '2026-02-28' },
    { id_promocion: 3, fecha_inicio: '2025-11-15', fecha_fin: '2026-05-15' },
    { id_promocion: 4, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31' }
  ]);

  await db.cliente.bulkAdd([
    { identificacion: '16780443', nombre: 'David Jiménez Garzón', celular: '3000000000', direccion: 'Calle 1', promedio_facturacion: 155000, saldo_vencido: 0, id_tipo_persona: 1, id_ciudad: 1, id_plan_comercial: 5, id_actividad_economica: 1, id_calificacion_financiera: 1, id_tipo_identificacion: 1 },
    { identificacion: '31225890', nombre: 'Clínica Bejarano', celular: '3100000000', direccion: 'Calle 2', promedio_facturacion: 88500, saldo_vencido: 0, id_tipo_persona: 2, id_ciudad: 8, id_plan_comercial: 3, id_actividad_economica: 4, id_calificacion_financiera: 2, id_tipo_identificacion: 2 },
    { identificacion: '1061841698', nombre: 'La Cosecha', celular: '3200000000', direccion: 'Calle 3', promedio_facturacion: 85000, saldo_vencido: 0, id_tipo_persona: 2, id_ciudad: 1, id_plan_comercial: 1, id_actividad_economica: 2, id_calificacion_financiera: 1, id_tipo_identificacion: 2 },
    { identificacion: '94332110', nombre: 'Juan Diego Posada', celular: '3150000000', direccion: 'Carrera 4', promedio_facturacion: 125000, saldo_vencido: 0, id_tipo_persona: 1, id_ciudad: 5, id_plan_comercial: 4, id_actividad_economica: 1, id_calificacion_financiera: 2, id_tipo_identificacion: 1 },
    { identificacion: '16998001', nombre: 'El Contentoso', celular: '3120000000', direccion: 'Avenida 5', promedio_facturacion: 98000, saldo_vencido: 0, id_tipo_persona: 2, id_ciudad: 4, id_plan_comercial: 3, id_actividad_economica: 3, id_calificacion_financiera: 2, id_tipo_identificacion: 2 },
    { identificacion: '1152334009', nombre: 'Jorge Iván Martínez', celular: '3110000001', direccion: 'MZ 3 Casa 4', promedio_facturacion: 65000, saldo_vencido: 12500, id_tipo_persona: 1, id_ciudad: 8, id_plan_comercial: 2, id_actividad_economica: 1, id_calificacion_financiera: 2, id_tipo_identificacion: 1 },
    { identificacion: '66887223', nombre: 'Sofía Villamizar', celular: '3110000002', direccion: 'CR 10 N 15', promedio_facturacion: 215000, saldo_vencido: 0, id_tipo_persona: 1, id_ciudad: 1, id_plan_comercial: 5, id_actividad_economica: 1, id_calificacion_financiera: 3, id_tipo_identificacion: 1 },
    { identificacion: '29445112', nombre: 'Andrés Felipe Pava', celular: '3110000003', direccion: 'CL 40 22', promedio_facturacion: 72000, saldo_vencido: 0, id_tipo_persona: 1, id_ciudad: 4, id_plan_comercial: 2, id_actividad_economica: 1, id_calificacion_financiera: 1, id_tipo_identificacion: 1 },
    { identificacion: '1005667889', nombre: 'El Quijote', celular: '3110000004', direccion: 'Parque Principal', promedio_facturacion: 38000, saldo_vencido: 145200, id_tipo_persona: 2, id_ciudad: 5, id_plan_comercial: 1, id_actividad_economica: 2, id_calificacion_financiera: 5, id_tipo_identificacion: 2 },
  ]);


  // Poblado de parámetros intermedios para Promociones
  await db.promocionAdmiteActividadEconomica.bulkAdd([
    { id_actividad_economica: 3, id_promocion: 1, limite_anual: null },
    { id_actividad_economica: 2, id_promocion: 1, limite_anual: null },
    { id_actividad_economica: 2, id_promocion: 2, limite_anual: null },
    { id_actividad_economica: 3, id_promocion: 2, limite_anual: null },
    { id_actividad_economica: 4, id_promocion: 3, limite_anual: null },
    { id_actividad_economica: 2, id_promocion: 4, limite_anual: 2 }, // Restaurante, límite 2 por año
    { id_actividad_economica: 3, id_promocion: 4, limite_anual: 3 }  // Bar, límite 3 por año
  ]);

  await db.promocionAdmiteCiudad.bulkAdd([
    { id_ciudad: 1, id_promocion: 4 }, // Cali
    { id_ciudad: 4, id_promocion: 4 }  // Palmira
  ]);

  await db.promocionAdmiteCalificacionFinanciera.bulkAdd([
    { id_calificacion_financiera: 1, id_promocion: 4 }, // Excelente
    { id_calificacion_financiera: 2, id_promocion: 4 }  // Bueno
  ]);
});

export async function resetDatabase() {
  await db.delete();
  await db.open(); // Reconfigura y dispara 'populate'
}
