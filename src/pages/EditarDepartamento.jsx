import { ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function EditarDepartamento() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.from || '/ubicaciones';
  const id = location.state?.id;

  const item = useLiveQuery(() => id ? db.departamento.get(id) : null, [id]);

  if (!id || item === undefined) return <div style={{ padding: '2rem' }}>Cargando...</div>;
  if (item === null) return <div style={{ padding: '2rem' }}>Registro no encontrado.</div>;

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    try {
      await db.departamento.update(id, {
        nombre: data.nombre
      });
      navigate(returnUrl, { state: { tab: 'departamentos', id: id } });
    } catch (err) {
      console.error(err);
      alert('Error al guardar cambios.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <button 
        onClick={() => navigate(returnUrl, { state: { tab: 'departamentos' } })}
        style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#212B33', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem' }}
      >
        <ChevronLeft size={20} /> Regresar
      </button>

      <h1 className="page-title" style={{ marginBottom: '2rem', color: '#000' }}>Edición de Departamento</h1>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#000', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem' }}>Información</h3>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input type="text" className="form-control" name="nombre" defaultValue={item.nombre} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate(returnUrl, { state: { tab: 'departamentos', id: id } })}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ background: '#212B33' }}>Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}
