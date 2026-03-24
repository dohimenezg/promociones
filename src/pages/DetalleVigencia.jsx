import { useState } from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import BackButton from '../components/BackButton';
import ConfirmModal from '../components/ConfirmModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function DetalleVigencia() {
  const navigate = useNavigate();
  const location = useLocation();
  const id_vigencia_promocion = location.state?.id_vigencia_promocion;

  const vigencia = useLiveQuery(() => id_vigencia_promocion ? db.vigenciaPromocion.get(id_vigencia_promocion) : null, [id_vigencia_promocion]);
  const promocion = useLiveQuery(() => vigencia ? db.promocion.get(vigencia.id_promocion) : null, [vigencia]);
  
  const asignacionesDB = useLiveQuery(() => db.clienteAplicaPromocion.toArray()) || [];
  const hasAssignments = asignacionesDB.some(a => a.id_vigencia_promocion === id_vigencia_promocion);

  const assignments = useLiveQuery(() => id_vigencia_promocion ? db.clienteAplicaPromocion.where('id_vigencia_promocion').equals(id_vigencia_promocion).toArray() : [], [id_vigencia_promocion]) || [];
  const clientesDB = useLiveQuery(() => db.cliente.toArray()) || [];

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (hasAssignments) return;
    try {
      await db.clienteAplicaPromocion.where('id_vigencia_promocion').equals(id_vigencia_promocion).delete();
      await db.vigenciaPromocion.delete(id_vigencia_promocion);
      navigate('/promociones', { state: { tab: 'vigencias' } });
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la vigencia');
    }
  };

  if (!id_vigencia_promocion || vigencia === undefined) return <div style={{ padding: '2rem' }}>Cargando vigencia...</div>;
  if (vigencia === null) return <div style={{ padding: '2rem' }}>Vigencia no encontrada.</div>;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const clientesAsignados = assignments.map(a => {
    const c = clientesDB.find(cl => cl.id_cliente === a.id_cliente);
    return {
      ...a,
      identificacion: c?.identificacion || '---',
      nombre: c?.nombre || 'Desconocido'
    };
  });

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
      <BackButton fallbackPath='/promociones' fallbackState={{ tab: 'vigencias' }} title="Detalle de Vigencia" />

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#000', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem' }}>Información de la Vigencia</h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Promoción Asociada</label>
          <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>
            {promocion ? promocion.nombre : 'Cargando promoción...'}
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', gap: '1rem' }}>
          {hasAssignments ? (
            <span className="custom-tooltip" data-tooltip="No se puede modificar/eliminar, tiene clientes asignados" style={{ display: 'flex', gap: '1rem' }}>
              <button disabled className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', background: '#F0F5FA', color: '#A0ABC0', border: '1px solid #EAEAEA', pointerEvents: 'none' }}>
                Eliminar <Trash2 size={16} />
              </button>
              <button disabled className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', background: '#F0F5FA', color: '#A0ABC0', border: '1px solid #EAEAEA', pointerEvents: 'none' }}>
                Editar Vigencia <Edit2 size={16} />
              </button>
            </span>
          ) : (
            <>
              <button className="btn-primary" style={{ display: 'flex', gap: '0.5rem', background: '#E74C3C', color: '#fff', border: 'none' }} onClick={() => setConfirmDelete(true)}>
                Eliminar <Trash2 size={16} />
              </button>
              <button className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', background: '#212B33' }} onClick={() => navigate('/promociones/editar-vigencia', { state: { from: '/promociones/detalle-vigencia', id_vigencia_promocion: id_vigencia_promocion } })}>
                Editar Vigencia <Edit2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#000', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem' }}>Clientes Beneficiados</h3>
        {clientesAsignados.length === 0 ? (
          <p style={{ color: '#66737D', fontSize: '0.875rem' }}>No hay usuarios asignados a esta vigencia.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Identificación</th>
                  <th>Cliente</th>
                  <th>Fecha de Asignación</th>
                  <th style={{ textAlign: 'center' }}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {clientesAsignados.map(a => (
                  <tr key={a.id_asignacion}>
                    <td>{a.identificacion}</td>
                    <td>{a.nombre}</td>
                    <td>{formatDate(a.fecha_asignacion)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <Eye cursor="pointer" size={16} color="#66737D" title="Ver cliente" onClick={() => navigate('/clientes/detalle', { state: { id_cliente: a.id_cliente } })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={confirmDelete} 
        title="Eliminar Vigencia" 
        message="¿Está seguro de eliminar esta vigencia? Se eliminará cualquier registro condicional intermedio y no se podrá revertir."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
