import { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';
import AlertModal from '../components/AlertModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

function FilterGroup({ title, items, selectedItems, setSelectedItems, allowAll, setAllowAll }) {
  const availableItems = items.filter(val => !selectedItems.includes(val.id));

  const handleSelect = (e) => {
    const val = Number(e.target.value);
    if (val) {
      setSelectedItems([...selectedItems, val]);
    }
  };

  const handleRemove = (valId) => {
    setSelectedItems(selectedItems.filter(item => item !== valId));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
        <label className="form-label" style={{ marginBottom: 0 }}>{title}</label>
        <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#434C52' }}>
          <input type="checkbox" checked={allowAll} onChange={(e) => { setAllowAll(e.target.checked); if (e.target.checked) setSelectedItems([]); }} />
          Permitir todos
        </label>
      </div>
      {!allowAll && (
        <>
          <select className="form-control" style={{ marginBottom: '0.5rem' }} value="" onChange={handleSelect}>
            <option value="" disabled>Seleccionar...</option>
            {availableItems.map(item => (
              <option key={item.id} value={item.id}>{item.nombre}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {selectedItems.map(itemId => {
              const itemDef = items.find(i => i.id === itemId);
              if (!itemDef) return null;
              return (
                <span key={itemDef.id} onClick={() => handleRemove(itemDef.id)} style={{ background: '#212B33', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  {itemDef.nombre} ✕
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function EditarPromocion() {
  const navigate = useNavigate();
  const location = useLocation();
  const id_promocion = location.state?.id_promocion;

  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info', redirectId: null });

  const [nombre, setNombre] = useState('');
  const [descuento, setDescuento] = useState('');
  const [desc, setDesc] = useState('');
  const [minFact, setMinFact] = useState('');
  const [maxFact, setMaxFact] = useState('');

  const [allowAllPlanes, setAllowAllPlanes] = useState(true);
  const [selectedPlanes, setSelectedPlanes] = useState([]);

  const [allowAllCiudades, setAllowAllCiudades] = useState(true);
  const [selectedCiudades, setSelectedCiudades] = useState([]);

  const [allowAllActividades, setAllowAllActividades] = useState(true);
  const [selectedActividades, setSelectedActividades] = useState([]);
  const [actividadesLimits, setActividadesLimits] = useState({});

  const [allowAllCalificaciones, setAllowAllCalificaciones] = useState(true);
  const [selectedCalificaciones, setSelectedCalificaciones] = useState([]);

  // Carga inicial y única de datos reales
  useEffect(() => {
    if (!id_promocion) return;
    async function loadData() {
      const p = await db.promocion.get(id_promocion);
      if (p) {
        setNombre(p.nombre || '');
        setDesc(p.descripcion || '');
        setDescuento(p.porcentaje_descuento || '');
        setMinFact(p.facturacion_min || '');
        setMaxFact(p.facturacion_max || '');
      }

      const pPlanes = await db.promocionAdmitePlanComercial.where({ id_promocion }).toArray();
      if (pPlanes.length > 0) {
        setAllowAllPlanes(false);
        setSelectedPlanes(pPlanes.map(x => x.id_plan_comercial));
      }

      const pCiudades = await db.promocionAdmiteCiudad.where({ id_promocion }).toArray();
      if (pCiudades.length > 0) {
        setAllowAllCiudades(false);
        setSelectedCiudades(pCiudades.map(x => x.id_ciudad));
      }

      const pActs = await db.promocionAdmiteActividadEconomica.where({ id_promocion }).toArray();
      if (pActs.length > 0) {
        setAllowAllActividades(false);
        setSelectedActividades(pActs.map(x => x.id_actividad_economica));

        const limitsObj = {};
        pActs.forEach(x => {
          if (x.limite_anual !== null) {
            limitsObj[x.id_actividad_economica] = x.limite_anual;
          }
        });
        setActividadesLimits(limitsObj);
      }

      const pCalifs = await db.promocionAdmiteCalificacionFinanciera.where({ id_promocion }).toArray();
      if (pCalifs.length > 0) {
        setAllowAllCalificaciones(false);
        setSelectedCalificaciones(pCalifs.map(x => x.id_calificacion_financiera));
      }
    }
    loadData();
  }, [id_promocion]);

  // Data from DB para los Selects
  const planesDB = useLiveQuery(() => db.planComercial.toArray()) || [];
  const ciudadesDB = useLiveQuery(() => db.ciudad.toArray()) || [];
  const deptosDB = useLiveQuery(() => db.departamento.toArray()) || [];
  const actsDB = useLiveQuery(() => db.actividadEconomica.toArray()) || [];
  const califsDB = useLiveQuery(() => db.calificacionFinanciera.toArray()) || [];

  const ALL_PLANES = planesDB.map(p => ({ id: p.id_plan_comercial, nombre: p.nombre }));
  const ALL_CIUDADES = ciudadesDB.map(c => {
    const depto = deptosDB.find(d => d.id_departamento === c.id_departamento);
    return { id: c.id_ciudad, nombre: depto ? `${c.nombre}, ${depto.nombre}` : c.nombre };
  });
  const ALL_ACTIVIDADES = actsDB.map(a => ({ id: a.id_actividad_economica, nombre: a.nombre }));
  const ALL_CALIFICACIONES = califsDB.map(c => ({ id: c.id_calificacion_financiera, nombre: c.nombre }));

  const handleUpdate = async () => {
    if (!nombre || !descuento || !desc) {
      setAlert({ isOpen: true, title: 'Datos Incompletos', message: 'El nombre, descripción y el porcentaje de descuento son obligatorios.', type: 'error' });
      return;
    }

    const valDescuento = Number(descuento);
    if (valDescuento <= 0 || valDescuento > 100) {
      setAlert({ isOpen: true, title: 'Valor Inválido', message: 'El porcentaje de descuento debe ser mayor a 0 y máximo 100.', type: 'error' });
      return;
    }

    const valMin = minFact ? Number(minFact) : 0;
    if (valMin < 0) {
      setAlert({ isOpen: true, title: 'Valor Inválido', message: 'La facturación mínima no puede ser negativa.', type: 'error' });
      return;
    }

    if (maxFact) {
      const valMax = Number(maxFact);
      if (valMax < 0) {
        setAlert({ isOpen: true, title: 'Valor Inválido', message: 'La facturación máxima no puede ser negativa.', type: 'error' });
        return;
      }
      if (valMax < valMin) {
        setAlert({ isOpen: true, title: 'Valor Inválido', message: 'La facturación máxima debe ser mayor o igual a la mínima.', type: 'error' });
        return;
      }
    }

    // Update promotion
    await db.promocion.update(id_promocion, {
      nombre,
      descripcion: desc,
      porcentaje_descuento: Number(descuento),
      facturacion_min: minFact ? Number(minFact) : null,
      facturacion_max: maxFact ? Number(maxFact) : null
    });

    // Replace parameters
    await db.promocionAdmitePlanComercial.where({ id_promocion }).delete();
    const activePlanes = allowAllPlanes ? ALL_PLANES.map(p => p.id) : selectedPlanes;
    if (activePlanes.length > 0) {
      await db.promocionAdmitePlanComercial.bulkAdd(activePlanes.map(id => ({ id_plan_comercial: id, id_promocion: id_promocion })));
    }

    await db.promocionAdmiteCiudad.where({ id_promocion }).delete();
    const activeCiudades = allowAllCiudades ? ALL_CIUDADES.map(c => c.id) : selectedCiudades;
    if (activeCiudades.length > 0) {
      await db.promocionAdmiteCiudad.bulkAdd(activeCiudades.map(id => ({ id_ciudad: id, id_promocion: id_promocion })));
    }

    await db.promocionAdmiteCalificacionFinanciera.where({ id_promocion }).delete();
    const activeCalifs = allowAllCalificaciones ? ALL_CALIFICACIONES.map(c => c.id) : selectedCalificaciones;
    if (activeCalifs.length > 0) {
      await db.promocionAdmiteCalificacionFinanciera.bulkAdd(activeCalifs.map(id => ({ id_calificacion_financiera: id, id_promocion: id_promocion })));
    }

    await db.promocionAdmiteActividadEconomica.where({ id_promocion }).delete();
    const activeActs = allowAllActividades ? ALL_ACTIVIDADES.map(a => a.id) : selectedActividades;
    if (activeActs.length > 0) {
      await db.promocionAdmiteActividadEconomica.bulkAdd(activeActs.map(id => ({
        id_actividad_economica: id,
        id_promocion: id_promocion,
        limite_anual: actividadesLimits[id] ? Number(actividadesLimits[id]) : null
      })));
    }

    setAlert({
      isOpen: true,
      title: 'Actualización Exitosa',
      message: 'Promoción actualizada exitosamente. Serás redirigido a gestionar su historial de vigencias.',
      type: 'success',
      redirectId: id_promocion
    });
  };

  if (!id_promocion) {
    return <div style={{ padding: '2rem' }}>Error: Promoción no encontrada.</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <BackButton fallbackPath='/promociones' fallbackState={{ tab: 'promociones' }} title="Edición de Promoción" />

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#212B33' }}>Información General</h3>


        <p style={{ fontSize: '0.875rem', color: '#434C52', marginBottom: '2rem' }}>Los campos marcados con * son obligatorios</p>
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Nombre de la Promoción*</label>
            <input type="text" className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Porcentaje de Descuento (%)*</label>
            <input type="number" className="form-control" value={descuento} onChange={e => setDescuento(e.target.value)} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Descripción Comercial*</label>
          <input type="text" className="form-control" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>


        <p style={{ fontSize: '0.875rem', color: '#434C52', marginBottom: '2rem' }}>Los campos marcados con * son obligatorios</p>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Facturación Mínima Requerida</label>
            <input type="number" className="form-control" value={minFact} onChange={e => setMinFact(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Facturación Máxima</label>
            <input type="number" className="form-control" placeholder="No aplica" value={maxFact} onChange={e => setMaxFact(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#212B33' }}>Parámetros</h3>
        <p style={{ fontSize: '0.875rem', color: '#66737D', marginBottom: '1.5rem' }}>
          El cliente debe cumplir <strong>TODOS</strong> los criterios seleccionados para recibir la promoción.
        </p>


        <p style={{ fontSize: '0.875rem', color: '#434C52', marginBottom: '2rem' }}>Los campos marcados con * son obligatorios</p>
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <FilterGroup title="Planes Comerciales Admitidos" items={ALL_PLANES} selectedItems={selectedPlanes} setSelectedItems={setSelectedPlanes} allowAll={allowAllPlanes} setAllowAll={setAllowAllPlanes} />
          <FilterGroup title="Ciudades Admitidas" items={ALL_CIUDADES} selectedItems={selectedCiudades} setSelectedItems={setSelectedCiudades} allowAll={allowAllCiudades} setAllowAll={setAllowAllCiudades} />
        </div>

        <p style={{ fontSize: '0.875rem', color: '#434C52', marginBottom: '2rem' }}>Los campos marcados con * son obligatorios</p>
        <div className="grid-2">
          <div>
            <FilterGroup title="Actividades Económicas Admitidas" items={ALL_ACTIVIDADES} selectedItems={selectedActividades} setSelectedItems={setSelectedActividades} allowAll={allowAllActividades} setAllowAll={setAllowAllActividades} />
            {(allowAllActividades || selectedActividades.length > 0) && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#F9FAFB', borderRadius: '4px', border: '1px solid #EAEAEA' }}>
                <p style={{ fontSize: '0.75rem', color: '#66737D', marginBottom: '0.5rem', fontWeight: 600 }}>Límites anuales por Actividad</p>
                {(allowAllActividades ? ALL_ACTIVIDADES.map(a => a.id) : selectedActividades).map(id => {
                  const name = ALL_ACTIVIDADES.find(a => a.id === id)?.nombre;
                  return (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem' }}>{name}</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Sin límite"
                        className="form-control"
                        style={{ width: '100px', padding: '0.25rem' }}
                        value={actividadesLimits[id] || ''}
                        onChange={e => setActividadesLimits({ ...actividadesLimits, [id]: e.target.value })}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <FilterGroup title="Calificaciones Financieras Admitidas" items={ALL_CALIFICACIONES} selectedItems={selectedCalificaciones} setSelectedItems={setSelectedCalificaciones} allowAll={allowAllCalificaciones} setAllowAll={setAllowAllCalificaciones} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <button className="btn-secondary" onClick={() => navigate('/promociones', { state: { tab: 'promociones' } })}>Cancelar</button>
        <button className="btn-primary" onClick={handleUpdate}>Guardar Cambios</button>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => {
          setAlert(prev => ({ ...prev, isOpen: false }));
          if (alert.type === 'success' && alert.redirectId) {
            navigate('/promociones/registrar-vigencia', { state: { id_promocion: alert.redirectId } });
          }
        }}
      />
    </div>
  );
}
