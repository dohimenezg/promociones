import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import BackButton from '../components/BackButton';
import ConfirmModal from '../components/ConfirmModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function DetalleDepartamento() {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.id;

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    try {
      const ciudades = await db.ciudad.where('id_departamento').equals(id).toArray();
      const ciudadIds = ciudades.map(c => c.id_ciudad);
      if (ciudadIds.length > 0) {
        await db.promocionAdmiteCiudad.where('id_ciudad').anyOf(ciudadIds).delete();
        await db.ciudad.bulkDelete(ciudadIds);
      }
      await db.departamento.delete(id);
      navigate('/ubicaciones', { state: { tab: 'departamentos' } });
    } catch (err) {
      console.error(err);
      alert('Error al eliminar departamento');
    }
  };

  const item = useLiveQuery(() => id ? db.departamento.get(id) : null, [id]);

  if (!id || item === undefined) return <div style={{ padding: '2rem' }}>Cargando...</div>;
  if (item === null) return <div style={{ padding: '2rem' }}>Registro no encontrado.</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <BackButton fallbackPath='/ubicaciones' fallbackState={{ tab: 'departamentos' }} title="Detalle de Departamento" />

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#000', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem' }}>Información</h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Nombre</label>
          <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>{item.nombre}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', gap: '1rem' }}>
          <button className="btn-primary" style={{ display: 'flex', gap: '0.5rem', background: '#E74C3C', color: '#fff', border: 'none' }} onClick={() => setConfirmDelete(true)}>
            Eliminar <Trash2 size={16} />
          </button>
          <button className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', background: '#212B33' }} onClick={() => navigate('/ubicaciones/editar-departamento', { state: { from: '/ubicaciones/detalle-departamento', id: id } })}>
            Editar <Edit2 size={16} />
          </button>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={confirmDelete} 
        title="Eliminar Departamento" 
        message="¿Está seguro de eliminar este departamento? Eliminará en cascada todas las ciudades asignadas y las reglas geográficas relacionadas a promociones."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
