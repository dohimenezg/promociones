import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Parametros from './pages/Parametros';
import RegistrarPlan from './pages/RegistrarPlan';
import RegistrarActividad from './pages/RegistrarActividad';
import RegistrarCalificacion from './pages/RegistrarCalificacion';
import EditarPlan from './pages/EditarPlan';
import EditarActividad from './pages/EditarActividad';
import EditarCalificacion from './pages/EditarCalificacion';
import DetallePlan from './pages/DetallePlan';
import DetalleActividad from './pages/DetalleActividad';
import DetalleCalificacion from './pages/DetalleCalificacion';
import Asignaciones from './pages/Asignaciones';
import DetalleAsignacion from './pages/DetalleAsignacion';
import Promociones from './pages/Promociones';
import RegistrarPromocion from './pages/RegistrarPromocion';
import EditarPromocion from './pages/EditarPromocion';
import DetallePromocion from './pages/DetallePromocion';
import RegistrarVigencia from './pages/RegistrarVigencia';
import EditarVigencia from './pages/EditarVigencia';
import DetalleVigencia from './pages/DetalleVigencia';
import Ubicaciones from './pages/Ubicaciones';
import RegistrarCiudad from './pages/RegistrarCiudad';
import EditarCiudad from './pages/EditarCiudad';
import DetalleCiudad from './pages/DetalleCiudad';
import RegistrarDepartamento from './pages/RegistrarDepartamento';
import EditarDepartamento from './pages/EditarDepartamento';
import DetalleDepartamento from './pages/DetalleDepartamento';
import Clientes from './pages/Clientes';
import DetalleCliente from './pages/DetalleCliente';
import EditarCliente from './pages/EditarCliente';
import RegistrarCliente from './pages/RegistrarCliente';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/promociones" replace />} />
          <Route path="parametros" element={<Parametros />} />
          <Route path="parametros/registrar-plan" element={<RegistrarPlan />} />
          <Route path="parametros/registrar-actividad" element={<RegistrarActividad />} />
          <Route path="parametros/registrar-calificacion" element={<RegistrarCalificacion />} />
          <Route path="parametros/editar-plan" element={<EditarPlan />} />
          <Route path="parametros/editar-actividad" element={<EditarActividad />} />
          <Route path="parametros/editar-calificacion" element={<EditarCalificacion />} />
          <Route path="parametros/detalle-plan" element={<DetallePlan />} />
          <Route path="parametros/detalle-actividad" element={<DetalleActividad />} />
          <Route path="parametros/detalle-calificacion" element={<DetalleCalificacion />} />
          <Route path="asignaciones" element={<Asignaciones />} />
          <Route path="asignaciones/detalle" element={<DetalleAsignacion />} />
          <Route path="promociones" element={<Promociones />} />
          <Route path="promociones/registrar" element={<RegistrarPromocion />} />
          <Route path="promociones/editar" element={<EditarPromocion />} />
          <Route path="promociones/detalle" element={<DetallePromocion />} />
          <Route path="promociones/registrar-vigencia" element={<RegistrarVigencia />} />
          <Route path="promociones/editar-vigencia" element={<EditarVigencia />} />
          <Route path="promociones/detalle-vigencia" element={<DetalleVigencia />} />
          <Route path="ubicaciones" element={<Ubicaciones />} />
          <Route path="ubicaciones/registrar-ciudad" element={<RegistrarCiudad />} />
          <Route path="ubicaciones/editar-ciudad" element={<EditarCiudad />} />
          <Route path="ubicaciones/detalle-ciudad" element={<DetalleCiudad />} />
          <Route path="ubicaciones/registrar-departamento" element={<RegistrarDepartamento />} />
          <Route path="ubicaciones/editar-departamento" element={<EditarDepartamento />} />
          <Route path="ubicaciones/detalle-departamento" element={<DetalleDepartamento />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="clientes/detalle" element={<DetalleCliente />} />
          <Route path="clientes/editar" element={<EditarCliente />} />
          <Route path="clientes/registrar" element={<RegistrarCliente />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
