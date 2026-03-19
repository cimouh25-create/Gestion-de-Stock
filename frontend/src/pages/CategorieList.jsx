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

  if (loading) return <div className="text-center py-4">Chargement...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Catégories</h2>
        <div className="flex gap-2">
          {selectedCategories.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium"
            >
              🗑️ Supprimer ({selectedCategories.length})
            </button>
          )}
          <button
            onClick={() => navigate('/categories/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
          >
            + Nouvelle catégorie
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
        <table className="w-full min-w-[600px]">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <tr>
              <th className="px-3 md:px-6 py-4 text-center font-semibold text-xs md:text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategories.length === categories.length && categories.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm">Nom</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm hidden md:table-cell">Description</th>
              <th className="px-3 md:px-6 py-4 text-center font-semibold text-xs md:text-sm">Produits</th>
              <th className="px-3 md:px-6 py-4 text-center font-semibold text-xs md:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">📂</span>
                    <span>Aucune catégorie trouvée</span>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((categorie) => (
                <tr key={categorie.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-3 md:px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(categorie.id)}
                      onChange={() => handleSelectCategory(categorie.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 md:px-6 py-4 font-semibold text-gray-900 text-xs md:text-sm">{categorie.nom}</td>
                  <td className="px-3 md:px-6 py-4 text-gray-600 text-xs md:text-sm line-clamp-2 hidden md:table-cell">{categorie.description}</td>
                  <td className="px-3 md:px-6 py-4 text-center">
                    <span className="inline-block px-2 md:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {categorie.nombre_produits}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-center space-x-1 md:space-x-2">
                    <button
                      onClick={() => navigate(`/categories/${categorie.id}/edit`)}
                      className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-150 text-xs md:text-sm font-medium"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(categorie.id)}
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