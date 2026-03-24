import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import BackButton from '../components/BackButton';
import ConfirmModal from '../components/ConfirmModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function DetalleCliente() {
  const navigate = useNavigate();
  const location = useLocation();
  const id_cliente = location.state?.id_cliente;

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await db.clienteAplicaPromocion.where('id_cliente').equals(id_cliente).delete();
      await db.cliente.delete(id_cliente);
      navigate('/clientes');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar cliente');
    }
  };

  const cliente = useLiveQuery(() => id_cliente ? db.cliente.get(id_cliente) : null, [id_cliente]);
  const planesDB = useLiveQuery(() => db.planComercial.toArray()) || [];
  const actsDB = useLiveQuery(() => db.actividadEconomica.toArray()) || [];
  const califsDB = useLiveQuery(() => db.calificacionFinanciera.toArray()) || [];
  const ciudadesDB = useLiveQuery(() => db.ciudad.toArray()) || [];
  const departamentosDB = useLiveQuery(() => db.departamento.toArray()) || [];
  
  const asignacionesDB = useLiveQuery(() => id_cliente ? db.clienteAplicaPromocion.where('id_cliente').equals(id_cliente).toArray() : [], [id_cliente]) || [];
  const vigenciasDB = useLiveQuery(() => db.vigenciaPromocion.toArray()) || [];
  const promocionesDB = useLiveQuery(() => db.promocion.toArray()) || [];

  if (!id_cliente || cliente === undefined) {
    return <div style={{ padding: '2rem' }}>Cargando datos del cliente...</div>;
  }

  if (cliente === null) {
    return <div style={{ padding: '2rem' }}>Cliente no encontrado.</div>;
  }

  const plan = planesDB.find(p => p.id_plan_comercial === cliente.id_plan_comercial);
  const act = actsDB.find(a => a.id_actividad_economica === cliente.id_actividad_economica);
  const calif = califsDB.find(c => c.id_calificacion_financiera === cliente.id_calificacion_financiera);
  const ciudad = ciudadesDB.find(c => c.id_ciudad === cliente.id_ciudad);
  const depto = ciudad ? departamentosDB.find(d => d.id_departamento === ciudad.id_departamento) : null;
  const ubicacion = ciudad ? `${ciudad.nombre}, ${depto?.nombre || ''}` : 'Sin ubicación';

  const formatMonthYear = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const promosAsignadas = asignacionesDB.map(a => {
    const vig = vigenciasDB.find(v => v.id_vigencia_promocion === a.id_vigencia_promocion);
    const promo = vig ? promocionesDB.find(p => p.id_promocion === vig.id_promocion) : null;
    return {
      name: promo ? promo.nombre : 'Desconocida',
      date: vig ? formatMonthYear(vig.fecha_inicio) : '',
      discount: promo ? promo.porcentaje_descuento + '%' : '0%',
      assigned: formatDate(a.fecha_asignacion)
    };
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '1rem' }}>
      <BackButton fallbackPath='/clientes' fallbackState={null} title="Detalle del Cliente" />

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h4 style={{ fontSize: '0.8rem', color: '#66737D', letterSpacing: '0.5px', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem', marginBottom: '1rem' }}>INFORMACIÓN PERSONAL</h4>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#66737D' }}>Nombre Completo / Razón Social</div>
            <div style={{ fontWeight: 600, color: '#212B33' }}>{cliente.nombre}</div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#66737D' }}>Identificación / NIT</div>
            <div style={{ fontWeight: 600, color: '#212B33' }}>{cliente.identificacion}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#66737D' }}>Dirección</div>
            <div style={{ fontWeight: 600, color: '#212B33' }}>{cliente.direccion}</div>
          </div>
        </div>

        <div className="card">
          <h4 style={{ fontSize: '0.8rem', color: '#66737D', letterSpacing: '0.5px', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem', marginBottom: '1rem' }}>PERFIL COMERCIAL</h4>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#66737D' }}>Plan Comercial</div>
            <div style={{ fontWeight: 600, color: '#212B33' }}>{plan ? plan.nombre : 'No aplica'}</div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#66737D' }}>Ubicación</div>
            <div style={{ fontWeight: 600, color: '#212B33' }}>{ubicacion}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#66737D' }}>Actividad Económica</div>
            <div style={{ fontWeight: 600, color: '#212B33' }}>{act ? act.nombre : 'No aplica'}</div>
          </div>
        </div>

        <div className="card">
          <h4 style={{ fontSize: '0.8rem', color: '#66737D', letterSpacing: '0.5px', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem', marginBottom: '1rem' }}>ESTADO FINANCIERO</h4>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#66737D' }}>Factura Promedio</div>
            <div style={{ fontWeight: 600, color: '#212B33' }}>${cliente.promedio_facturacion?.toLocaleString('es-CO')}</div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#66737D' }}>Saldo Vencido</div>
            <div style={{ fontWeight: 600, color: '#212B33' }}>${cliente.saldo_vencido?.toLocaleString('es-CO')}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#66737D' }}>Calificación</div>
            <div style={{ fontWeight: 600, color: '#212B33' }}>{calif ? calif.nombre : 'Sin calificar'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1rem', color: '#212B33', marginBottom: '1rem' }}>Historial de Promociones Asignadas</h3>
        <table className="table">
          <thead>
            <tr>
              <th>PROMOCIÓN</th>
              <th>VIGENCIA INICIAL</th>
              <th>DESCUENTO</th>
              <th>FECHA ASIGNACIÓN</th>
            </tr>
          </thead>
          <tbody>
            {promosAsignadas.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>Este cliente no tiene promociones asignadas.</td>
              </tr>
            ) : (
              promosAsignadas.map((promo, idx) => (
                <tr key={idx}>
                  <td style={{ color: '#66737D' }}>{promo.name}</td>
                  <td style={{ color: '#66737D' }}>{promo.date}</td>
                  <td style={{ fontWeight: 600, color: '#212B33' }}>{promo.discount}</td>
                  <td style={{ color: '#66737D' }}>{promo.assigned}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
          <button className="btn-primary" style={{ display: 'flex', gap: '0.5rem', background: '#E74C3C', color: '#fff', border: 'none' }} onClick={() => setConfirmDelete(true)}>
            Eliminar Cliente <Trash2 size={16} />
          </button>
          <button className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', background: '#212B33' }} onClick={() => navigate('/clientes/editar', { state: { from: '/clientes/detalle', id_cliente: id_cliente } })}>
            Editar Cliente <Edit2 size={16} />
          </button>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={confirmDelete} 
        title="Eliminar Cliente" 
        message="¿Está seguro de eliminar de forma permanente? Esta acción borrará en cascada cualquier historial de promociones asignadas a este cliente."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
