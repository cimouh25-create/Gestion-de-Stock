import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menu = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/sales", label: "Ventes", icon: "📋" },
    { path: "/products", label: "Produits", icon: "📦" },
    { path: "/clients", label: "Clients", icon: "👥" },
    { path: "/fournisseurs", label: "Fournisseurs", icon: "💼" },
    { path: "/categories", label: "Catégories", icon: "📁" },
    { path: "/settings", label: "Paramètres", icon: "⚙️" },
  ];

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
        <div className="text-lg font-bold text-blue-600">Gestion Ventes</div>
        <div className="h-5 w-5" />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Desktop header */}
          <div className="hidden md:block p-6 text-xl font-bold text-blue-600 border-b">
            Gestion Ventes
          </div>

          {/* Mobile header */}
          <div className="md:hidden p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-blue-600">Gestion Ventes</div>
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
                onClick={() => setIsSidebarOpen(false)} // Close mobile menu on navigation
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
        <main className="flex-1 min-h-screen p-4 md:p-8 bg-gray-100 md:ml-0">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}