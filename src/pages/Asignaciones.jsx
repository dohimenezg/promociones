import { useState } from 'react';
import { Search, Filter, RefreshCw, Play, Download, Eye } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, resetDatabase } from '../services/db';

export default function Asignaciones() {
  const navigate = useNavigate();

  const asignacionesDB = useLiveQuery(() => db.clienteAplicaPromocion.toArray()) || [];
  const clientesDB = useLiveQuery(() => db.cliente.toArray()) || [];
  const vigenciasDB = useLiveQuery(() => db.vigenciaPromocion.toArray()) || [];
  const promocionesDB = useLiveQuery(() => db.promocion.toArray()) || [];

  const [confirmReset, setConfirmReset] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const handleReset = async () => {
    setConfirmReset(false);
    await resetDatabase();
    window.location.reload();
  };

  const ejecutarAsignaciones = async () => {
    // DO NOT clear db.clienteAplicaPromocion.
    const asignacionesAnteriores = await db.clienteAplicaPromocion.toArray();

    const clientes = await db.cliente.toArray();
    const vigencias = await db.vigenciaPromocion.toArray();
    const promociones = await db.promocion.toArray();
    const pCiudades = await db.promocionAdmiteCiudad.toArray();
    const pPlanes = await db.promocionAdmitePlanComercial.toArray();
    const pCalifs = await db.promocionAdmiteCalificacionFinanciera.toArray();
    const pActs = await db.promocionAdmiteActividadEconomica.toArray();

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const nuevasAsignaciones = [];

    // Helper to get times assigned in year
    const timesAssignedInYear = (idCliente, idPromocion) => {
      return asignacionesAnteriores.filter(a => {
        if (a.id_cliente !== idCliente) return false;
        const v = vigencias.find(v => v.id_vigencia_promocion === a.id_vigencia_promocion);
        if (!v || v.id_promocion !== idPromocion) return false;
        const aYear = new Date(a.fecha_asignacion).getFullYear();
        return aYear === currentYear;
      }).length;
    };

    // Helper to check if client already got a promo this month
    const hasAssignmentThisMonth = (idCliente) => {
      return asignacionesAnteriores.some(a => {
        if (a.id_cliente !== idCliente) return false;
        // La fecha_asignacion ya viene en formato guardado YYYY-MM-DD
        const aYear = new Date(a.fecha_asignacion + 'T00:00:00').getFullYear();
        const aMonth = new Date(a.fecha_asignacion + 'T00:00:00').getMonth();
        return aYear === currentYear && aMonth === currentMonth;
      });
    };

    for (const cli of clientes) {
      if (cli.saldo_vencido > 0) continue; // Rule: Must be 'al día'
      if (hasAssignmentThisMonth(cli.id_cliente)) continue; // Rule: Only 1 promo per month

      let candidateVigencias = [];

      for (const vig of vigencias) {
        // Rule: Not already assigned this specific vigencia
        const alreadyHasVigencia = asignacionesAnteriores.some(a => a.id_cliente === cli.id_cliente && a.id_vigencia_promocion === vig.id_vigencia_promocion);
        if (alreadyHasVigencia) continue;

        const start = new Date(vig.fecha_inicio + 'T00:00:00');
        const end = new Date(vig.fecha_fin + 'T00:00:00');
        end.setHours(23, 59, 59);

        if (today >= start && today <= end) {
          const promo = promociones.find(p => p.id_promocion === vig.id_promocion);
          if (!promo) continue;

          // Constraints
          const reqCiudades = pCiudades.filter(p => p.id_promocion === promo.id_promocion).map(p => p.id_ciudad);
          const reqPlanes = pPlanes.filter(p => p.id_promocion === promo.id_promocion).map(p => p.id_plan_comercial);
          const reqCalifs = pCalifs.filter(p => p.id_promocion === promo.id_promocion).map(p => p.id_calificacion_financiera);

          const ruleActs = pActs.filter(p => p.id_promocion === promo.id_promocion);
          const reqActs = ruleActs.map(p => p.id_actividad_economica);

          // Check if matches criteria
          const validCiudad = reqCiudades.length === 0 || reqCiudades.includes(cli.id_ciudad);
          const validPlan = reqPlanes.length === 0 || reqPlanes.includes(cli.id_plan_comercial);
          const validCalif = reqCalifs.length === 0 || reqCalifs.includes(cli.id_calificacion_financiera);
          const validAct = reqActs.length === 0 || reqActs.includes(cli.id_actividad_economica);
          const validMinFact = !promo.facturacion_min || cli.promedio_facturacion >= promo.facturacion_min;
          const validMaxFact = !promo.facturacion_max || cli.promedio_facturacion <= promo.facturacion_max;

          if (validCiudad && validPlan && validCalif && validAct && validMinFact && validMaxFact) {

            // Check annual limit rule based on activity
            const activityRule = ruleActs.find(r => r.id_actividad_economica === cli.id_actividad_economica);
            let limitValid = true;
            if (activityRule && activityRule.limite_anual !== null && activityRule.limite_anual > 0) {
              const assignedCount = timesAssignedInYear(cli.id_cliente, promo.id_promocion);
              if (assignedCount >= activityRule.limite_anual) {
                limitValid = false;
              }
            }

            if (limitValid) {
              candidateVigencias.push({ vig, promo });
            }
          }
        }
      }

      // If we have candidates, pick the best one
      if (candidateVigencias.length > 0) {
        candidateVigencias.sort((a, b) => {
          // Rule: pick most favorable (% discount desc)
          if (b.promo.porcentaje_descuento !== a.promo.porcentaje_descuento) {
            return b.promo.porcentaje_descuento - a.promo.porcentaje_descuento;
          }
          // Tie-breaker: oldest vigencia (fecha_inicio asc)
          return new Date(a.vig.fecha_inicio) - new Date(b.vig.fecha_inicio);
        });

        const best = candidateVigencias[0];
        nuevasAsignaciones.push({
          id_cliente: cli.id_cliente,
          id_vigencia_promocion: best.vig.id_vigencia_promocion,
          fecha_asignacion: todayString
        });
      }
    }

    if (nuevasAsignaciones.length > 0) {
      await db.clienteAplicaPromocion.bulkAdd(nuevasAsignaciones);
      setAlertConfig({
        isOpen: true,
        type: 'success',
        title: 'Asignación Exitosa',
        message: `El proceso ha finalizado correctamente. Se han procesado ${nuevasAsignaciones.length} nuevas asignaciones.`
      });
    } else {
      setAlertConfig({
        isOpen: true,
        type: 'info',
        title: 'Sin Novedades',
        message: 'No hay nuevas promociones aplicables para asignar en este momento. Todos los clientes válidos ya tienen sus promociones asignadas, o no cumplen las condiciones.'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const mockData = asignacionesDB.map(a => {
    const cli = clientesDB.find(c => c.id_cliente === a.id_cliente);
    const vig = vigenciasDB.find(v => v.id_vigencia_promocion === a.id_vigencia_promocion);
    const pro = vig ? promocionesDB.find(p => p.id_promocion === vig.id_promocion) : null;

    return {
      id_cliente: a.id_cliente,
      id_vigencia: a.id_vigencia_promocion,
      id: cli ? cli.identificacion : 'N/A',
      client: cli ? cli.nombre : 'N/A',
      promo: pro ? pro.nombre : 'N/A',
      discount: pro ? pro.porcentaje_descuento + '%' : '0%',
      date: formatDate(a.fecha_asignacion)
    };
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterPromo, setFilterPromo] = useState('');

  const filteredData = mockData.filter(row => {
    const matchesSearch = row.id.toString().includes(searchTerm) || row.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPromo = filterPromo ? row.promo === filterPromo : true;
    return matchesSearch && matchesPromo;
  });

  const uniqueClientsAssigned = new Set(asignacionesDB.map(a => a.id_cliente)).size;
  let ultimaAsignacionStr = '--/--/----';
  let ultimoPeriodoStr = '--';
  let estadoAsignacion = 'Sin Datos';
  let estadoColor = '#66737D';

  if (asignacionesDB.length > 0) {
    const sortedDates = [...asignacionesDB].sort((a, b) => new Date(b.fecha_asignacion) - new Date(a.fecha_asignacion));
    const maxDateString = sortedDates[0].fecha_asignacion;
    const [year, month, day] = maxDateString.split('-');

    ultimaAsignacionStr = `${day}/${month}/${year}`;

    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    ultimoPeriodoStr = `${months[parseInt(month, 10) - 1]} ${year}`;

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === parseInt(year, 10) && today.getMonth() === (parseInt(month, 10) - 1);

    if (isCurrentMonth) {
      estadoAsignacion = 'Al día';
      estadoColor = '#66A3D2';
    } else {
      estadoAsignacion = 'Pendiente';
      estadoColor = '#E74C3C';
    }
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: '2rem' }}>Asignación de promociones</h1>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#66737D', marginBottom: '0.5rem' }}>ESTADO ASIGNACIÓN</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: estadoColor }}>{estadoAsignacion}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#66737D', marginBottom: '0.5rem' }}>ÚLTIMA ASIGNACIÓN</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#212B33' }}>{ultimaAsignacionStr}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#66737D', marginBottom: '0.5rem' }}>ÚLTIMO PERIODO ASIGNADO</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#212B33' }}>{ultimoPeriodoStr}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#66737D', marginBottom: '0.5rem' }}>TOTAL ASIGNADOS</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#212B33' }}>{uniqueClientsAssigned.toLocaleString('es-CO')} Clientes</div>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#212B33', marginBottom: '0.25rem' }}>Procesamiento de Asignaciones</h3>
          <p style={{ fontSize: '0.875rem', color: '#66737D' }}>Ejecute el motor de reglas de promoción con la base de datos actual.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FCECEB', color: '#E74C3C', border: '1px solid #E74C3C' }} onClick={() => setConfirmReset(true)}>
            <RefreshCw size={16} /> Reiniciar BD
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={ejecutarAsignaciones}>
            <Play size={16} /> Ejecutar Asignación
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, maxWidth: '500px' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: 10, top: 10, color: '#66737D' }} />
                <input type="text" className="form-control" placeholder="Buscar Cliente..." style={{ paddingLeft: '2.5rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowFilters(!showFilters)}>
                <Filter size={16} /> Filtrar
              </button>
            </div>
            {showFilters && (
              <div style={{ marginTop: '1rem', background: '#F9FAFB', padding: '1rem', borderRadius: '6px', border: '1px solid #EAEAEA' }}>
                <select className="form-control" value={filterPromo} onChange={e => setFilterPromo(e.target.value)}>
                  <option value="">Todas las promociones</option>
                  {promocionesDB.map(p => (
                    <option key={p.id_promocion} value={p.nombre}>{p.nombre}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ fontWeight: 600, color: '#212B33' }}>
            Asignación de promociones {ultimoPeriodoStr !== '--' ? ultimoPeriodoStr : ''}
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Identificación</th>
              <th>Cliente</th>
              <th>Promoción Asignada</th>
              <th>Descuento</th>
              <th>Fecha Asignación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, i) => (
              <tr key={i}>
                <td>{row.id}</td>
                <td>{row.client}</td>
                <td style={{ fontWeight: 600, fontSize: '0.75rem' }}>{row.promo}</td>
                <td style={{ fontWeight: 600 }}>{row.discount}</td>
                <td>
                  <span style={{ padding: '0.25rem 0.5rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {row.date}
                  </span>
                </td>
                <td><Eye size={18} color="#66737D" cursor="pointer" title="Ver detalle" onClick={() => navigate('/asignaciones/detalle', { state: { id_cliente: row.id_cliente, id_vigencia_promocion: row.id_vigencia } })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={confirmReset}
        title="Restaurar Base de Datos"
        message="¿Estás seguro de reiniciar la Base de Datos a sus valores iniciales de prueba? Se borrarán de forma irreversible todos los cambios actuales."
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />

      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
      />
    </div>
  );
}
