import { useState } from 'react';
import { Search, Filter, Eye, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function Clientes() {
  const navigate = useNavigate();

  const clientesDB = useLiveQuery(() => db.cliente.toArray()) || [];
  const planesDB = useLiveQuery(() => db.planComercial.toArray()) || [];
  const actsDB = useLiveQuery(() => db.actividadEconomica.toArray()) || [];
  const califsDB = useLiveQuery(() => db.calificacionFinanciera.toArray()) || [];
  const ciudadesDB = useLiveQuery(() => db.ciudad.toArray()) || [];
  const departamentosDB = useLiveQuery(() => db.departamento.toArray()) || [];

  const mockData = clientesDB.map(c => {
    const plan = planesDB.find(p => p.id_plan_comercial === c.id_plan_comercial);
    const act = actsDB.find(a => a.id_actividad_economica === c.id_actividad_economica);
    const calif = califsDB.find(cal => cal.id_calificacion_financiera === c.id_calificacion_financiera);
    const ciudad = ciudadesDB.find(cd => cd.id_ciudad === c.id_ciudad);

    return {
      id_cliente: c.id_cliente,
      id: c.identificacion,
      name: c.nombre,
      invoice: c.promedio_facturacion.toLocaleString('es-CO'),
      overdue: c.saldo_vencido === 0 ? '0,0' : c.saldo_vencido.toLocaleString('es-CO'),
      plan: plan ? plan.nombre : 'Sin Plan',
      act: act ? act.nombre : 'Sin Actividad',
      score: calif ? calif.nombre : 'Sin Calificar',
      city: ciudad ? ciudad.nombre : 'Sin Ciudad'
    };
  });

  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const promptDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const handleDelete = async () => {
    const id_cliente = confirmDelete.id;
    if (!id_cliente) return;
    try {
      await db.clienteAplicaPromocion.where('id_cliente').equals(id_cliente).delete();
      await db.cliente.delete(id_cliente);
      setConfirmDelete({ isOpen: false, id: null });
    } catch (err) {
      console.error(err);
      alert('Error al eliminar cliente');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterPlan, setFilterPlan] = useState('');
  const [filterScore, setFilterScore] = useState('');
  const [filterCiudad, setFilterCiudad] = useState('');
  const [filterAct, setFilterAct] = useState('');

  const filteredData = mockData.filter(row => {
    const matchesSearch = row.id.toString().includes(searchTerm) || row.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan ? row.plan === filterPlan : true;
    const matchesScore = filterScore ? row.score === filterScore : true;
    const matchesCiudad = filterCiudad ? row.city === filterCiudad : true;
    const matchesAct = filterAct ? row.act === filterAct : true;
    return matchesSearch && matchesPlan && matchesScore && matchesCiudad && matchesAct;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div style={{ flex: 1, maxWidth: '600px' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: 10, top: 10, color: '#66737D' }} />
              <input type="text" className="form-control" placeholder="Buscar Clientes..." style={{ paddingLeft: '2.5rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowFilters(!showFilters)}>
              <Filter size={16} /> Filtrar
            </button>
          </div>
          {showFilters && (
            <div className="grid-2" style={{ marginTop: '1rem', background: '#F9FAFB', padding: '1rem', borderRadius: '6px', border: '1px solid #EAEAEA' }}>
              <select className="form-control" value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
                <option value="">Todos los planes</option>
                {planesDB.map(p => (
                  <option key={p.id_plan_comercial} value={p.nombre}>{p.nombre}</option>
                ))}
              </select>
              <select className="form-control" value={filterScore} onChange={e => setFilterScore(e.target.value)}>
                <option value="">Todas las calificaciones</option>
                {califsDB.map(c => (
                  <option key={c.id_calificacion_financiera} value={c.nombre}>{c.nombre}</option>
                ))}
              </select>
              <select className="form-control" value={filterCiudad} onChange={e => setFilterCiudad(e.target.value)}>
                <option value="">Todas las ciudades</option>
                {ciudadesDB.map(c => {
                  const depto = departamentosDB.find(d => d.id_departamento === c.id_departamento);
                  const label = depto ? `${c.nombre}, ${depto.nombre}` : c.nombre;
                  return <option key={c.id_ciudad} value={c.nombre}>{label}</option>;
                })}
              </select>
              <select className="form-control" value={filterAct} onChange={e => setFilterAct(e.target.value)}>
                <option value="">Todas las actividades</option>
                {actsDB.map(a => (
                  <option key={a.id_actividad_economica} value={a.nombre}>{a.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button className="btn-primary" onClick={() => navigate('/clientes/registrar')}>
          Registrar Cliente <PlusCircle size={18} />
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Identificación</th>
              <th>Nombre</th>
              <th>Factura prom.</th>
              <th>Saldo vencido</th>
              <th>Plan comercial</th>
              <th>Actividad económica</th>
              <th>Calificación financiera</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td style={{ fontWeight: 600, color: '#212B33', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.name}>{row.name}</td>
                <td style={{ fontWeight: 600 }}>{row.invoice}</td>
                <td>{row.overdue}</td>
                <td style={{ fontWeight: 600, maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.plan}>{row.plan}</td>
                <td style={{ maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.act}>{row.act}</td>
                <td>{row.score}</td>
                <td style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', color: '#66737D' }}>
                  <Eye cursor="pointer" size={18} title="Ver detalle" onClick={() => navigate('/clientes/detalle', { state: { id_cliente: row.id_cliente } })} />
                  <Edit2 cursor="pointer" size={18} title="Editar cliente" onClick={() => navigate('/clientes/editar', { state: { from: '/clientes', id_cliente: row.id_cliente } })} />
                  <Trash2 cursor="pointer" size={18} title="Eliminar cliente" onClick={() => promptDelete(row.id_cliente)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen} 
        title="Eliminar Cliente" 
        message="¿Está seguro de eliminar este cliente y todas sus asignaciones? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </div>
  );
}
