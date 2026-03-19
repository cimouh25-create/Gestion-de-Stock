import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientService } from '../services/api';

export function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const clientId = id ? parseInt(id, 10) : null;
  const [formData, setFormData] = useState({
    nom: '',
    type_client: 'particulier',
    email: '',
    telephone: '',
    adresse: '',
    code_postal: '',
    ville: '',
    contact_principal: '',
    notes: '',
    est_actif: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (clientId) {
      loadClient();
    }
  }, [clientId]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const client = await clientService.getById(clientId);
      setFormData(client);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom) {
      alert('Le nom du client est requis');
      return;
    }

    try {
      setLoading(true);
      if (clientId) {
        await clientService.update(clientId, formData);
        alert('Client modifié avec succès');
      } else {
        await clientService.create(formData);
        alert('Client créé avec succès');
      }
      navigate('/clients');
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde du client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{clientId ? 'Modifier le client' : 'Nouveau client'}</h1>
        <button
          type="button"
          onClick={() => navigate('/clients')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Annuler
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

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
          <label className="block text-sm font-medium mb-1">Type de client</label>
          <select
            name="type_client"
            value={formData.type_client}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          >
            <option value="particulier">Particulier</option>
            <option value="entreprise">Entreprise</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contact principal</label>
        <input
          type="text"
          name="contact_principal"
          value={formData.contact_principal}
          onChange={handleChange}
          className="w-full border border-gray-300 px-3 py-2 rounded"
          placeholder="Nom de la personne de contact"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Adresse</label>
          <input
            type="text"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Code postal</label>
          <input
            type="text"
            name="code_postal"
            value={formData.code_postal}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ville</label>
        <input
          type="text"
          name="ville"
          value={formData.ville}
          onChange={handleChange}
          className="w-full border border-gray-300 px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full border border-gray-300 px-3 py-2 rounded"
          rows="3"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="est_actif"
          name="est_actif"
          checked={formData.est_actif}
          onChange={handleChange}
          className="w-4 h-4 border-gray-300 rounded"
        />
        <label htmlFor="est_actif" className="ml-2 text-sm">
          Client actif
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? (clientId ? 'Modification...' : 'Création...') : (clientId ? 'Modifier le client' : 'Créer le client')}
      </button>

      <button
        type="button"
        onClick={() => navigate('/clients')}
        className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500 mt-2"
      >
        Annuler
      </button>
    </form>
  </div>
  );
}
