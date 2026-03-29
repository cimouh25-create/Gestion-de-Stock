import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { produitService, categorieService, fournisseurService } from '../services/api';
import Quagga from '@ericblade/quagga2';

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const productId = id ? parseInt(id, 10) : null;
  const [formData, setFormData] = useState({
    nom: '',
    reference: '',
    barcode: '',
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
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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

  const startCameraScan = () => {
    setCameraError(null);

    if (!videoRef.current) {
      setCameraError("Caméra non disponible");
      return;
    }

    setScanning(true);

    Quagga.init({
      inputStream: {
        type: "LiveStream",
        target: videoRef.current,
        constraints: {
          facingMode: "environment", // caméra arrière
        },
      },
      decoder: {
        readers: [
          "ean_reader",
          "ean_8_reader",
          "code_128_reader",
          "code_39_reader",
          "upc_reader",
        ],
      },
      locate: true,
    }, (err) => {
      if (err) {
        console.error(err);
        setCameraError("Erreur initialisation caméra");
        setScanning(false);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((result) => {
      const code = result.codeResult.code;

      setFormData((prev) => ({
        ...prev,
        barcode: code,
      }));

      // 🔊 vibration mobile (optionnel)
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      stopCameraScan();
    });
  };

  const stopCameraScan = () => {
    try {
      Quagga.stop();
      Quagga.offDetected();
    } catch (e) {}
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCameraScan();
    };
  }, []);

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
      submitData.append('barcode', formData.barcode || '');
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
    <div className="w-full min-h-screen bg-gray-50 px-4 py-8 md:px-8 lg:px-0">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          {/* Header */}
          <div className="px-4 sm:px-6 md:px-8 py-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {productId ? '✏️ Modifier le produit' : '➕ Nouveau produit'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {productId ? 'Mettez à jour les informations du produit' : 'Créez un nouveau produit'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              title="Fermer"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-4 sm:px-6 md:px-8 py-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Image Upload */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-4">📸 Image du produit</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-2 sm:w-1/3">
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
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
                  >
                    📤 Importer une photo
                  </button>
                  {(imagePreview || (formData.image && typeof formData.image === 'string')) && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image: null });
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 font-medium rounded-lg transition"
                    >
                      🗑️ Supprimer la photo
                    </button>
                  )}
                </div>
                {(imagePreview || (formData.image && typeof formData.image === 'string')) && (
                  <div className="sm:w-2/3">
                    <img
                      src={imagePreview || formData.image}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Nom, Référence et Barcode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Ex: Laptop Dell XPS"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Référence *</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="Ex: DELL-XPS-13"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Barcode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    placeholder="Ex: 1234567890123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => scanning ? stopCameraScan() : startCameraScan()}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg text-white ${scanning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {scanning ? '🛑 Arrêter' : '📷 Scanner'}
                  </button>
                </div>
                {cameraError && <p className="text-xs text-red-600 mt-1">{cameraError}</p>}
                {scanning && (
                  <div className="mt-2">
                    <video
                      ref={videoRef}
                      className="w-full h-40 object-cover rounded-lg border border-gray-300"
                      muted
                      playsInline
                    />
                    <p className="text-xs text-gray-500 mt-1">Pointez un code-barres vers la caméra pour remplir automatiquement.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez votre produit..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              />
            </div>

            {/* Catégorie & Fournisseur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
                <select
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fournisseur</label>
                <select
                  name="fournisseur"
                  value={formData.fournisseur}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs.map(fourn => (
                    <option key={fourn.id} value={fourn.id}>{fourn.nom}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prix d'achat & Prix de vente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Prix d'achat (DA)</label>
                <input
                  type="number"
                  name="prix_achat"
                  value={formData.prix_achat}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Prix de vente (DA)</label>
                <input
                  type="number"
                  name="prix_vente"
                  value={formData.prix_vente}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Stock & Alerte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantité en stock</label>
                <input
                  type="number"
                  name="quantite_en_stock"
                  value={formData.quantite_en_stock}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Seuil d'alerte</label>
                <input
                  type="number"
                  name="seuil_alerte"
                  value={formData.seuil_alerte}
                  onChange={handleChange}
                  min="0"
                  placeholder="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
              <input
                type="checkbox"
                name="est_actif"
                checked={formData.est_actif}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <label className="font-medium text-gray-700 cursor-pointer">
                Produit actif
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition"
              >
                {loading ? (productId ? 'Modification...' : 'Création...') : (productId ? '✏️ Modifier' : '➕ Créer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}