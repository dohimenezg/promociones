import { useState } from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import BackButton from '../components/BackButton';
import ConfirmModal from '../components/ConfirmModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function DetallePromocion() {
  const navigate = useNavigate();
  const location = useLocation();
  const id_promocion = location.state?.id_promocion;

  const promo = useLiveQuery(() => id_promocion ? db.promocion.get(id_promocion) : null, [id_promocion]);
  
  const asignacionesDB = useLiveQuery(() => db.clienteAplicaPromocion.toArray()) || [];
  const vigenciasHistoricas = useLiveQuery(() => id_promocion ? db.vigenciaPromocion.where('id_promocion').equals(id_promocion).toArray() : [], [id_promocion]) || [];
  const vigenciaIds = vigenciasHistoricas.map(v => v.id_vigencia_promocion);
  const hasAssignments = asignacionesDB.some(a => vigenciaIds.includes(a.id_vigencia_promocion));

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (hasAssignments) return;
    try {
        await db.promocionAdmitePlanComercial.where('id_promocion').equals(id_promocion).delete();
        await db.promocionAdmiteActividadEconomica.where('id_promocion').equals(id_promocion).delete();
        await db.promocionAdmiteCiudad.where('id_promocion').equals(id_promocion).delete();
        await db.promocionAdmiteCalificacionFinanciera.where('id_promocion').equals(id_promocion).delete();
        
        if (vigenciaIds.length > 0) {
          await db.clienteAplicaPromocion.where('id_vigencia_promocion').anyOf(vigenciaIds).delete();
          await db.vigenciaPromocion.bulkDelete(vigenciaIds);
        }
        await db.promocion.delete(id_promocion);
        navigate('/promociones', { state: { tab: 'promociones' } });
    } catch (err) {
        console.error(err);
        alert('Error al borrar la promoción en cascada');
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getStatus = (startStr, endStr) => {
    const today = new Date();
    const start = new Date(startStr + 'T00:00:00');
    const end = new Date(endStr + 'T00:00:00');
    end.setHours(23, 59, 59);
    if (today >= start && today <= end) return { label: 'Activa', color: '#66A3D2' };
    if (today > end) return { label: 'Vencida', color: '#E74C3C' };
    return { label: 'Programada', color: '#66737D' };
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <BackButton fallbackPath='/promociones' fallbackState={{ tab: 'promociones' }} title="Detalle de Promoción" />

      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#000', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem' }}>Información General</h3>
        
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
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

        <div className="grid-2">
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
        
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
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

        <div className="grid-2">
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', gap: '1rem' }}>
          {hasAssignments ? (
            <span className="custom-tooltip" data-tooltip="No se puede modificar/eliminar, tiene clientes asignados" style={{ display: 'flex', gap: '1rem' }}>
              <button disabled className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', background: '#F0F5FA', color: '#A0ABC0', border: '1px solid #EAEAEA', pointerEvents: 'none' }}>
                Eliminar <Trash2 size={16} />
              </button>
              <button disabled className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', background: '#F0F5FA', color: '#A0ABC0', border: '1px solid #EAEAEA', pointerEvents: 'none' }}>
                Editar Promoción <Edit2 size={16} />
              </button>
            </span>
          ) : (
            <>
              <button className="btn-primary" style={{ display: 'flex', gap: '0.5rem', background: '#E74C3C', color: '#fff', border: 'none' }} onClick={() => setConfirmDelete(true)}>
                Eliminar <Trash2 size={16} />
              </button>
              <button className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', background: '#212B33' }} onClick={() => navigate('/promociones/editar', { state: { from: '/promociones/detalle', id_promocion: id_promocion } })}>
                Editar Promoción <Edit2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#000', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem' }}>Historial de Vigencias</h3>
        {vigenciasHistoricas.length === 0 ? (
          <p style={{ color: '#66737D', fontSize: '0.875rem' }}>Esta promoción no tiene vigencias registradas.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha de Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'center' }}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {vigenciasHistoricas.map(v => {
                  const status = getStatus(v.fecha_inicio, v.fecha_fin);
                  return (
                    <tr key={v.id_vigencia_promocion}>
                      <td>{formatDate(v.fecha_inicio)}</td>
                      <td>{formatDate(v.fecha_fin)}</td>
                      <td>
                        <span className="badge" style={{ background: `${status.color}15`, color: status.color, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Eye cursor="pointer" size={16} color="#66737D" title="Ver vigencia" onClick={() => navigate('/promociones/detalle-vigencia', { state: { id_vigencia_promocion: v.id_vigencia_promocion } })} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <ConfirmModal 
        isOpen={confirmDelete} 
        title="Eliminar Promoción Físicamente" 
        message="¿Está seguro de eliminar esta promoción global? Todo su historial de ubicaciones, actividades económicas y restricciones vinculadas serán borradas permanentemente en cascada."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
