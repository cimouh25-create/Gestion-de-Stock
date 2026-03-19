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
    <div className="max-w-3xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{categorieId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h1>
        <button
          type="button"
          onClick={() => navigate('/categories')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Annuler
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">Nom *</label>
        <input
          type="text"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? (categorieId ? 'Modification...' : 'Création...') : (categorieId ? 'Modifier la catégorie' : 'Créer la catégorie')}
      </button>

      <button
        type="button"
        onClick={() => navigate('/categories')}
        className="w-full bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 mt-2"
      >
        Annuler
      </button>
    </form>
  </div>
  );
}