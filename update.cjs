const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'pages');

const files = fs.readdirSync(dir).filter(f => f.startsWith('Registrar') || f.startsWith('Editar'));

const paragraph = '<p style={{ fontSize: \\'0.875rem\\', color: \\'#434C52\\', marginBottom: \\'2rem\\' }}>Los campos marcados con * son obligatorios</p>';

files.forEach(f => {
  let content = fs.readFileSync(path.join(dir, f), 'utf8');
  
  // Agregar parrafo antes de <form onSubmit
  if (!content.includes('Los campos marcados con * son obligatorios')) {
    content = content.replace(/<form onSubmit=\{([^}]+)\}>/g, paragraph + '\\n        <form onSubmit={$1}>');
    // Para Promociones que no tienen form sino div card
    if (f.includes('Promocion')) {
        content = content.replace(/<div className="grid-2"/, paragraph + '\\n        <div className="grid-2"');
    }
  }

  // Asteriscos (Reemplazar solo si no tiene asterisco ya)
  const exactReplace = (search, replace) => {
    content = content.split(search).join(replace);
  };

  exactReplace('<label className="form-label">Nombre</label>', '<label className="form-label">Nombre*</label>');
  exactReplace('<label className="form-label">Departamento</label>', '<label className="form-label">Departamento*</label>');
  exactReplace('<label className="form-label">Ciudad</label>', '<label className="form-label">Ciudad*</label>');
  
  exactReplace('<label className="form-label">Nombre de la Promoción</label>', '<label className="form-label">Nombre de la Promoción*</label>');
  exactReplace('<label className="form-label">Porcentaje de Descuento (%)</label>', '<label className="form-label">Porcentaje de Descuento (%)*</label>');
  exactReplace('<label className="form-label">Descripción Comercial</label>', '<label className="form-label">Descripción Comercial*</label>');

  exactReplace('<label className="form-label">Promoción Seleccionada</label>', '<label className="form-label">Promoción Seleccionada*</label>');
  exactReplace('<label className="form-label">Seleccionar Promoción Existente</label>', '<label className="form-label">Seleccionar Promoción Existente*</label>');
  exactReplace('<label className="form-label">Fecha de Inicio</label>', '<label className="form-label">Fecha de Inicio*</label>');
  exactReplace('<label className="form-label">Fecha de Finalización</label>', '<label className="form-label">Fecha de Finalización*</label>');

  exactReplace('<label className="form-label">Tipo de Persona</label>', '<label className="form-label">Tipo de Persona*</label>');
  exactReplace('<label className="form-label">Tipo de Identificación</label>', '<label className="form-label">Tipo de Identificación*</label>');
  exactReplace('<label className="form-label">Plan Comercial</label>', '<label className="form-label">Plan Comercial*</label>');
  exactReplace('<label className="form-label">Ubicación (Ciudad y Departamento)</label>', '<label className="form-label">Ubicación (Ciudad y Departamento)*</label>');
  exactReplace('<label className="form-label">Actividad Económica</label>', '<label className="form-label">Actividad Económica*</label>');
  exactReplace('<label className="form-label">Factura Promedio</label>', '<label className="form-label">Factura Promedio*</label>');
  exactReplace('<label className="form-label">Saldo Vencido</label>', '<label className="form-label">Saldo Vencido*</label>');
  exactReplace('<label className="form-label">Calificación Financiera</label>', '<label className="form-label">Calificación Financiera*</label>');

  fs.writeFileSync(path.join(dir, f), content);
});

console.log('Update Script Executed Successfully!');
