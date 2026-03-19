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
    <div className="max-w-3xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{fournisseurId ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h1>
        <button
          type="button"
          onClick={() => navigate('/fournisseurs')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Annuler
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Adresse</label>
        <textarea
          name="adresse"
          value={formData.adresse}
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
        {loading ? (fournisseurId ? 'Modification...' : 'Création...') : (fournisseurId ? 'Modifier le fournisseur' : 'Créer le fournisseur')}
      </button>

      <button
        type="button"
        onClick={() => navigate('/fournisseurs')}
        className="w-full bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 mt-2"
      >
        Annuler
      </button>
    </form>
  </div>
  );
}