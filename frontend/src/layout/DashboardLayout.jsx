import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FiLogOut, FiSettings, FiUser, FiChevronDown } from "react-icons/fi";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menu = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/sales", label: "Ventes", icon: "💰" },
    { path: "/achats", label: "Achats", icon: "🛒" },
    { path: "/products", label: "Produits", icon: "📦" },
    { path: "/clients", label: "Clients", icon: "👥" },
    { path: "/fournisseurs", label: "Fournisseurs", icon: "💼" },
    { path: "/categories", label: "Catégories", icon: "📁" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      gestionnaire: "bg-blue-100 text-blue-800",
      lecteur: "bg-gray-100 text-gray-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile topbar */}
      <header className="flex items-center justify-between md:hidden bg-white shadow-sm p-4 border-b">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="text-gray-600 hover:text-gray-900 text-xl p-1"
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
        <div className="text-lg font-bold text-blue-600">Gestion de Stock</div>
        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="text-gray-600 hover:text-gray-900 p-1"
          aria-label="Menu profil"
        >
          <FiUser className="text-xl" />
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Desktop header */}
          <div className="hidden md:block p-6 text-lg font-bold text-blue-600 border-b">
            📊 Gestion de Stock
          </div>

          {/* Mobile header */}
          <div className="md:hidden p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-blue-600">Gestion de Stock</div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-600 hover:text-gray-900 p-1"
                aria-label="Fermer le menu"
              >
                ✕
              </button>
            </div>
          </div>

          <nav className="flex flex-col gap-1 p-4">
            {menu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `p-3 rounded-lg flex items-center gap-3 transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "hover:bg-gray-100 text-gray-700"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Info at bottom of sidebar - Desktop only */}
          {user && (
            <div className="hidden md:block absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className={`text-xs px-2 py-0.5 rounded-full w-fit ${getRoleColor(user.role)}`}>
                    {user.role === 'admin' && 'Administrateur'}
                    {user.role === 'gestionnaire' && 'Gestionnaire'}
                    {user.role === 'lecteur' && 'Lecteur'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Content */}
        <main className="flex-1 min-h-screen bg-gray-100 md:ml-0">
          {/* Top bar for desktop */}
          <div className="hidden md:flex items-center justify-between bg-white shadow-sm px-8 py-4 border-b">
            <div className="text-gray-600">
              {user && (
                <p className="text-sm">
                  Bienvenue, <span className="font-semibold text-gray-900">{user.first_name}</span>
                </p>
              )}
            </div>
            
            {/* Profile menu for desktop */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user.username}</p>
                  </div>
                  <FiChevronDown className={`text-gray-600 transition ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                    <div className="p-4 border-b">
                      <p className={`text-xs px-2 py-1 rounded-full w-fit font-semibold ${getRoleColor(user.role)}`}>
                        {user.role === 'admin' && 'Administrateur'}
                        {user.role === 'gestionnaire' && 'Gestionnaire'}
                        {user.role === 'lecteur' && 'Lecteur'}
                      </p>
                      {user.email && (
                        <p className="text-xs text-gray-600 mt-2">{user.email}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        // Navigate to profile settings if needed
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition"
                    >
                      <FiSettings className="text-gray-600" />
                      Paramètres du profil
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition border-t"
                    >
                      <FiLogOut className="text-red-600" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile profile menu */}
          {isProfileMenuOpen && (
            <div className="md:hidden bg-white border-b shadow-sm p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-600">{user?.username}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition font-medium"
              >
                <FiLogOut />
                Déconnexion
              </button>
            </div>
          )}

          {/* Page content */}
          <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}