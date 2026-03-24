import BackButton from '../components/BackButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function EditarPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.from || '/parametros';
  const id = location.state?.id;

  const item = useLiveQuery(() => id ? db.planComercial.get(id) : null, [id]);

  if (!id || item === undefined) return <div style={{ padding: '2rem' }}>Cargando...</div>;
  if (item === null) return <div style={{ padding: '2rem' }}>Registro no encontrado.</div>;

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    try {
      await db.planComercial.update(id, {
        nombre: data.nombre,
        descripcion: data.descripcion
      });
      navigate(returnUrl, { state: { tab: 'plan', id: id } });
    } catch (err) {
      console.error(err);
      alert('Error al guardar cambios.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <BackButton fallbackPath='/parametros' fallbackState={null} title="Edición de Plan Comercial" />

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#000', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem' }}>Información</h3>
        
        
        <p style={{ fontSize: '0.875rem', color: '#434C52', marginBottom: '2rem' }}>Los campos marcados con * son obligatorios</p>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Nombre*</label>
            <input type="text" className="form-control" name="nombre" defaultValue={item.nombre} required />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-control" name="descripcion" rows="3" defaultValue={item.descripcion || ''}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate(returnUrl, { state: { tab: 'plan', id: id } })}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ background: '#212B33' }}>Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}
