import { useState } from 'react';
import BackButton from '../components/BackButton';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

function FilterGroup({ title, items, selectedItems, setSelectedItems, allowAll, setAllowAll }) {
  // items: [{ id, nombre }]
  // selectedItems: array of ids
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

export default function RegistrarPromocion() {
  const navigate = useNavigate();

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

  const [allowAllCalificaciones, setAllowAllCalificaciones] = useState(true);
  const [selectedCalificaciones, setSelectedCalificaciones] = useState([]);

  // Data from DB
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

  const handleSave = async () => {
    if (!nombre || !descuento) {
      alert('Nombre y Porcentaje de Descuento son obligatorios.');
      return;
    }
    
    // Save promotion
    const idPromocion = await db.promocion.add({
      nombre,
      descripcion: desc,
      porcentaje_descuento: Number(descuento),
      facturacion_min: minFact ? Number(minFact) : null,
      facturacion_max: maxFact ? Number(maxFact) : null
    });

    // Save parameters if not "allowAll"
    if (!allowAllPlanes && selectedPlanes.length > 0) {
      await db.promocionAdmitePlanComercial.bulkAdd(selectedPlanes.map(id => ({ id_plan_comercial: id, id_promocion: idPromocion })));
    }
    if (!allowAllCiudades && selectedCiudades.length > 0) {
      await db.promocionAdmiteCiudad.bulkAdd(selectedCiudades.map(id => ({ id_ciudad: id, id_promocion: idPromocion })));
    }
    if (!allowAllCalificaciones && selectedCalificaciones.length > 0) {
      await db.promocionAdmiteCalificacionFinanciera.bulkAdd(selectedCalificaciones.map(id => ({ id_calificacion_financiera: id, id_promocion: idPromocion })));
    }
    if (!allowAllActividades && selectedActividades.length > 0) {
      // Por defecto registramos sin límite anual desde esta vista simplificada
      await db.promocionAdmiteActividadEconomica.bulkAdd(selectedActividades.map(id => ({ id_actividad_economica: id, id_promocion: idPromocion, limite_anual: null })));
    }

    alert('Promoción registrada exitosamente.');
    navigate('/promociones', { state: { tab: 'promociones' } });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <BackButton fallbackPath='/promociones' fallbackState={{ tab: 'promociones' }} title="Registrar Promoción" />

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#212B33' }}>Información General</h3>
        
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Nombre de la Promoción</label>
            <input type="text" className="form-control" placeholder="Bono Fidelidad Verano 2026" value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Porcentaje de Descuento (%)</label>
            <input type="number" className="form-control" placeholder="15" value={descuento} onChange={e => setDescuento(e.target.value)} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Descripción Comercial</label>
          <input type="text" className="form-control" placeholder="Bono para los mejores clientes..." value={desc} onChange={e => setDesc(e.target.value)} />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Facturación Mínima Requerida</label>
            <input type="number" className="form-control" placeholder="Ej: 50000" value={minFact} onChange={e => setMinFact(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Facturación Máxima</label>
            <input type="number" className="form-control" placeholder="Opcional" value={maxFact} onChange={e => setMaxFact(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#212B33' }}>Parámetros</h3>
        <p style={{ fontSize: '0.875rem', color: '#66737D', marginBottom: '1.5rem' }}>
          El cliente debe cumplir <strong>TODOS</strong> los criterios seleccionados para recibir la promoción.
        </p>

        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <FilterGroup title="Planes Comerciales Admitidos" items={ALL_PLANES} selectedItems={selectedPlanes} setSelectedItems={setSelectedPlanes} allowAll={allowAllPlanes} setAllowAll={setAllowAllPlanes} />
          <FilterGroup title="Ciudades Admitidas" items={ALL_CIUDADES} selectedItems={selectedCiudades} setSelectedItems={setSelectedCiudades} allowAll={allowAllCiudades} setAllowAll={setAllowAllCiudades} />
        </div>
        <div className="grid-2">
          <FilterGroup title="Actividades Económicas Admitidas" items={ALL_ACTIVIDADES} selectedItems={selectedActividades} setSelectedItems={setSelectedActividades} allowAll={allowAllActividades} setAllowAll={setAllowAllActividades} />
          <FilterGroup title="Calificaciones Financieras Admitidas" items={ALL_CALIFICACIONES} selectedItems={selectedCalificaciones} setSelectedItems={setSelectedCalificaciones} allowAll={allowAllCalificaciones} setAllowAll={setAllowAllCalificaciones} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <button className="btn-secondary" onClick={() => navigate('/promociones')}>Cancelar</button>
        <button className="btn-primary" onClick={handleSave}>Guardar Promoción</button>
      </div>
    </div>
  );
}
