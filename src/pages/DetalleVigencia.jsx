import { ChevronLeft, Edit2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function DetalleVigencia() {
  const navigate = useNavigate();
  const location = useLocation();
  const id_vigencia_promocion = location.state?.id_vigencia_promocion;

  const vigencia = useLiveQuery(() => id_vigencia_promocion ? db.vigenciaPromocion.get(id_vigencia_promocion) : null, [id_vigencia_promocion]);
  const promocion = useLiveQuery(() => vigencia ? db.promocion.get(vigencia.id_promocion) : null, [vigencia]);

  if (!id_vigencia_promocion || vigencia === undefined) return <div style={{ padding: '2rem' }}>Cargando vigencia...</div>;
  if (vigencia === null) return <div style={{ padding: '2rem' }}>Vigencia no encontrada.</div>;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const today = new Date();
  const start = new Date(vigencia.fecha_inicio + 'T00:00:00');
  const end = new Date(vigencia.fecha_fin + 'T00:00:00');
  end.setHours(23, 59, 59);
  
  let status = 'Programada';
  let statusColor = '#66737D';
  if (today >= start && today <= end) { status = 'Activa'; statusColor = '#66A3D2'; }
  else if (today > end) { status = 'Vencida'; statusColor = '#E74C3C'; }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <button 
        onClick={() => navigate('/promociones', { state: { tab: 'vigencias' } })}
        style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#212B33', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem' }}
      >
        <ChevronLeft size={20} /> Regresar a la lista
      </button>

      <h1 className="page-title" style={{ marginBottom: '2rem', color: '#000' }}>Detalle de Vigencia</h1>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#000', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem' }}>Información de la Vigencia</h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Promoción Asociada</label>
          <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>
            {promocion ? promocion.nombre : 'Cargando promoción...'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Fecha de Inicio</label>
            <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>{formatDate(vigencia.fecha_inicio)}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Fecha de Finalización</label>
            <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>{formatDate(vigencia.fecha_fin)}</div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Estado Actual</label>
          <div style={{ fontWeight: 600, color: statusColor, fontSize: '1rem', marginTop: '0.25rem' }}>{status}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', background: '#212B33' }} onClick={() => navigate('/promociones/editar-vigencia', { state: { from: '/promociones/detalle-vigencia', id_vigencia_promocion: id_vigencia_promocion } })}>
            Editar Vigencia <Edit2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
