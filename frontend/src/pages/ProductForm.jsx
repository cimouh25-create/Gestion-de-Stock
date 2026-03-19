import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { produitService, categorieService, fournisseurService } from '../services/api';

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const productId = id ? parseInt(id, 10) : null;
  const [formData, setFormData] = useState({
    nom: '',
    reference: '',
    description: '',
    categorie: '',
    fournisseur: '',
    prix_achat: '',
    prix_vente: '',
    quantite_en_stock: 0,
    seuil_alerte: 5,
    est_actif: true,
  });
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadOptions();
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadOptions = async () => {
    try {
      const [cats, fourn] = await Promise.all([
        categorieService.getAll(),
        fournisseurService.getAll(),
      ]);
      setCategories(cats.results || cats);
      setFournisseurs(fourn.results || fourn);
    } catch (err) {
      setError('Erreur lors du chargement des options');
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await produitService.getById(productId);
      setFormData(product);
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
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.reference) {
      alert('Le nom et la référence du produit sont requis');
      return;
    }

    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append('nom', formData.nom);
      submitData.append('reference', formData.reference);
      submitData.append('description', formData.description);
      submitData.append('categorie', formData.categorie || '');
      submitData.append('fournisseur', formData.fournisseur || '');
      submitData.append('prix_achat', formData.prix_achat);
      submitData.append('prix_vente', formData.prix_vente);
      submitData.append('quantite_en_stock', formData.quantite_en_stock);
      submitData.append('seuil_alerte', formData.seuil_alerte);
      submitData.append('est_actif', formData.est_actif);
      
      if (formData.image instanceof File) {
        submitData.append('image', formData.image);
      }

      if (productId) {
        await produitService.update(productId, submitData);
        alert('Produit modifié avec succès');
      } else {
        await produitService.create(submitData);
        alert('Produit créé avec succès');
      }
      navigate('/products');
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde du produit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{productId ? 'Modifier le produit' : 'Nouveau produit'}</h1>
        <button
          type="button"
          onClick={() => navigate('/products')}
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
          <label className="block text-sm font-medium mb-1">Référence *</label>
          <input
            type="text"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Image du produit</label>
        <div className="flex gap-4 items-start">
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 font-medium flex items-center gap-2"
            >
              📸 Importer une photo
            </button>
            {(imagePreview || (formData.image && typeof formData.image === 'string')) && (
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setFormData({ ...formData, image: null });
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
              >
                Supprimer la photo
              </button>
            )}
          </div>
          {(imagePreview || (formData.image && typeof formData.image === 'string')) && (
            <div className="w-32 h-32 flex-shrink-0">
              <img
                src={imagePreview || formData.image}
                alt="Preview"
                className="w-32 h-32 object-cover rounded border border-gray-300"
              />
            </div>
          )}
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Catégorie</label>
          <select
            name="categorie"
            value={formData.categorie}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nom}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fournisseur</label>
          <select
            name="fournisseur"
            value={formData.fournisseur}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          >
            <option value="">Sélectionner un fournisseur</option>
            {fournisseurs.map(fourn => (
              <option key={fourn.id} value={fourn.id}>{fourn.nom}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prix d'achat (DA)</label>
          <input
            type="number"
            name="prix_achat"
            value={formData.prix_achat}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Prix de vente (DA)</label>
          <input
            type="number"
            name="prix_vente"
            value={formData.prix_vente}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Quantité en stock</label>
          <input
            type="number"
            name="quantite_en_stock"
            value={formData.quantite_en_stock}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Seuil d'alerte</label>
          <input
            type="number"
            name="seuil_alerte"
            value={formData.seuil_alerte}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="est_actif"
          checked={formData.est_actif}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-sm font-medium">Produit actif</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? (productId ? 'Modification...' : 'Création...') : (productId ? 'Modifier le produit' : 'Créer le produit')}
      </button>

      <button
        type="button"
        onClick={() => navigate('/products')}
        className="w-full bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
      >
        Annuler
      </button>
    </form>
  </div>
  );
}