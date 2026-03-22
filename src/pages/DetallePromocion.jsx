import { ChevronLeft, Edit2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function DetallePromocion() {
  const navigate = useNavigate();
  const location = useLocation();
  const id_promocion = location.state?.id_promocion;

  const promo = useLiveQuery(() => id_promocion ? db.promocion.get(id_promocion) : null, [id_promocion]);
  
  const relPlanes = useLiveQuery(() => id_promocion ? db.promocionAdmitePlanComercial.where('id_promocion').equals(id_promocion).toArray() : [], [id_promocion]) || [];
  const relCiudades = useLiveQuery(() => id_promocion ? db.promocionAdmiteCiudad.where('id_promocion').equals(id_promocion).toArray() : [], [id_promocion]) || [];
  const relActs = useLiveQuery(() => id_promocion ? db.promocionAdmiteActividadEconomica.where('id_promocion').equals(id_promocion).toArray() : [], [id_promocion]) || [];
  const relCalifs = useLiveQuery(() => id_promocion ? db.promocionAdmiteCalificacionFinanciera.where('id_promocion').equals(id_promocion).toArray() : [], [id_promocion]) || [];

  const planesDB = useLiveQuery(() => db.planComercial.toArray()) || [];
  const ciudadesDB = useLiveQuery(() => db.ciudad.toArray()) || [];
  const deptosDB = useLiveQuery(() => db.departamento.toArray()) || [];
  const actsDB = useLiveQuery(() => db.actividadEconomica.toArray()) || [];
  const califsDB = useLiveQuery(() => db.calificacionFinanciera.toArray()) || [];

  if (!id_promocion || promo === undefined) return <div style={{ padding: '2rem' }}>Cargando promoción...</div>;
  if (promo === null) return <div style={{ padding: '2rem' }}>Promoción no encontrada.</div>;

  const namesPlanes = relPlanes.map(rp => planesDB.find(p => p.id_plan_comercial === rp.id_plan_comercial)?.nombre).filter(Boolean);
  const namesCiudades = relCiudades.map(rc => {
    const c = ciudadesDB.find(c => c.id_ciudad === rc.id_ciudad);
    const d = c ? deptosDB.find(d => d.id_departamento === c.id_departamento) : null;
    return c ? `${c.nombre}${d ? `, ${d.nombre}` : ''}` : null;
  }).filter(Boolean);
  const namesActs = relActs.map(ra => actsDB.find(a => a.id_actividad_economica === ra.id_actividad_economica)?.nombre).filter(Boolean);
  const namesCalifs = relCalifs.map(rc => califsDB.find(c => c.id_calificacion_financiera === rc.id_calificacion_financiera)?.nombre).filter(Boolean);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <button 
        onClick={() => navigate('/promociones', { state: { tab: 'promociones' } })}
        style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#212B33', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem' }}
      >
        <ChevronLeft size={20} /> Regresar a la lista
      </button>

      <h1 className="page-title" style={{ marginBottom: '2rem', color: '#000' }}>Detalle de Promoción</h1>

      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#000', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem' }}>Información General</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Nombre de la Promoción</label>
            <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>{promo.nombre}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Porcentaje de Descuento</label>
            <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>{promo.porcentaje_descuento}%</div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Descripción Comercial</label>
          <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>{promo.descripcion}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Facturación Mínima Requerida</label>
            <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>
              {promo.facturacion_min ? `$${promo.facturacion_min.toLocaleString('es-CO')}` : 'No aplica'}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Facturación Máxima</label>
            <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>
              {promo.facturacion_max ? `$${promo.facturacion_max.toLocaleString('es-CO')}` : 'No aplica'}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#000', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem' }}>Parámetros y Filtros</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D', display: 'block', marginBottom: '0.5rem' }}>Planes Comerciales Admitidos</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {namesPlanes.length > 0 ? namesPlanes.map((n, i) => (
                <span key={i} className="badge" style={{ background: '#F0F5FA', color: '#212B33', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', border: '1px solid #EAEAEA' }}>{n}</span>
              )) : <span style={{ color: '#66737D', fontSize: '0.875rem' }}>Ninguno definido</span>}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D', display: 'block', marginBottom: '0.5rem' }}>Ciudades Admitidas</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {namesCiudades.length > 0 ? namesCiudades.map((n, i) => (
                <span key={i} className="badge" style={{ background: '#F0F5FA', color: '#212B33', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', border: '1px solid #EAEAEA' }}>{n}</span>
              )) : <span style={{ color: '#66737D', fontSize: '0.875rem' }}>Cualquiera</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D', display: 'block', marginBottom: '0.5rem' }}>Actividades Económicas Admitidas</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {namesActs.length > 0 ? namesActs.map((n, i) => (
                <span key={i} className="badge" style={{ background: '#F0F5FA', color: '#212B33', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', border: '1px solid #EAEAEA' }}>{n}</span>
              )) : <span style={{ color: '#66737D', fontSize: '0.875rem' }}>Cualquiera</span>}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D', display: 'block', marginBottom: '0.5rem' }}>Calidad Financiera Admitida</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {namesCalifs.length > 0 ? namesCalifs.map((n, i) => (
                <span key={i} className="badge" style={{ background: '#F0F5FA', color: '#212B33', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', border: '1px solid #EAEAEA' }}>{n}</span>
              )) : <span style={{ color: '#66737D', fontSize: '0.875rem' }}>Cualquiera</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', background: '#212B33' }} onClick={() => navigate('/promociones/editar', { state: { from: '/promociones/detalle', id_promocion: id_promocion } })}>
            Editar Promoción <Edit2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
