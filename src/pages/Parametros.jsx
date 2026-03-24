import { useState } from 'react';
import { Search, Filter, PlusCircle, Edit2, Trash2, Eye } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function Parametros() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'plan'); // plan, actividad, calificacion
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState('id_asc');

  const planes = useLiveQuery(() => db.planComercial.toArray()) || [];
  const actividades = useLiveQuery(() => db.actividadEconomica.toArray()) || [];
  const calificaciones = useLiveQuery(() => db.calificacionFinanciera.toArray()) || [];

  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const promptDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const handleDelete = async () => {
    const id = confirmDelete.id;
    if (!id) return;
    try {
      if (activeTab === 'plan') {
        await db.promocionAdmitePlanComercial.where('id_plan_comercial').equals(id).delete();
        await db.planComercial.delete(id);
      } else if (activeTab === 'actividad') {
        await db.promocionAdmiteActividadEconomica.where('id_actividad_economica').equals(id).delete();
        await db.actividadEconomica.delete(id);
      } else if (activeTab === 'calificacion') {
        await db.promocionAdmiteCalificacionFinanciera.where('id_calificacion_financiera').equals(id).delete();
        await db.calificacionFinanciera.delete(id);
      }
      setConfirmDelete({ isOpen: false, id: null });
    } catch (err) {
      console.error(err);
      alert('Error al eliminar registro');
    }
  };

  const getTabData = () => {
    switch(activeTab) {
      case 'plan':
        return {
          title: 'Plan comercial',
          btnText: 'Registrar Plan Comercial',
          link: '/parametros/registrar-plan',
          editLink: '/parametros/editar-plan',
          detailLink: '/parametros/detalle-plan',
          data: planes.map(p => ({ id: p.id_plan_comercial, name: p.nombre, desc: p.descripcion }))
        };
      case 'actividad':
        return {
          title: 'Actividad económica',
          btnText: 'Registrar Actividad Económica',
          link: '/parametros/registrar-actividad',
          editLink: '/parametros/editar-actividad',
          detailLink: '/parametros/detalle-actividad',
          data: actividades.map(a => ({ id: a.id_actividad_economica, name: a.nombre, desc: a.descripcion }))
        };
      case 'calificacion':
      default:
        return {
          title: 'Calificación financiera',
          btnText: 'Registrar Calificación Financiera',
          link: '/parametros/registrar-calificacion',
          editLink: '/parametros/editar-calificacion',
          detailLink: '/parametros/detalle-calificacion',
          data: calificaciones.map(c => ({ id: c.id_calificacion_financiera, name: c.nombre, desc: c.descripcion }))
        };
    }
  };

  const currentConfig = getTabData();

  const filteredData = currentConfig.data.filter(row => 
    row.id.toString().includes(searchTerm) || 
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortOrder === 'name_asc') return a.name.localeCompare(b.name);
    if (sortOrder === 'name_desc') return b.name.localeCompare(a.name);
    if (sortOrder === 'id_desc') return b.id - a.id;
    return a.id - b.id; // id_asc
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', background: '#212B33', borderRadius: '6px', overflow: 'hidden' }}>
          <button 
            onClick={() => setActiveTab('plan')}
            style={{ 
              padding: '0.75rem 1.5rem', background: activeTab === 'plan' ? '#224B6B' : 'transparent', 
              color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500 
            }}
          >Plan comercial</button>
          <button 
            onClick={() => setActiveTab('actividad')}
            style={{ 
              padding: '0.75rem 1.5rem', background: activeTab === 'actividad' ? '#224B6B' : 'transparent', 
              color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500 
            }}
          >Actividad económica</button>
          <button 
            onClick={() => setActiveTab('calificacion')}
            style={{ 
              padding: '0.75rem 1.5rem', background: activeTab === 'calificacion' ? '#224B6B' : 'transparent', 
              color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500 
            }}
          >Calificación financiera</button>
        </div>

        <button className="btn-primary" onClick={() => navigate(currentConfig.link)}>
          {currentConfig.btnText} <PlusCircle size={18} />
        </button>
      </div>

      <div style={{ flex: 1, maxWidth: '600px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 10, top: 10, color: '#66737D' }} />
            <input type="text" className="form-control" placeholder={`Buscar ${currentConfig.title}...`} style={{ paddingLeft: '2.5rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} /> Filtrar
          </button>
        </div>
        {showFilters && (
          <div style={{ marginTop: '1rem', background: '#F9FAFB', padding: '1rem', borderRadius: '6px', border: '1px solid #EAEAEA' }}>
            <select className="form-control" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="id_asc">Ordenar: ID Menor a Mayor</option>
              <option value="id_desc">Ordenar: ID Mayor a Menor</option>
              <option value="name_asc">Ordenar: Nombre A-Z</option>
              <option value="name_desc">Ordenar: Nombre Z-A</option>
            </select>
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Id</th>
              <th style={{ width: '250px' }}>Nombre</th>
              <th>Descripción</th>
              <th style={{ width: '100px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td style={{ fontWeight: 600, color: '#212B33' }}>{row.name}</td>
                <td>{row.desc}</td>
                <td style={{ display: 'flex', gap: '1rem', color: '#66737D' }}>
                  <Eye cursor="pointer" size={18} title="Ver detalle" onClick={() => navigate(currentConfig.detailLink, { state: { id: row.id } })} />
                  <Edit2 cursor="pointer" size={18} title="Editar" onClick={() => navigate(currentConfig.editLink, { state: { id: row.id } })} />
                  <Trash2 cursor="pointer" size={18} title="Eliminar" onClick={() => promptDelete(row.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen} 
        title="Eliminar Parámetro" 
        message="¿Está seguro de eliminar este registro de forma permanente? Se eliminarán también las validaciones pendientes asociadas."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </div>
  );
}
