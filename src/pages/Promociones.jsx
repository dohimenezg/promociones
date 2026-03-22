import { useState } from 'react';
import { Search, Filter, PlusCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function Promociones() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'promociones'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDiscount, setFilterDiscount] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const promocionesDB = useLiveQuery(() => db.promocion.toArray()) || [];
  const vigenciasDB = useLiveQuery(() => db.vigenciaPromocion.toArray()) || [];
  const paramActividades = useLiveQuery(() => db.promocionAdmiteActividadEconomica.toArray()) || [];
  const actEcon = useLiveQuery(() => db.actividadEconomica.toArray()) || [];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const promocionesMapped = promocionesDB.map(p => {
    const misCats = paramActividades.filter(pa => pa.id_promocion === p.id_promocion);
    const nombresCats = misCats.map(mc => {
      const act = actEcon.find(a => a.id_actividad_economica === mc.id_actividad_economica);
      return act ? act.nombre : '';
    });
    
    return {
      id: p.id_promocion,
      name: p.nombre,
      desc: p.descripcion,
      discount: p.porcentaje_descuento + '%',
      minFact: p.facturacion_min ? p.facturacion_min.toLocaleString('es-CO') : 'No aplica',
      maxFact: p.facturacion_max ? p.facturacion_max.toLocaleString('es-CO') : 'No aplica',
      param: nombresCats.length > 0 ? nombresCats.join(', ') : 'Ninguno'
    };
  });

  const vigenciasMapped = vigenciasDB.map(v => {
    const promo = promocionesDB.find(p => p.id_promocion === v.id_promocion);
    const today = new Date();
    const start = new Date(v.fecha_inicio + 'T00:00:00');
    const end = new Date(v.fecha_fin + 'T00:00:00');
    let status = 'Programada';
    if (today >= start && today <= end) status = 'Activa';
    else if (today > end) status = 'Vencida';

    return {
      id: v.id_vigencia_promocion,
      promo: promo ? promo.nombre : 'Desconocida',
      start: formatDate(v.fecha_inicio),
      end: formatDate(v.fecha_fin),
      status
    };
  });

  const getTabData = () => {
    switch(activeTab) {
      case 'vigencias':
        return {
          title: 'Vigencias',
          btnText: 'Registrar Vigencia',
          link: '/promociones/registrar-vigencia',
          editLink: '/promociones/editar-vigencia',
          detailLink: '/promociones/detalle-vigencia',
          columns: ['Id', 'Promoción', 'Fecha Inicio', 'Fecha Fin', 'Estado', ''],
          data: vigenciasMapped,
          renderRow: (row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td style={{ fontWeight: 600, color: '#212B33', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.promo}>{row.promo}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{row.start}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{row.end}</td>
              <td style={{ fontWeight: 600, color: row.status === 'Activa' ? '#66A3D2' : '#66737D', whiteSpace: 'nowrap' }}>{row.status}</td>
              <td style={{ display: 'flex', gap: '0.5rem', color: '#66737D' }}>
                <Eye cursor="pointer" size={16} title="Ver detalle" onClick={() => navigate('/promociones/detalle-vigencia', { state: { id_vigencia_promocion: row.id } })} />
                <Edit2 cursor="pointer" size={16} title="Editar" onClick={() => navigate('/promociones/editar-vigencia', { state: { id_vigencia_promocion: row.id } })} />
                <Trash2 cursor="pointer" size={16} title="Eliminar" />
              </td>
            </tr>
          )
        };
      case 'promociones':
      default:
        return {
          title: 'Promociones',
          btnText: 'Registrar Promoción',
          link: '/promociones/registrar',
          editLink: '/promociones/editar',
          detailLink: '/promociones/detalle',
          columns: ['Id', 'Nombre', 'Descripción', 'Descuento', 'Facturación min.', 'Facturación max.', 'Parámetros', ''],
          data: promocionesMapped,
          renderRow: (row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td style={{ fontWeight: 600, color: '#212B33', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.name}>{row.name}</td>
              <td style={{ maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.desc}>{row.desc}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{row.discount}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{row.minFact}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{row.maxFact}</td>
              <td style={{ maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.param}>{row.param}</td>
              <td style={{ display: 'flex', gap: '0.5rem', color: '#66737D' }}>
                <Eye cursor="pointer" size={16} title="Ver detalle" onClick={() => navigate('/promociones/detalle', { state: { id_promocion: row.id } })} />
                <Edit2 cursor="pointer" size={16} title="Editar" onClick={() => navigate('/promociones/editar', { state: { id_promocion: row.id } })} />
                <Trash2 cursor="pointer" size={16} title="Eliminar" />
              </td>
            </tr>
          )
        };
    }
  };

  const currentConfig = getTabData();

  const filteredData = currentConfig.data.filter(row => {
    const nameToMatch = row.name || row.promo;
    const matchesSearch = row.id.toString().includes(searchTerm) || 
           (nameToMatch && nameToMatch.toLowerCase().includes(searchTerm.toLowerCase()));
           
    let matchesFilter = true;
    if (activeTab === 'vigencias') {
      const matchesStatus = filterStatus ? row.status === filterStatus : true;
      let matchesDate = true;
      if (filterDate) {
        const selectedDate = new Date(filterDate + 'T00:00:00');
        const parseDateString = (str) => {
          const [day, month, year] = str.split('/');
          return new Date(`${year}-${month}-${day}T00:00:00`);
        };
        const startDate = parseDateString(row.start);
        const endDate = parseDateString(row.end);
        matchesDate = selectedDate >= startDate && selectedDate <= endDate;
      }
      matchesFilter = matchesStatus && matchesDate;
    } else if (activeTab === 'promociones' && filterDiscount) {
      const discValue = parseInt(row.discount.replace('%', ''));
      if (filterDiscount === '0-25') matchesFilter = discValue >= 0 && discValue <= 25;
      else if (filterDiscount === '26-50') matchesFilter = discValue >= 26 && discValue <= 50;
      else if (filterDiscount === '51-75') matchesFilter = discValue >= 51 && discValue <= 75;
      else if (filterDiscount === '76-100') matchesFilter = discValue >= 76 && discValue <= 100;
    }
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', background: '#212B33', borderRadius: '6px', overflow: 'hidden' }}>
          <button 
            onClick={() => setActiveTab('promociones')}
            style={{ 
              padding: '0.75rem 1.5rem', background: activeTab === 'promociones' ? '#224B6B' : 'transparent', 
              color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500 
            }}
          >Promociones</button>
          <button 
            onClick={() => setActiveTab('vigencias')}
            style={{ 
              padding: '0.75rem 1.5rem', background: activeTab === 'vigencias' ? '#224B6B' : 'transparent', 
              color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500 
            }}
          >Vigencia Promoción</button>
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
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', background: '#F9FAFB', padding: '1rem', borderRadius: '6px', border: '1px solid #EAEAEA' }}>
            {activeTab === 'vigencias' ? (
              <>
                <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">Todos los estados</option>
                  <option value="Activa">Activa</option>
                  <option value="Programada">Programada</option>
                </select>
                <input type="date" className="form-control" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
              </>
            ) : (
              <select className="form-control" value={filterDiscount} onChange={e => setFilterDiscount(e.target.value)}>
                <option value="">Cualquier descuento</option>
                <option value="0-25">0% - 25%</option>
                <option value="26-50">26% - 50%</option>
                <option value="51-75">51% - 75%</option>
                <option value="76-100">76% - 100%</option>
              </select>
            )}
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {currentConfig.columns.map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map(currentConfig.renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
