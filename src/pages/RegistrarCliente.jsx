import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function RegistrarCliente() {
  const navigate = useNavigate();
  const [tipoPersona, setTipoPersona] = useState(1);

  const ciudadesDB = useLiveQuery(() => db.ciudad.toArray()) || [];
  const departamentosDB = useLiveQuery(() => db.departamento.toArray()) || [];
  const planesDB = useLiveQuery(() => db.planComercial.toArray()) || [];
  const actsDB = useLiveQuery(() => db.actividadEconomica.toArray()) || [];
  const califsDB = useLiveQuery(() => db.calificacionFinanciera.toArray()) || [];
  const tiposPersonaDB = useLiveQuery(() => db.tipoPersona.toArray()) || [];
  const tiposIdentDB = useLiveQuery(() => db.tipoIdentificacion.toArray()) || [];

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    if (!data.nombre || !data.identificacion) {
      alert('Nombre e Identificación son obligatorios.');
      return;
    }

    try {
      await db.cliente.add({
        id_tipo_persona: Number(data.id_tipo_persona),
        id_tipo_identificacion: Number(data.id_tipo_identificacion),
        nombre: data.nombre,
        identificacion: data.identificacion,
        direccion: data.direccion,
        id_plan_comercial: Number(data.id_plan_comercial),
        id_ciudad: Number(data.id_ciudad),
        id_actividad_economica: Number(data.id_actividad_economica),
        promedio_facturacion: Number(data.promedio_facturacion || 0),
        saldo_vencido: Number(data.saldo_vencido || 0),
        id_calificacion_financiera: Number(data.id_calificacion_financiera)
      });
      alert('Cliente registrado exitosamente.');
      navigate('/clientes');
    } catch (err) {
      console.error(err);
      alert('No se pudo guardar el cliente. Revisa la consola.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '1rem' }}>
      <button 
        onClick={() => navigate('/clientes')}
        style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#212B33', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        <ChevronLeft size={20} /> Regresar a la lista
      </button>

      <h1 className="page-title" style={{ marginBottom: '2rem', color: '#000' }}>Registro de Cliente</h1>

      <form onSubmit={handleSave}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* INFO PERSONAL */}
        <div className="card">
          <h4 style={{ fontSize: '0.8rem', color: '#66737D', letterSpacing: '0.5px', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem', marginBottom: '1rem' }}>INFORMACIÓN PERSONAL</h4>
          
          <div className="form-group">
            <label className="form-label">Tipo de Persona</label>
            <select 
              className="form-control" 
              name="id_tipo_persona"
              value={tipoPersona}
              onChange={(e) => setTipoPersona(Number(e.target.value))}
              required
            >
              {tiposPersonaDB.map(t => <option key={t.id_tipo_persona} value={t.id_tipo_persona}>{t.nombre}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Identificación</label>
            <select className="form-control" name="id_tipo_identificacion" required>
              <option value="">Seleccione...</option>
              {tiposIdentDB.map(t => <option key={t.id_tipo_identificacion} value={t.id_tipo_identificacion}>{t.nombre}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              {tipoPersona === 1 ? 'Nombre Completo' : 'Razón Social'}
            </label>
            <input type="text" className="form-control" name="nombre" required placeholder={tipoPersona === 1 ? 'Nombre Completo' : 'Razón Social'} />
          </div>
          <div className="form-group">
            <label className="form-label">
              {tipoPersona === 1 ? 'Identificación' : 'NIT'}
            </label>
            <input type="text" className="form-control" name="identificacion" required placeholder={tipoPersona === 1 ? 'Identificación' : 'Número de NIT'} />
          </div>
          <div className="form-group">
            <label className="form-label">
              {tipoPersona === 1 ? 'Dirección' : 'Dirección Principal'}
            </label>
            <input type="text" className="form-control" name="direccion" required placeholder="Dirección" />
          </div>
        </div>

        {/* PERFIL COMERCIAL */}
        <div className="card">
          <h4 style={{ fontSize: '0.8rem', color: '#66737D', letterSpacing: '0.5px', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem', marginBottom: '1rem' }}>PERFIL COMERCIAL</h4>
          <div className="form-group">
            <label className="form-label">Plan Comercial</label>
            <select className="form-control" name="id_plan_comercial" required>
              <option value="">Seleccione...</option>
              {planesDB.map(p => <option key={p.id_plan_comercial} value={p.id_plan_comercial}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ubicación (Ciudad y Departamento)</label>
            <select className="form-control" name="id_ciudad" required>
              <option value="">Seleccione...</option>
              {ciudadesDB.map(c => {
                const depto = departamentosDB.find(d => d.id_departamento === c.id_departamento);
                const label = depto ? `${c.nombre}, ${depto.nombre}` : c.nombre;
                return <option key={c.id_ciudad} value={c.id_ciudad}>{label}</option>;
              })}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Actividad Económica</label>
            <select className="form-control" name="id_actividad_economica" required>
              <option value="">Seleccione...</option>
              {actsDB.map(a => <option key={a.id_actividad_economica} value={a.id_actividad_economica}>{a.nombre}</option>)}
            </select>
          </div>
        </div>

        {/* ESTADO FINANCIERO */}
        <div className="card">
          <h4 style={{ fontSize: '0.8rem', color: '#66737D', letterSpacing: '0.5px', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem', marginBottom: '1rem' }}>ESTADO FINANCIERO</h4>
          <div className="form-group">
            <label className="form-label">Factura Promedio</label>
            <input type="number" className="form-control" name="promedio_facturacion" placeholder="0" required />
          </div>
          <div className="form-group">
            <label className="form-label">Saldo Vencido</label>
            <input type="number" className="form-control" name="saldo_vencido" placeholder="0" defaultValue="0" required />
          </div>
          <div className="form-group">
            <label className="form-label">Calificación Financiera</label>
            <select className="form-control" name="id_calificacion_financiera" required>
              <option value="">Seleccione...</option>
              {califsDB.map(c => <option key={c.id_calificacion_financiera} value={c.id_calificacion_financiera}>{c.nombre}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button type="button" className="btn-secondary" onClick={() => navigate('/clientes')}>Cancelar</button>
        <button type="submit" className="btn-primary" style={{ background: '#212B33' }}>Registrar Cliente</button>
      </div>
      </form>
    </div>
  );
}
