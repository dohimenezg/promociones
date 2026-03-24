import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function AlertModal({ isOpen, title, message, type = 'info', onClose }) {
  if (!isOpen) return null;

  let Icon = Info;
  let color = '#3498DB';
  
  if (type === 'success') {
    Icon = CheckCircle;
    color = '#27AE60';
  } else if (type === 'error') {
    Icon = AlertCircle;
    color = '#E74C3C';
  } else if (type === 'info') {
    Icon = Info;
    color = '#3498DB'; 
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem',
        maxWidth: '430px', width: '90%', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        position: 'relative',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#66737D' }}>
          <X size={20} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color }}>
          <Icon size={26} />
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#212B33' }}>{title || 'Notificación'}</h3>
        </div>
        
        <p style={{ color: '#434C52', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={onClose} style={{ background: color, border: 'none', color: '#fff', padding: '0.5rem 1.5rem' }}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
