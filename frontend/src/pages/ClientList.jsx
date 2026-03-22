import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../services/api';

export function ClientList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Debounce (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadClients();
  }, [debouncedSearch]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll(1, debouncedSearch);
      setClients(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr ?')) {
      try {
        await clientService.delete(id);
        setClients(clients.filter(c => c.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSelectClient = (clientId) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    setSelectedClients(prev =>
      prev.length === clients.length
        ? []
        : clients.map(client => client.id)
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedClients.length === 0) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedClients.length} client(s) ?`)) {
      try {
        await Promise.all(selectedClients.map(id => clientService.delete(id)));
        setClients(clients.filter(c => !selectedClients.includes(c.id)));
        setSelectedClients([]);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">👥 Clients</h1>
            <p className="text-sm text-gray-600 mt-1">{clients.length} client(s) total</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {selectedClients.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="order-2 sm:order-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                🗑️ Supprimer ({selectedClients.length})
              </button>
            )}
            <button
              onClick={() => navigate('/clients/new')}
              className="order-1 sm:order-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              ➕ Nouveau client
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par nom, email, téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Table - Desktop & Tablet */}
        <div className="hidden sm:block bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedClients.length === clients.length && clients.length > 0}
                      onChange={handleSelectAll}
                      className="rounded cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Nom</th>
                  <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Type</th>
                  <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Téléphone</th>
                  <th className="px-4 py-3 text-center font-semibold">Statut</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-5xl">📭</span>
                        <span className="font-medium">Aucun client trouvé</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id)}
                          onChange={() => handleSelectClient(client.id)}
                          className="rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{client.nom}</td>
                      <td className="px-4 py-3 text-gray-600 hidden lg:table-cell text-sm">
                        {client.type_client === 'entreprise' ? '🏢 Entreprise' : '👤 Particulier'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden lg:table-cell text-sm">{client.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{client.telephone || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${client.est_actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {client.est_actif ? '✓ Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => navigate(`/clients/${client.id}/edit`)}
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition text-sm font-medium"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-sm font-medium"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards - Mobile */}
        <div className="sm:hidden space-y-4">
          {clients.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl">📭</span>
                <span className="font-medium text-gray-600">Aucun client trouvé</span>
              </div>
            </div>
          ) : (
            clients.map(client => (
              <div key={client.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => handleSelectClient(client.id)}
                        className="rounded cursor-pointer"
                      />
                      <h3 className="font-bold text-gray-900">{client.nom}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {client.type_client === 'entreprise' ? '🏢 Entreprise' : '👤 Particulier'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${client.est_actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {client.est_actif ? '✓' : '✗'}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  {client.email && <p>📧 {client.email}</p>}
                  {client.telephone && <p>☎️ {client.telephone}</p>}
                  {client.adresse && <p>📍 {client.adresse}</p>}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/clients/${client.id}/edit`)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded font-medium text-sm hover:bg-blue-200 transition"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded font-medium text-sm hover:bg-red-200 transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
