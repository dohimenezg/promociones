import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BackButton({ fallbackPath, fallbackState, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extrae el returnUrl desde el state provisto por la vista anterior
  const returnUrl = location.state?.from || fallbackPath;

  // Calcula dinámicamente el mensaje basado en URL
  let linkText = "Volver";
  if (returnUrl) {
    if (returnUrl.includes('/clientes/detalle')) linkText = "Volver a Detalle de Cliente";
    else if (returnUrl.includes('/clientes')) linkText = "Volver a Clientes";
    else if (returnUrl.includes('/asignaciones/detalle')) linkText = "Volver a Detalle";
    else if (returnUrl.includes('/asignaciones')) linkText = "Volver a Asignaciones";
    else if (returnUrl.includes('/promociones/detalle-vigencia')) linkText = "Volver a Detalle de Vigencia";
    else if (returnUrl.includes('/promociones/detalle')) linkText = "Volver a Detalle de Promoción";
    else if (returnUrl.includes('/promociones')) linkText = "Volver a Promociones";
    else if (returnUrl.includes('/parametros')) linkText = "Volver a Parámetros";
    else if (returnUrl.includes('/ubicaciones')) linkText = "Volver a Ubicaciones";
  }

  // Mezcla el state de contingencia con el location actual para preservar IDs 
  const navState = { ...fallbackState, ...location.state };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#66737D', fontSize: '0.85rem', marginBottom: '0.25rem' }} 
        onClick={() => navigate(returnUrl, { state: navState })}
      >
        <ChevronLeft size={16} />
        <span style={{ fontWeight: 500 }}>{linkText}</span>
      </div>
      {title && <h1 className="page-title" style={{ margin: 0, fontSize: '1.35rem' }}>{title}</h1>}
    </div>
  );
}
