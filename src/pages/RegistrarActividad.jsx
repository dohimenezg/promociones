import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { db } from '../services/db';

export default function RegistrarActividad() {
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    if (!data.nombre) return alert('El nombre es obligatorio');

    try {
      await db.actividadEconomica.add({
        nombre: data.nombre,
        descripcion: data.descripcion
      });
      navigate('/parametros', { state: { tab: 'actividad' } });
    } catch (err) {
      console.error(err);
      alert('Error al guardar el registro.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <button 
        onClick={() => navigate('/parametros', { state: { tab: 'actividad' } })}
        style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#212B33', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem' }}
      >
        <ChevronLeft size={20} /> Regresar a la lista
      </button>

      <h1 className="page-title" style={{ marginBottom: '2rem', color: '#000' }}>Registro de Actividad Económica</h1>

      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#000' }}>Datos de la actividad económica</h3>
        <p style={{ fontSize: '0.875rem', color: '#434C52', marginBottom: '2rem' }}>Los campos marcados con * son obligatorios</p>

        <form onSubmit={handleSave}>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ color: '#66737D', fontWeight: 500, fontSize: '0.75rem' }}>Nombre*</label>
            <input type="text" className="form-control" name="nombre" placeholder="Nombre Actividad Económica" style={{ fontSize: '1rem' }} required />
          </div>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <label className="form-label" style={{ color: '#66737D', fontWeight: 500, fontSize: '0.75rem' }}>Descripción</label>
            <input type="text" className="form-control" name="descripcion" placeholder="Descripción" style={{ fontSize: '1rem' }} />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            Registrar Actividad Económica
          </button>
        </form>
      </div>
    </div>
  );
}
