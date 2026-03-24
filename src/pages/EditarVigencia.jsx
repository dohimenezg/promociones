import { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function EditarVigencia() {
  const navigate = useNavigate();
  const location = useLocation();
  const id_vigencia = location.state?.id_vigencia_promocion;

  const promocionesDB = useLiveQuery(() => db.promocion.toArray()) || [];
  const [vigencia, setVigencia] = useState(null);
  const [selectedPromoId, setSelectedPromoId] = useState('');

  useEffect(() => {
    if (id_vigencia) {
      db.vigenciaPromocion.get(id_vigencia).then(v => {
        if (v) {
          setVigencia(v);
          setSelectedPromoId(v.id_promocion);
        }
      });
    }
  }, [id_vigencia]);

  const selectedPromo = promocionesDB.find(p => p.id_promocion === Number(selectedPromoId));

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    if (!data.id_promocion || !data.fecha_inicio || !data.fecha_fin) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    try {
      await db.vigenciaPromocion.update(id_vigencia, {
        id_promocion: Number(data.id_promocion),
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin
      });
      alert('Vigencia actualizada exitosamente.');
      navigate('/promociones', { state: { tab: 'vigencias' } });
    } catch (err) {
      console.error(err);
      alert('Hubo un error al actualizar la vigencia.');
    }
  };

  if (!vigencia) return <div style={{ padding: '2rem' }}>Cargando vigencia...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <BackButton fallbackPath='/promociones' fallbackState={{ tab: 'vigencias' }} title="Edición de Vigencia" />

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleUpdate}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Promoción Seleccionada</label>
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
              <label className="form-label">Fecha de Inicio</label>
              <input type="date" className="form-control" name="fecha_inicio" defaultValue={vigencia.fecha_inicio} required />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de Finalización</label>
              <input type="date" className="form-control" name="fecha_fin" defaultValue={vigencia.fecha_fin} required />
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#66737D', marginBottom: '2rem' }}>
            * Recuerde que la vigencia indica el periodo en el que la promoción estará disponible para asignación automática.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/promociones', { state: { tab: 'vigencias' } })}>Cancelar</button>
             <button type="submit" className="btn-primary" style={{ background: '#212B33' }}>Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}
