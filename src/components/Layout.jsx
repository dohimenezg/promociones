import { Outlet, NavLink } from 'react-router-dom';
import { SlidersHorizontal, ClipboardList, Tag, MapPin, Users, ChevronDown } from 'lucide-react';

export default function Layout() {
  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">
          TELE-Iquitos
        </div>
        
        <div className="navbar-nav">
          <NavLink to="/parametros" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <SlidersHorizontal size={18} /> Parámetros
          </NavLink>
          <NavLink to="/asignaciones" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <ClipboardList size={18} /> Asignaciones
          </NavLink>
          <NavLink to="/promociones" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Tag size={18} /> Promociones
          </NavLink>
          <NavLink to="/ubicaciones" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <MapPin size={18} /> Ubicaciones
          </NavLink>
          <NavLink to="/clientes" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Users size={18} /> Clientes
          </NavLink>
        </div>

        <div className="user-profile">
          <div className="user-avatar"></div>
          <ChevronDown size={16} color="white" />
        </div>
      </nav>

      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}
