import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext"; // Ajusta la ruta según tu estructura

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const getLinkClass = (path: string) => {
    const baseClass = "p-3 rounded-lg transition font-medium block";
    return location.pathname === path
      ? `${baseClass} bg-orange-600 text-white shadow-md shadow-orange-600/10`
      : `${baseClass} text-gray-300 hover:bg-gray-800 hover:text-white`;
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-5 flex flex-col justify-between sticky top-0">
      
      <div>
        <h1 className="text-2xl font-bold mb-10">CrujiSnacks</h1>

        <nav className="flex flex-col gap-3">
          <Link to="/admin/reservas" className={getLinkClass("/admin/reservas")}>
            📅 Reservas
          </Link>
          
          <Link to="/admin/toppings" className={getLinkClass("/admin/toppings")}>
            🍬 Toppings
          </Link>

          <Link to="/admin/paquetes" className={getLinkClass("/admin/paquetes")}>
            📦 Paquetes
          </Link>
        </nav>
      </div>

      <div className="flex flex-col gap-3 pt-5 border-t border-gray-800">
        <Link to="/admin/configuracion" className={getLinkClass("/admin/configuracion")}>
          ⚙️ Configuración
        </Link>

        <button
          onClick={handleLogout}
          className="p-3 rounded-lg text-left text-red-400 hover:bg-red-950/30 hover:text-red-300 transition font-medium block"
        >
          🚪 Cerrar Sesión
        </button>
      </div>

    </aside>
  );
};