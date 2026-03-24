import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function RegistrarCiudad() {
  const navigate = useNavigate();
  const deptosDB = useLiveQuery(() => db.departamento.toArray()) || [];

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    if (!data.nombre || !data.id_departamento) return alert('Todos los campos son obligatorios');

    try {
      await db.ciudad.add({
        nombre: data.nombre,
        id_departamento: Number(data.id_departamento)
      });
      navigate('/ubicaciones', { state: { tab: 'ciudades' } });
    } catch (err) {
      console.error(err);
      alert('Error al guardar el registro.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <BackButton fallbackPath='/ubicaciones' fallbackState={{ tab: 'ciudades' }} title="Registro de Ciudad" />

      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#000' }}>Datos de la ciudad</h3>
        <p style={{ fontSize: '0.875rem', color: '#434C52', marginBottom: '2rem' }}>Los campos marcados con * son obligatorios</p>

        <form onSubmit={handleSave}>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ color: '#66737D', fontWeight: 500, fontSize: '0.75rem' }}>Nombre*</label>
            <input type="text" className="form-control" name="nombre" placeholder="Nombre Ciudad" style={{ fontSize: '1rem' }} required />
          </div>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <label className="form-label" style={{ color: '#66737D', fontWeight: 500, fontSize: '0.75rem' }}>Departamento*</label>
            <select className="form-control" name="id_departamento" style={{ fontSize: '1rem' }} required>
              <option value="">Seleccione Departamento</option>
              {deptosDB.map(d => (
                <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            Registrar Ciudad
          </button>
        </form>
      </div>
    </div>
  );
}
