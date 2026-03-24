import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem',
        maxWidth: '400px', width: '90%', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        position: 'relative',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <button onClick={onCancel} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#66737D' }}>
          <X size={20} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#E74C3C' }}>
          <AlertTriangle size={24} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#212B33' }}>{title || 'Confirmación de la Operación'}</h3>
        </div>
        
        <p style={{ color: '#434C52', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={onCancel} style={{ background: '#F9FAFB', color: '#434C52', border: '1px solid #EAEAEA' }}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={onConfirm} style={{ background: '#E74C3C', border: 'none', color: '#fff' }}>
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
