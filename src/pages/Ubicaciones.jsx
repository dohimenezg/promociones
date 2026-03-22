import { useState } from 'react';
import { Search, Filter, PlusCircle, Edit2, Trash2, Eye } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function Ubicaciones() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'ciudades'); // ciudades, departamentos
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDept, setFilterDept] = useState('');

  const departamentosDB = useLiveQuery(() => db.departamento.toArray()) || [];
  const ciudadesDB = useLiveQuery(() => db.ciudad.toArray()) || [];

  const ciudades = ciudadesDB.map(c => {
    const dpt = departamentosDB.find(d => d.id_departamento === c.id_departamento);
    return {
      id: c.id_ciudad,
      name: c.nombre,
      parent: dpt ? dpt.nombre : ''
    };
  });

  const departamentos = departamentosDB.map(d => ({
    id: d.id_departamento,
    name: d.nombre
  }));

  const getTabData = () => {
    switch(activeTab) {
      case 'departamentos':
        return {
          title: 'Departamentos',
          btnText: 'Registrar Departamento',
          link: '/ubicaciones/registrar-departamento',
          editLink: '/ubicaciones/editar-departamento',
          detailLink: '/ubicaciones/detalle-departamento',
          columns: ['Id', 'Departamento', ''],
          data: departamentos
        };
      case 'ciudades':
      default:
        return {
          title: 'Ciudades',
          btnText: 'Registrar Ciudad',
          link: '/ubicaciones/registrar-ciudad',
          editLink: '/ubicaciones/editar-ciudad',
          detailLink: '/ubicaciones/detalle-ciudad',
          columns: ['Id', 'Ciudad', 'Departamento', ''],
          data: ciudades
        };
    }
  };

  const currentConfig = getTabData();

  const filteredData = currentConfig.data.filter(row => {
    const matchesSearch = row.id.toString().includes(searchTerm) || row.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept && row.parent ? row.parent === filterDept : true;
    return matchesSearch && matchesDept;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', background: '#212B33', borderRadius: '6px', overflow: 'hidden' }}>
          <button 
            onClick={() => setActiveTab('ciudades')}
            style={{ 
              padding: '0.75rem 1.5rem', background: activeTab === 'ciudades' ? '#224B6B' : 'transparent', 
              color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500 
            }}
          >Ciudades</button>
          <button 
            onClick={() => setActiveTab('departamentos')}
            style={{ 
              padding: '0.75rem 1.5rem', background: activeTab === 'departamentos' ? '#224B6B' : 'transparent', 
              color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500 
            }}
          >Departamentos</button>
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
          <button className="btn-secondary" style={{ display: activeTab === 'ciudades' ? 'flex' : 'none', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} /> Filtrar
          </button>
        </div>
        {showFilters && activeTab === 'ciudades' && (
          <div style={{ marginTop: '1rem', background: '#F9FAFB', padding: '1rem', borderRadius: '6px', border: '1px solid #EAEAEA' }}>
            <select className="form-control" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
              <option value="">Todos los departamentos</option>
              {departamentosDB.map(d => (
                <option key={d.id_departamento} value={d.nombre}>{d.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {currentConfig.columns.map((col, idx) => (
                <th key={idx} style={{ width: idx === 0 ? '80px' : (idx === currentConfig.columns.length - 1 ? '100px' : 'auto') }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td style={{ fontWeight: 600, color: '#212B33' }}>{row.name}</td>
                {activeTab === 'ciudades' && <td>{row.parent}</td>}
                  <td style={{ display: 'flex', gap: '1rem', color: '#66737D' }}>
                  <Eye cursor="pointer" size={18} title="Ver detalle" onClick={() => navigate(currentConfig.detailLink, { state: { id: row.id } })} />
                  <Edit2 cursor="pointer" size={18} title="Editar" onClick={() => navigate(currentConfig.editLink, { state: { id: row.id } })} />
                  <Trash2 cursor="pointer" size={18} title="Eliminar" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
