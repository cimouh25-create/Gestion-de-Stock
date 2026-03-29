import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categorieService } from '../services/api';

export function CategorieForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const categorieId = id ? parseInt(id, 10) : null;
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (categorieId) {
      loadCategorie();
    }
  }, [categorieId]);

  const loadCategorie = async () => {
    try {
      setLoading(true);
      const categorie = await categorieService.getById(categorieId);
      setFormData(categorie);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom) {
      alert('Le nom de la catégorie est requis');
      return;
    }

    try {
      setLoading(true);
      if (categorieId) {
        await categorieService.update(categorieId, formData);
        alert('Catégorie modifiée avec succès');
      } else {
        await categorieService.create(formData);
        alert('Catégorie créée avec succès');
      }
      navigate('/categories');
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde de la catégorie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">📂 {categorieId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h1>
              <p className="text-sm text-gray-500 mt-1">Gestion des catégories de produits</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              ✕ Fermer
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">📋 Informations</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la catégorie *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Ex: Électronique"
                required
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">📝 Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Décrivez cette catégorie..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition"
            >
              ✕ Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {categorieId ? 'Modification...' : 'Création...'}
                </>
              ) : (
                <>{categorieId ? '✏️ Modifier' : '✅ Créer'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}