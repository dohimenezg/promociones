import BackButton from '../components/BackButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function DetalleAsignacion() {
  const navigate = useNavigate();
  const location = useLocation();
  const id_cliente = location.state?.id_cliente;
  const id_vigencia_promocion = location.state?.id_vigencia_promocion;

  const asignacion = useLiveQuery(() => 
    (id_cliente && id_vigencia_promocion) 
      ? db.clienteAplicaPromocion.get([id_cliente, id_vigencia_promocion]) 
      : null, 
  [id_cliente, id_vigencia_promocion]);

  const cliente = useLiveQuery(() => asignacion ? db.cliente.get(asignacion.id_cliente) : null, [asignacion]);
  const vigencia = useLiveQuery(() => asignacion ? db.vigenciaPromocion.get(asignacion.id_vigencia_promocion) : null, [asignacion]);
  const promocion = useLiveQuery(() => vigencia ? db.promocion.get(vigencia.id_promocion) : null, [vigencia]);

  const asignacionesCliente = useLiveQuery(() => id_cliente ? db.clienteAplicaPromocion.where('id_cliente').equals(id_cliente).toArray() : [], [id_cliente]) || [];
  const vigenciasTodas = useLiveQuery(() => db.vigenciaPromocion.toArray()) || [];
  const relActs = useLiveQuery(() => db.promocionAdmiteActividadEconomica.toArray()) || [];

  let conteoAnual = 0;
  let limiteAnual = null;

  if (promocion && asignacion && cliente && vigenciasTodas.length > 0 && asignacionesCliente.length > 0) {
    const yearAsignacion = new Date(asignacion.fecha_asignacion).getFullYear();
    const vigsMismaPromo = vigenciasTodas.filter(v => v.id_promocion === promocion.id_promocion).map(v => v.id_vigencia_promocion);
    
    conteoAnual = asignacionesCliente.filter(a => {
      if (!vigsMismaPromo.includes(a.id_vigencia_promocion)) return false;
      const yr = new Date(a.fecha_asignacion).getFullYear();
      return yr === yearAsignacion;
    }).length;

    const relAct = relActs.find(r => r.id_promocion === promocion.id_promocion && r.id_actividad_economica === cliente.id_actividad_economica);
    if (relAct && relAct.limite_anual) {
      limiteAnual = relAct.limite_anual;
    }
  }

  if (!id_cliente || !id_vigencia_promocion || asignacion === undefined) return <div style={{ padding: '2rem' }}>Cargando asignación...</div>;
  if (asignacion === null) return <div style={{ padding: '2rem' }}>Asignación no encontrada.</div>;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <BackButton fallbackPath='/asignaciones' fallbackState={null} title="Detalle de Asignación" />

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#000', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem' }}>Información de la Asignación</h3>

        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Identificación del Cliente</label>
            <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>
              {cliente ? cliente.identificacion : 'Cargando...'}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Nombre del Cliente</label>
            <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>
              {cliente ? cliente.nombre : 'Cargando...'}
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Promoción Asignada</label>
            <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>
              {promocion ? promocion.nombre : 'Cargando...'}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Descuento Aplicado</label>
            <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>
              {promocion ? promocion.porcentaje_descuento + '%' : 'Cargando...'}
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Fecha de Asignación</label>
            <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>
              {formatDate(asignacion.fecha_asignacion)}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Uso Anual de Promoción</label>
            <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>
              {conteoAnual > 0 ? `${conteoAnual} ${limiteAnual ? `de ${limiteAnual}` : '(Sin límite)'}` : 'Cargando...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
