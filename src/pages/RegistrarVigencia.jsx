import { useState } from 'react';
import { ChevronLeft, PlusCircle } from 'lucide-react';
import AlertModal from '../components/AlertModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function RegistrarVigencia() {
  const navigate = useNavigate();
  const promocionesDB = useLiveQuery(() => db.promocion.toArray()) || [];
  const location = useLocation();
  const [selectedPromoId, setSelectedPromoId] = useState(location.state?.id_promocion || '');
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const selectedPromo = promocionesDB.find(p => p.id_promocion === Number(selectedPromoId));

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    if (!data.id_promocion || !data.fecha_inicio || !data.fecha_fin) {
      setAlert({ isOpen: true, title: 'Datos Incompletos', message: 'Todos los campos son obligatorios.', type: 'error' });
      return;
    }

    if (new Date(data.fecha_fin) < new Date(data.fecha_inicio)) {
      setAlert({ isOpen: true, title: 'Fechas Inválidas', message: 'La fecha de finalización no puede ser menor a la fecha de inicio.', type: 'error' });
      return;
    }

    try {
      await db.vigenciaPromocion.add({
        id_promocion: Number(data.id_promocion),
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin
      });
      setAlert({ 
        isOpen: true, 
        title: 'Registro Exitoso', 
        message: 'Vigencia registrada exitosamente. Serás redirigido a la lista de vigencias.', 
        type: 'success', 
        onClose: () => {
          setAlert({ ...alert, isOpen: false });
          navigate('/promociones', { state: { tab: 'vigencias' } });
        }
      });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error interno', message: 'Hubo un error al guardar la vigencia.', type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <button 
        onClick={() => navigate('/promociones', { state: { tab: 'vigencias' } })}
        style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#212B33', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem' }}
      >
        <ChevronLeft size={20} /> Regresar a la lista
      </button>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#434C52' }}>¿No encuentras la promoción en la lista? Es posible que aún no haya sido creada.</p>
        <button className="btn-secondary" onClick={() => navigate('/promociones/registrar')} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <PlusCircle size={16} /> Crear Nueva <br/>Promoción
        </button>
      </div>

      <h1 className="page-title" style={{ marginBottom: '2rem' }}>Registrar Vigencia de Promoción</h1>

      <div className="card" style={{ padding: '2rem' }}>
        
        <p style={{ fontSize: '0.875rem', color: '#434C52', marginBottom: '2rem' }}>Los campos marcados con * son obligatorios</p>
        <form onSubmit={handleSave}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Seleccionar Promoción Existente*</label>
            <select 
              className="form-control" 
              name="id_promocion"
              value={selectedPromoId}
              onChange={e => setSelectedPromoId(e.target.value)}
              required
            >
              <option value="">Seleccione una promoción...</option>
              {promocionesDB.map(p => (
                <option key={p.id_promocion} value={p.id_promocion}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div style={{ background: '#F0F5FA', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '1rem', fontSize: '0.875rem', marginBottom: '1.5rem', minHeight: '60px' }}>
            {selectedPromo ? (
              <>
                <strong>Detalles actuales:</strong> Descuento del {selectedPromo.porcentaje_descuento}% | Facturación mínima: {selectedPromo.facturacion_min ? '$' + selectedPromo.facturacion_min.toLocaleString('es-CO') : 'N/A'}.
              </>
            ) : (
              <span style={{ color: '#66737D' }}>Seleccione una promoción para ver sus detalles.</span>
            )}
          </div>

          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Fecha de Inicio*</label>
              <input type="date" className="form-control" name="fecha_inicio" required />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de Finalización*</label>
              <input type="date" className="form-control" name="fecha_fin" required />
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#66737D', marginBottom: '2rem' }}>
            * Recuerde que la vigencia indica el periodo en el que la promoción estará disponible para asignación automática.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/promociones', { state: { tab: 'vigencias' } })}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar Vigencia</button>
          </div>
        </form>
      </div>

      <AlertModal 
        isOpen={alert.isOpen} 
        title={alert.title} 
        message={alert.message} 
        type={alert.type} 
        onClose={() => {
          if (alert.onClose) alert.onClose();
          else setAlert({ ...alert, isOpen: false });
        }}
      />
    </div>
  );
}
