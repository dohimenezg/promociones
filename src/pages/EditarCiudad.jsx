import { ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function EditarCiudad() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.from || '/ubicaciones';
  const id = location.state?.id;

  const item = useLiveQuery(() => id ? db.ciudad.get(id) : null, [id]);
  const deptosDB = useLiveQuery(() => db.departamento.toArray()) || [];

  if (!id || item === undefined) return <div style={{ padding: '2rem' }}>Cargando...</div>;
  if (item === null) return <div style={{ padding: '2rem' }}>Registro no encontrado.</div>;

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    try {
      await db.ciudad.update(id, {
        nombre: data.nombre,
        id_departamento: Number(data.id_departamento)
      });
      navigate(returnUrl, { state: { tab: 'ciudades', id: id } });
    } catch (err) {
      console.error(err);
      alert('Error al guardar cambios.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <button 
        onClick={() => navigate(returnUrl, { state: { tab: 'ciudades' } })}
        style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#212B33', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem' }}
      >
        <ChevronLeft size={20} /> Regresar
      </button>

      <h1 className="page-title" style={{ marginBottom: '2rem', color: '#000' }}>Edición de Ciudad</h1>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#000', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem' }}>Información</h3>
        
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Departamento</label>
            <select className="form-control" name="id_departamento" defaultValue={item.id_departamento} required>
              <option value="">Seleccione...</option>
              {deptosDB.map(d => (
                <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ciudad</label>
            <input type="text" className="form-control" name="nombre" defaultValue={item.nombre} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate(returnUrl, { state: { tab: 'ciudades', id: id } })}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ background: '#212B33' }}>Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}
