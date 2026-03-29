import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categorieService } from '../services/api';

export function CategorieList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
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
    loadCategories();
  }, [debouncedSearch]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categorieService.getAll(1, debouncedSearch);
      setCategories(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr ?')) {
      try {
        await categorieService.delete(id);
        setCategories(categories.filter(c => c.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCategories(prev =>
      prev.length === categories.length
        ? []
        : categories.map(category => category.id)
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedCategories.length === 0) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedCategories.length} catégorie(s) ?`)) {
      try {
        await Promise.all(selectedCategories.map(id => categorieService.delete(id)));
        setCategories(categories.filter(c => !selectedCategories.includes(c.id)));
        setSelectedCategories([]);
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
            <h1 className="text-3xl font-bold text-gray-900">📂 Catégories</h1>
            <p className="text-sm text-gray-500 mt-1">{categories.length} catégorie(s)</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {selectedCategories.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                🗑️ Supprimer {selectedCategories.length > 0 && `(${selectedCategories.length})`}
              </button>
            )}
            <button
              onClick={() => navigate('/categories/new')}
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
              placeholder="🔍 Rechercher une catégorie..."
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
                    checked={selectedCategories.length === categories.length && categories.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded"
                  />
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Nom</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Description</th>
                <th className="px-6 py-4 text-center font-semibold text-sm">Produits</th>
                <th className="px-6 py-4 text-center font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <span className="text-4xl">📂</span>
                      <span>Aucune catégorie trouvée</span>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((categorie) => (
                  <tr key={categorie.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(categorie.id)}
                        onChange={() => handleSelectCategory(categorie.id)}
                        className="w-5 h-5 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{categorie.nom}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm line-clamp-2">{categorie.description || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {categorie.nombre_produits || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => navigate(`/categories/${categorie.id}/edit`)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium"
                        >
                          ✏️ 
                        </button>
                        <button
                          onClick={() => handleDelete(categorie.id)}
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
          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">📂</span>
                <span>Aucune catégorie trouvée</span>
              </div>
            </div>
          ) : (
            categories.map((categorie) => (
              <div key={categorie.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(categorie.id)}
                    onChange={() => handleSelectCategory(categorie.id)}
                    className="w-5 h-5 rounded mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{categorie.nom}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{categorie.description || 'Pas de description'}</p>
                  </div>
                </div>

                <div className="mb-4 text-sm">
                  <div className="bg-blue-50 px-3 py-2 rounded inline-block">
                    <span className="text-xs text-gray-500">Produits: </span>
                    <span className="font-semibold text-blue-600">{categorie.nombre_produits || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/categories/${categorie.id}/edit`)}
                    className="flex-1 px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium text-sm"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(categorie.id)}
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