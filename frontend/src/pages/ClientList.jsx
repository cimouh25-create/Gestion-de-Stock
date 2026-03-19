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

  if (loading) return <div className="text-center py-4">Chargement...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Clients</h2>
        <div className="flex gap-2">
          {selectedClients.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium"
            >
              🗑️ Supprimer ({selectedClients.length})
            </button>
          )}
          <button
            onClick={() => navigate('/clients/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
          >
            + Nouveau client
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 pr-10 rounded"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md bg-white">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <tr>
              <th className="px-3 md:px-6 py-4 text-center font-semibold text-xs md:text-sm">
                <input
                  type="checkbox"
                  checked={selectedClients.length === clients.length && clients.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm">Nom</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm hidden md:table-cell">Type</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm hidden md:table-cell">Email</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm">Téléphone</th>
              <th className="px-3 md:px-6 py-4 text-center font-semibold text-xs md:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clients.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">👥</span>
                    <span>Aucun client trouvé</span>
                  </div>
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-3 md:px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => handleSelectClient(client.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 md:px-6 py-4 font-semibold text-gray-900 text-xs md:text-sm">{client.nom}</td>
                  <td className="px-3 md:px-6 py-4 text-gray-600 text-xs md:text-sm hidden md:table-cell">
                    <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                      client.type_client === 'entreprise'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {client.type_client}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-gray-600 text-xs md:text-sm hidden md:table-cell">{client.email}</td>
                  <td className="px-3 md:px-6 py-4 text-gray-600 text-xs md:text-sm">{client.telephone}</td>
                  <td className="px-3 md:px-6 py-4 text-center space-x-1 md:space-x-2">
                    <button
                      onClick={() => navigate(`/clients/${client.id}/edit`)}
                      className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-150 text-xs md:text-sm font-medium"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-150 text-xs md:text-sm font-medium"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
