import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fournisseurService } from '../services/api';

export function FournisseurList() {
  const navigate = useNavigate();
  const [fournisseurs, setFournisseurs] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedFournisseurs, setSelectedFournisseurs] = useState([]);
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
    loadFournisseurs();
  }, [debouncedSearch]);

  const loadFournisseurs = async () => {
    try {
      setLoading(true);
      const data = await fournisseurService.getAll(1, debouncedSearch);
      setFournisseurs(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr ?')) {
      try {
        await fournisseurService.delete(id);
        setFournisseurs(fournisseurs.filter(f => f.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSelectFournisseur = (fournisseurId) => {
    setSelectedFournisseurs(prev =>
      prev.includes(fournisseurId)
        ? prev.filter(id => id !== fournisseurId)
        : [...prev, fournisseurId]
    );
  };

  const handleSelectAll = () => {
    setSelectedFournisseurs(prev =>
      prev.length === fournisseurs.length
        ? []
        : fournisseurs.map(fournisseur => fournisseur.id)
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedFournisseurs.length === 0) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedFournisseurs.length} fournisseur(s) ?`)) {
      try {
        await Promise.all(selectedFournisseurs.map(id => fournisseurService.delete(id)));
        setFournisseurs(fournisseurs.filter(f => !selectedFournisseurs.includes(f.id)));
        setSelectedFournisseurs([]);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💼 Fournisseurs</h1>
            <p className="text-sm text-gray-500 mt-1">{fournisseurs.length} fournisseur(s)</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {selectedFournisseurs.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                🗑️ Supprimer {selectedFournisseurs.length > 0 && `(${selectedFournisseurs.length})`}
              </button>
            )}
            <button
              onClick={() => navigate('/fournisseurs/new')}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              ➕ Nouveau
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <span className="text-red-600 text-lg">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-800">Erreur</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Rechercher un fournisseur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <th className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedFournisseurs.length === fournisseurs.length && fournisseurs.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded"
                  />
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Nom</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Email</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Téléphone</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Adresse</th>
                <th className="px-6 py-4 text-center font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fournisseurs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <span className="text-4xl">🏭</span>
                      <span>Aucun fournisseur trouvé</span>
                    </div>
                  </td>
                </tr>
              ) : (
                fournisseurs.map((fournisseur) => (
                  <tr key={fournisseur.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedFournisseurs.includes(fournisseur.id)}
                        onChange={() => handleSelectFournisseur(fournisseur.id)}
                        className="w-5 h-5 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{fournisseur.nom}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{fournisseur.email || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{fournisseur.telephone || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm line-clamp-2">{fournisseur.adresse || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => navigate(`/fournisseurs/${fournisseur.id}/edit`)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium"
                        >
                          ✏️ 
                        </button>
                        <button
                          onClick={() => handleDelete(fournisseur.id)}
                          className="px-3 py-1 text-red-600 hover:bg-red-100 rounded-lg transition font-medium"
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

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {fournisseurs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">🏭</span>
                <span>Aucun fournisseur trouvé</span>
              </div>
            </div>
          ) : (
            fournisseurs.map((fournisseur) => (
              <div key={fournisseur.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={selectedFournisseurs.includes(fournisseur.id)}
                    onChange={() => handleSelectFournisseur(fournisseur.id)}
                    className="w-5 h-5 rounded mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{fournisseur.nom}</h3>
                    <p className="text-xs text-gray-500">{fournisseur.email || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Téléphone</div>
                    <div className="font-semibold text-gray-800 truncate">{fournisseur.telephone || '-'}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Adresse</div>
                    <div className="font-semibold text-gray-800 line-clamp-1">{fournisseur.adresse ? fournisseur.adresse.substring(0, 20) + '...' : '-'}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/fournisseurs/${fournisseur.id}/edit`)}
                    className="flex-1 px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium text-sm"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(fournisseur.id)}
                    className="flex-1 px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition font-medium text-sm"
                  >
                    🗑️ Supprimer
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