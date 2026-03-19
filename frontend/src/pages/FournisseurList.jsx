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

  if (loading) return <div className="text-center py-4">Chargement...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Fournisseurs</h2>
        <div className="flex gap-2">
          {selectedFournisseurs.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium"
            >
              🗑️ Supprimer ({selectedFournisseurs.length})
            </button>
          )}
          <button
            onClick={() => navigate('/fournisseurs/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
          >
            + Nouveau fournisseur
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
                  checked={selectedFournisseurs.length === fournisseurs.length && fournisseurs.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm">Nom</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm hidden md:table-cell">Email</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm">Téléphone</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm hidden md:table-cell">Adresse</th>
              <th className="px-3 md:px-6 py-4 text-center font-semibold text-xs md:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fournisseurs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">🏭</span>
                    <span>Aucun fournisseur trouvé</span>
                  </div>
                </td>
              </tr>
            ) : (
              fournisseurs.map((fournisseur) => (
                <tr key={fournisseur.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-3 md:px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedFournisseurs.includes(fournisseur.id)}
                      onChange={() => handleSelectFournisseur(fournisseur.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 md:px-6 py-4 font-semibold text-gray-900 text-xs md:text-sm">{fournisseur.nom}</td>
                  <td className="px-3 md:px-6 py-4 text-gray-600 text-xs md:text-sm hidden md:table-cell">{fournisseur.email}</td>
                  <td className="px-3 md:px-6 py-4 text-gray-600 text-xs md:text-sm">{fournisseur.telephone}</td>
                  <td className="px-3 md:px-6 py-4 text-gray-600 text-xs md:text-sm text-xs line-clamp-2 hidden md:table-cell">{fournisseur.adresse}</td>
                  <td className="px-3 md:px-6 py-4 text-center space-x-1 md:space-x-2">
                    <button
                      onClick={() => navigate(`/fournisseurs/${fournisseur.id}/edit`)}
                      className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-150 text-xs md:text-sm font-medium"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(fournisseur.id)}
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