import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fournisseurService } from '../services/api';

export function FournisseurForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fournisseurId = id ? parseInt(id, 10) : null;
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fournisseurId) {
      loadFournisseur();
    }
  }, [fournisseurId]);

  const loadFournisseur = async () => {
    try {
      setLoading(true);
      const fournisseur = await fournisseurService.getById(fournisseurId);
      setFormData(fournisseur);
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
      alert('Le nom du fournisseur est requis');
      return;
    }

    try {
      setLoading(true);
      if (fournisseurId) {
        await fournisseurService.update(fournisseurId, formData);
        alert('Fournisseur modifié avec succès');
      } else {
        await fournisseurService.create(formData);
        alert('Fournisseur créé avec succès');
      }
      navigate('/fournisseurs');
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde du fournisseur');
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🏭 {fournisseurId ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h1>
              <p className="text-sm text-gray-500 mt-1">Gestion des fournisseurs</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/fournisseurs')}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du fournisseur *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Ex: Fournisseur ABC"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📧 Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="contact@fournisseur.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📞 Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="+213 5XX XXX XXX"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">📍 Adresse</label>
              <textarea
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Adresse complète du fournisseur..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/fournisseurs')}
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
                  {fournisseurId ? 'Modification...' : 'Création...'}
                </>
              ) : (
                <>{fournisseurId ? '✏️ Modifier' : '✅ Créer'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}