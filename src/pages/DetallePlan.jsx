import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import BackButton from '../components/BackButton';
import ConfirmModal from '../components/ConfirmModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function DetallePlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.id;

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await db.promocionAdmitePlanComercial.where('id_plan_comercial').equals(id).delete();
      await db.planComercial.delete(id);
      navigate('/parametros', { state: { tab: 'plan' } });
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el registro');
    }
  };

  const item = useLiveQuery(() => id ? db.planComercial.get(id) : null, [id]);

  if (!id || item === undefined) return <div style={{ padding: '2rem' }}>Cargando...</div>;
  if (item === null) return <div style={{ padding: '2rem' }}>Registro no encontrado.</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <BackButton fallbackPath='/parametros' fallbackState={{ tab: 'plan' }} title="Detalle de Plan Comercial" />

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#000', borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem' }}>Información</h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Nombre</label>
          <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>{item.nombre}</div>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: '#66737D' }}>Descripción</label>
          <div style={{ fontWeight: 600, color: '#212B33', fontSize: '1rem', marginTop: '0.25rem' }}>{item.descripcion || 'Sin descripción'}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', gap: '1rem' }}>
          <button className="btn-primary" style={{ display: 'flex', gap: '0.5rem', background: '#E74C3C', color: '#fff', border: 'none' }} onClick={() => setConfirmDelete(true)}>
            Eliminar <Trash2 size={16} />
          </button>
          <button className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', background: '#212B33' }} onClick={() => navigate('/parametros/editar-plan', { state: { from: '/parametros/detalle-plan', id: id } })}>
            Editar <Edit2 size={16} />
          </button>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={confirmDelete} 
        title="Eliminar Plan Comercial" 
        message="¿Está seguro de eliminar este registro y sus dependencias de forma permanente?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
