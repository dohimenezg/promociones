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
  promocionAdmiteActividadEconomica: '[id_actividad_economica+id_promocion], id_actividad_economica, id_promocion',
  promocionAdmiteCalificacionFinanciera: '[id_calificacion_financiera+id_promocion], id_calificacion_financiera, id_promocion',
  vigenciaPromocion: '++id_vigencia_promocion, id_promocion',
  clienteAplicaPromocion: '[id_cliente+id_vigencia_promocion], id_cliente, id_vigencia_promocion'
});

// Evento que se dispara SOLO la primera vez que se crea la base de datos en el navegador
db.on('populate', async () => {
  try {
    // --- CATALOGOS BASICOS ---
  await db.tipoIdentificacion.bulkAdd([
    { nombre: 'Cédula de Ciudadanía' },
    { nombre: 'NIT' },
    { nombre: 'Pasaporte' },
    { nombre: 'Tarjeta de Identidad' },
    { nombre: 'Cédula de Extranjería' },
    { nombre: 'Registro Civil' },
    { nombre: 'RUT' },
    { nombre: 'Permiso Especial Permanente' },
    { nombre: 'Documento Extranjero' },
    { nombre: 'Carnet Diplomático' }
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
    { nombre: 'Quindío' },
    { nombre: 'Cundinamarca' },
    { nombre: 'Atlántico' },
    { nombre: 'Bolívar' },
    { nombre: 'Santander' },
    { nombre: 'Risaralda' }
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
    { nombre: 'Ipiales', id_departamento: 3 },
    { nombre: 'Bogotá', id_departamento: 6 },
    { nombre: 'Barranquilla', id_departamento: 7 },
    { nombre: 'Cartagena', id_departamento: 8 },
    { nombre: 'Bucaramanga', id_departamento: 9 },
    { nombre: 'Pereira', id_departamento: 10 }
  ]);

  await db.planComercial.bulkAdd([
    { nombre: 'Básico', descripcion: 'Plan inicial' },
    { nombre: 'Estándar', descripcion: 'Plan intermedio' },
    { nombre: 'Plata', descripcion: 'Plan avanzado' },
    { nombre: 'Platino', descripcion: 'Plan premium' },
    { nombre: 'Premium', descripcion: 'Plan ultra' },
    { nombre: 'Corporativo Pyme', descripcion: 'Para empresas pequeñas' },
    { nombre: 'Corporativo Plus', descripcion: 'Para medianas empresas' },
    { nombre: 'Empresarial Global', descripcion: 'Para grandes compañías' },
    { nombre: 'Vip Diamante', descripcion: 'Máxima exclusividad' },
    { nombre: 'Fibra Óptica Max', descripcion: 'Plan especial velocidad' }
  ]);
  
  await db.actividadEconomica.bulkAdd([
    { nombre: 'Residencial', descripcion: 'Uso doméstico enfocado en entretenimiento' },
    { nombre: 'Restaurante', descripcion: 'Requieren conectividad estable para facturación (POS)' },
    { nombre: 'Bares', descripcion: 'Consumo alto por streaming' },
    { nombre: 'Hospital / Salud', descripcion: 'Actividad de misión crítica' },
    { nombre: 'Universidad / Educación', descripcion: 'Densidad alta de usuarios' },
    { nombre: 'Hotelería', descripcion: 'Flujo constante de red y TVs' },
    { nombre: 'Centro Comercial', descripcion: 'Cobertura masiva de áreas' },
    { nombre: 'Banca y Finanzas', descripcion: 'Máxima prioridad de seguridad de datos' },
    { nombre: 'Gobierno', descripcion: 'Servicios para alcaldías o gobernaciones' },
    { nombre: 'Call Center', descripcion: 'Altísimo consumo de banda ancha simétrica' }
  ]);

  await db.calificacionFinanciera.bulkAdd([
    { nombre: 'Excelente', descripcion: 'Pagos realizados siempre a tiempo' },
    { nombre: 'Bueno', descripcion: 'Pagos puntuales, demoras leves' },
    { nombre: 'Regular', descripcion: 'Demoras tolerables' },
    { nombre: 'Malo', descripcion: 'Demora superior a 30 días' },
    { nombre: 'Pésimo', descripcion: 'Deuda superior a 60 días' },
    { nombre: 'AAA+', descripcion: 'Cliente VIP intachable histórico' },
    { nombre: 'Riesgo Moderado', descripcion: 'Demoras esporádicas de una semana' },
    { nombre: 'Riesgo Alto', descripcion: 'Ha tenido suspensiones de servicio' },
    { nombre: 'Cartera Castigada', descripcion: 'Deuda irrecuperable' },
    { nombre: 'En Cobro Jurídico', descripcion: 'Proceso judicial activo' }
  ]);

  // --- ENTIDADES PRINCIPALES Y RELACIONES ---
  await db.promocion.bulkAdd([
    { nombre: 'Exclusividad Iquitos Premium', descripcion: 'Beneficio total para clientes...', porcentaje_descuento: 50, facturacion_min: 150000, facturacion_max: null },
    { nombre: 'Impulso Gastronómico Cali', descripcion: 'Apoyo a la reactivación de...', porcentaje_descuento: 10, facturacion_min: 90000, facturacion_max: 1000000 },
    { nombre: 'Conectividad Salud Crítica', descripcion: 'Tarifa especial para centros...', porcentaje_descuento: 30, facturacion_min: 200000, facturacion_max: 3000000 },
    { nombre: 'Descuento 10% Cargo Básico', descripcion: 'Promoción especial de la regla de negocio para Bares y Restaurantes.', porcentaje_descuento: 10, facturacion_min: 80000, facturacion_max: null },
    { nombre: 'Cali 20% Rebaja', descripcion: 'Descuento para todos en Cali.', porcentaje_descuento: 20, facturacion_min: 0, facturacion_max: null },
    { nombre: 'Fidelización Universidades', descripcion: 'Aplica a sede Valle', porcentaje_descuento: 40, facturacion_min: 500000, facturacion_max: null },
    { nombre: 'VIP Hospitalario', descripcion: 'Solo hospitales excelentes', porcentaje_descuento: 60, facturacion_min: 100000, facturacion_max: null },
    { nombre: 'Reactivación Jamundí', descripcion: 'Descuento alto para Jamundí', porcentaje_descuento: 30, facturacion_min: 0, facturacion_max: null },
    { nombre: 'Empate Antiguedad', descripcion: 'Empata con Cali 20%, pero es mas vieja', porcentaje_descuento: 20, facturacion_min: 0, facturacion_max: null },
    { nombre: 'Retención Preferencial', descripcion: 'Evita cancelaciones por competencia', porcentaje_descuento: 35, facturacion_min: 50000, facturacion_max: null }
  ]);

  await db.vigenciaPromocion.bulkAdd([
    { id_promocion: 1, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31' },
    { id_promocion: 2, fecha_inicio: '2026-02-01', fecha_fin: '2026-02-28' },
    { id_promocion: 3, fecha_inicio: '2025-11-15', fecha_fin: '2026-05-15' },
    { id_promocion: 4, fecha_inicio: '2026-01-01', fecha_fin: '2026-01-31' }, // ID 4  - Histórica Expira 
    { id_promocion: 5, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31' },
    { id_promocion: 6, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31' },
    { id_promocion: 7, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31' },
    { id_promocion: 8, fecha_inicio: '2026-03-01', fecha_fin: '2026-06-30' },
    { id_promocion: 9, fecha_inicio: '2025-01-01', fecha_fin: '2026-12-31' },
    { id_promocion: 4, fecha_inicio: '2025-11-01', fecha_fin: '2025-11-30' }, // ID 10 - Separado por meses hacia el pasado (Noviembre 2025)
    // ELIMINADA: { id_promocion: 4, fecha_inicio: '2026-03-01', fecha_fin: '2026-03-31' } para evitar la Vigencia Activa de esta Promo confusa
    { id_promocion: 1, fecha_inicio: '2027-01-01', fecha_fin: '2027-12-31' },
    { id_promocion: 2, fecha_inicio: '2027-05-01', fecha_fin: '2027-10-31' },
    { id_promocion: 5, fecha_inicio: '2028-01-01', fecha_fin: '2028-06-30' },
    { id_promocion: 10, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31' }
  ]);

  await db.cliente.bulkAdd([
    { identificacion: '16780443', nombre: 'David Jiménez Garzón', celular: '3000000000', direccion: 'Calle 1', promedio_facturacion: 155000, saldo_vencido: 35000, id_tipo_persona: 1, id_ciudad: 1, id_plan_comercial: 5, id_actividad_economica: 1, id_calificacion_financiera: 1, id_tipo_identificacion: 1 },
    { identificacion: '31225890', nombre: 'Clínica Bejarano', celular: '3100000000', direccion: 'Calle 2', promedio_facturacion: 88500, saldo_vencido: 8000, id_tipo_persona: 2, id_ciudad: 8, id_plan_comercial: 3, id_actividad_economica: 4, id_calificacion_financiera: 2, id_tipo_identificacion: 2 },
    { identificacion: '1061841698', nombre: 'La Cosecha', celular: '3200000000', direccion: 'Calle 3', promedio_facturacion: 85000, saldo_vencido: 0, id_tipo_persona: 2, id_ciudad: 1, id_plan_comercial: 1, id_actividad_economica: 2, id_calificacion_financiera: 1, id_tipo_identificacion: 2 },
    { identificacion: '94332110', nombre: 'Juan Diego Posada', celular: '3150000000', direccion: 'Carrera 4', promedio_facturacion: 125000, saldo_vencido: 0, id_tipo_persona: 1, id_ciudad: 5, id_plan_comercial: 4, id_actividad_economica: 1, id_calificacion_financiera: 2, id_tipo_identificacion: 1 },
    { identificacion: '16998001', nombre: 'El Contentoso', celular: '3120000000', direccion: 'Avenida 5', promedio_facturacion: 98000, saldo_vencido: 0, id_tipo_persona: 2, id_ciudad: 4, id_plan_comercial: 3, id_actividad_economica: 3, id_calificacion_financiera: 2, id_tipo_identificacion: 2 },
    { identificacion: '1152334009', nombre: 'Jorge Iván Martínez', celular: '3110000001', direccion: 'MZ 3 Casa 4', promedio_facturacion: 65000, saldo_vencido: 12500, id_tipo_persona: 1, id_ciudad: 8, id_plan_comercial: 2, id_actividad_economica: 1, id_calificacion_financiera: 2, id_tipo_identificacion: 1 },
    { identificacion: '66887223', nombre: 'Sofía Villamizar', celular: '3110000002', direccion: 'CR 10 N 15', promedio_facturacion: 215000, saldo_vencido: 0, id_tipo_persona: 1, id_ciudad: 1, id_plan_comercial: 5, id_actividad_economica: 1, id_calificacion_financiera: 3, id_tipo_identificacion: 1 },
    { identificacion: '29445112', nombre: 'Andrés Felipe Pava', celular: '3110000003', direccion: 'CL 40 22', promedio_facturacion: 72000, saldo_vencido: 0, id_tipo_persona: 1, id_ciudad: 4, id_plan_comercial: 2, id_actividad_economica: 1, id_calificacion_financiera: 1, id_tipo_identificacion: 1 },
    { identificacion: '1005667889', nombre: 'El Quijote', celular: '3110000004', direccion: 'Parque Principal', promedio_facturacion: 38000, saldo_vencido: 145200, id_tipo_persona: 2, id_ciudad: 5, id_plan_comercial: 1, id_actividad_economica: 2, id_calificacion_financiera: 5, id_tipo_identificacion: 2 },
    { identificacion: '12345678', nombre: 'Muebles el Nogal', celular: '3140000000', direccion: 'Avenida 6', promedio_facturacion: 180000, saldo_vencido: 0, id_tipo_persona: 2, id_ciudad: 1, id_plan_comercial: 4, id_actividad_economica: 1, id_calificacion_financiera: 1, id_tipo_identificacion: 2 },
    { identificacion: '87654321', nombre: 'Libreria Nacional', celular: '3151112233', direccion: 'Calle 8', promedio_facturacion: 55000, saldo_vencido: 0, id_tipo_persona: 2, id_ciudad: 5, id_plan_comercial: 2, id_actividad_economica: 1, id_calificacion_financiera: 2, id_tipo_identificacion: 2 },
    { identificacion: '11223344', nombre: 'Carlos Ruiz', celular: '3109998877', direccion: 'Cra 12 #4', promedio_facturacion: 30000, saldo_vencido: 50000, id_tipo_persona: 1, id_ciudad: 1, id_plan_comercial: 1, id_actividad_economica: 1, id_calificacion_financiera: 4, id_tipo_identificacion: 1 },
    { identificacion: '55667788', nombre: 'Hospital San Juan', celular: '3205556677', direccion: 'Calle 100', promedio_facturacion: 500000, saldo_vencido: 0, id_tipo_persona: 2, id_ciudad: 1, id_plan_comercial: 5, id_actividad_economica: 4, id_calificacion_financiera: 1, id_tipo_identificacion: 2 },
    { identificacion: '99887766', nombre: 'Universidad del Valle', celular: '3101234567', direccion: 'Sede Melendez', promedio_facturacion: 1200000, saldo_vencido: 0, id_tipo_persona: 2, id_ciudad: 1, id_plan_comercial: 5, id_actividad_economica: 5, id_calificacion_financiera: 1, id_tipo_identificacion: 2 },
    { identificacion: '10101010', nombre: 'Bar La Esquina', celular: '3009876543', direccion: 'Zona Rosa', promedio_facturacion: 95000, saldo_vencido: 45000, id_tipo_persona: 2, id_ciudad: 4, id_plan_comercial: 3, id_actividad_economica: 3, id_calificacion_financiera: 2, id_tipo_identificacion: 2 },
    { identificacion: '20202020', nombre: 'Marcia Velez', celular: '3112223344', direccion: 'Barrio Obrero', promedio_facturacion: 45000, saldo_vencido: 0, id_tipo_persona: 1, id_ciudad: 4, id_plan_comercial: 1, id_actividad_economica: 1, id_calificacion_financiera: 3, id_tipo_identificacion: 1 },
    { identificacion: '30303030', nombre: 'Restaurante El Sabor', celular: '3156667788', direccion: 'Centro', promedio_facturacion: 110000, saldo_vencido: 120000, id_tipo_persona: 2, id_ciudad: 1, id_plan_comercial: 4, id_actividad_economica: 2, id_calificacion_financiera: 1, id_tipo_identificacion: 2 },
    { identificacion: '40404040', nombre: 'Fernando Gomez', celular: '3201112233', direccion: 'Cra 5', promedio_facturacion: 75000, saldo_vencido: 0, id_tipo_persona: 1, id_ciudad: 5, id_plan_comercial: 2, id_actividad_economica: 1, id_calificacion_financiera: 2, id_tipo_identificacion: 1 },
    { identificacion: '50505050', nombre: 'Diana Rojas', celular: '3104445566', direccion: 'Calle 10', promedio_facturacion: 150000, saldo_vencido: 0, id_tipo_persona: 1, id_ciudad: 8, id_plan_comercial: 5, id_actividad_economica: 1, id_calificacion_financiera: 1, id_tipo_identificacion: 1 }
  ]);


  // Poblado de parámetros intermedios para Promociones
  await db.promocionAdmiteActividadEconomica.bulkAdd([
    { id_actividad_economica: 3, id_promocion: 1, limite_anual: 4 }, // Bar: límite 4
    { id_actividad_economica: 2, id_promocion: 1, limite_anual: 1 }, // Restaurante: limite 1
    { id_actividad_economica: 2, id_promocion: 2, limite_anual: 1 }, // Restaurante: límite 1
    { id_actividad_economica: 3, id_promocion: 2, limite_anual: 6 }, // Bar: límite 6
    { id_actividad_economica: 4, id_promocion: 3, limite_anual: 2 }, // Eventos: límite 2
    { id_actividad_economica: 2, id_promocion: 4, limite_anual: 2 }, // Restaurante: límite 2 por año
    { id_actividad_economica: 3, id_promocion: 4, limite_anual: 3 }, // Bar: límite 3 por año
    { id_actividad_economica: 5, id_promocion: 6, limite_anual: 5 }, // Salud: límite 5
    { id_actividad_economica: 4, id_promocion: 7, limite_anual: 5 } // Eventos: límite 5
  ]);

  await db.promocionAdmiteCiudad.bulkAdd([
    { id_ciudad: 1, id_promocion: 4 }, // Cali
    { id_ciudad: 4, id_promocion: 4 }, // Palmira
    { id_ciudad: 1, id_promocion: 5 },
    { id_ciudad: 2, id_promocion: 8 },
    { id_ciudad: 1, id_promocion: 9 }
  ]);

  await db.promocionAdmiteCalificacionFinanciera.bulkAdd([
    { id_calificacion_financiera: 1, id_promocion: 4 }, // Excelente
    { id_calificacion_financiera: 2, id_promocion: 4 }, // Bueno
    { id_calificacion_financiera: 1, id_promocion: 7 }
  ]);

  // Llenado automático para convertir "Aplica para todos" (vacío) en inserciones explícitas (Consistencia Semilla)
  const allPromos = await db.promocion.toArray();
  const allPlanes = await db.planComercial.toArray();
  const allCiudades = await db.ciudad.toArray();
  const allCalifs = await db.calificacionFinanciera.toArray();
  const allActs = await db.actividadEconomica.toArray();
  
  for (const p of allPromos) {
    const pId = p.id_promocion;
    const countPlanes = await db.promocionAdmitePlanComercial.where({ id_promocion: pId }).count();
    if (countPlanes === 0) await db.promocionAdmitePlanComercial.bulkAdd(allPlanes.map(x => ({ id_plan_comercial: x.id_plan_comercial, id_promocion: pId })));
    
    const countCiudades = await db.promocionAdmiteCiudad.where({ id_promocion: pId }).count();
    if (countCiudades === 0) await db.promocionAdmiteCiudad.bulkAdd(allCiudades.map(x => ({ id_ciudad: x.id_ciudad, id_promocion: pId })));
    
    const countCalifs = await db.promocionAdmiteCalificacionFinanciera.where({ id_promocion: pId }).count();
    if (countCalifs === 0) await db.promocionAdmiteCalificacionFinanciera.bulkAdd(allCalifs.map(x => ({ id_calificacion_financiera: x.id_calificacion_financiera, id_promocion: pId })));
    
    const countActs = await db.promocionAdmiteActividadEconomica.where({ id_promocion: pId }).count();
    if (countActs === 0) await db.promocionAdmiteActividadEconomica.bulkAdd(allActs.map(x => ({ 
      id_actividad_economica: x.id_actividad_economica, 
      id_promocion: pId, 
      limite_anual: (x.id_actividad_economica === 2 || x.id_actividad_economica === 3) ? 2 : ((pId % 2 === 0) ? 3 : null) 
    })));
  }

  // HISTORICAL ASSIGNMENTS TO PROVE CAPS AND IMMUTABILITY
  await db.clienteAplicaPromocion.bulkAdd([
     { id_cliente: 15, id_vigencia_promocion: 4, fecha_asignacion: '2026-01-15' }, // Bar La Esquina
     { id_cliente: 15, id_vigencia_promocion: 10, fecha_asignacion: '2025-11-15' },
     { id_cliente: 17, id_vigencia_promocion: 4, fecha_asignacion: '2026-01-15' }, // Restaurante El Sabor
     { id_cliente: 17, id_vigencia_promocion: 10, fecha_asignacion: '2025-11-15' },
     // MAS REGISTROS SOLICITADOS (minimo 10 en cada tabla)
     { id_cliente: 1, id_vigencia_promocion: 1, fecha_asignacion: '2026-01-15' },
     { id_cliente: 2, id_vigencia_promocion: 5, fecha_asignacion: '2026-02-10' },
     { id_cliente: 9, id_vigencia_promocion: 5, fecha_asignacion: '2026-02-10' },
     { id_cliente: 3, id_vigencia_promocion: 6, fecha_asignacion: '2026-01-20' },
     { id_cliente: 7, id_vigencia_promocion: 9, fecha_asignacion: '2025-05-15' },
     { id_cliente: 8, id_vigencia_promocion: 1, fecha_asignacion: '2026-01-15' },
     { id_cliente: 6, id_vigencia_promocion: 2, fecha_asignacion: '2026-02-12' },
     { id_cliente: 13, id_vigencia_promocion: 7, fecha_asignacion: '2026-01-18' }
  ]);
  } catch (err) {
    console.error('Error poblando base de datos Dexie:', err);
  }
});

export async function resetDatabase() {
  await db.delete();
  await db.open(); // Reconfigura y dispara 'populate'
}
