import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { achatService, fournisseurService, produitService } from '../services/api';

export function PurchaseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const purchaseId = id ? parseInt(id, 10) : null;
  const [fournisseurs, setFournisseurs] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    fournisseur: '',
    montant_remise: 0,
    taux_tva: 20,
    items: [],
    notes: '',
  });
  const [newItem, setNewItem] = useState({
    produit_id: '',
    produit: null,
    quantite: 1,
    prix_unitaire: 0,
  });
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
    if (purchaseId) {
      loadPurchase();
    }
  }, [purchaseId]);

  const loadData = async () => {
    try {
      const [fournisseursData, productsData] = await Promise.all([
        fournisseurService.getAll(),
        produitService.getAll(),
      ]);
      setFournisseurs(fournisseursData.results || fournisseursData);
      setProducts(productsData.results || productsData);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadPurchase = async () => {
    try {
      setLoading(true);
      const purchase = await achatService.getById(purchaseId);
      setFormData({
        fournisseur: purchase.fournisseur,
        montant_remise: purchase.montant_remise,
        taux_tva: purchase.taux_tva,
        items: purchase.items.map(item => ({
          ...item,
          produit_id: item.produit,
          montant_total: item.quantite * item.prix_unitaire,
        })),
        notes: purchase.notes,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSearch = async (query) => {
    setProductSearch(query);
    if (query.length > 1) {
      try {
        const data = await produitService.getAll(1, query);
        setFilteredProducts(data.results || data);
        setShowSuggestions(true);
      } catch (err) {
        setFilteredProducts([]);
      }
    } else {
      setFilteredProducts([]);
      setShowSuggestions(false);
    }
  };

  const selectProduct = (product) => {
    setNewItem({
      ...newItem,
      produit_id: product.id.toString(),
      produit: product,
      prix_unitaire: product.prix_achat,
    });
    setProductSearch(`${product.nom} (${product.reference})`);
    setShowSuggestions(false);
  };

  const handleAddItem = () => {
    if (!newItem.produit_id || !newItem.quantite || !newItem.prix_unitaire) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const itemExists = formData.items.some(item => item.produit_id === parseInt(newItem.produit_id));
    if (itemExists) {
      alert('Ce produit est déjà dans la liste');
      return;
    }

    const newItemData = {
      ...newItem,
      produit_id: parseInt(newItem.produit_id),
      montant_total: newItem.quantite * newItem.prix_unitaire,
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItemData],
    });

    setNewItem({
      produit_id: '',
      produit: null,
      quantite: 1,
      prix_unitaire: 0,
    });
    setProductSearch('');
  };

  const handleRemoveItem = (idx) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fournisseur || formData.items.length === 0) {
      alert('Fournisseur et produits sont requis');
      return;
    }

    try {
      setLoading(true);
      const dataToSend = {
        fournisseur: formData.fournisseur,
        montant_remise: formData.montant_remise,
        taux_tva: formData.taux_tva,
        notes: formData.notes,
        statut: 'brouillon',
      };

      let purchase;
      if (purchaseId) {
        purchase = await achatService.update(purchaseId, dataToSend);
      } else {
        purchase = await achatService.create(dataToSend);
      }

      // Ajouter les articles
      for (const item of formData.items) {
        await achatService.ajouterItem(purchase.id, {
          produit_id: item.produit_id,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
        });
      }

      alert(purchaseId ? 'Achat modifié avec succès' : 'Achat créé avec succès');
      navigate('/achats');
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const montantHT = formData.items.reduce((sum, item) => sum + item.montant_total, 0) - parseFloat(formData.montant_remise);
  const montantTVA = montantHT * (parseFloat(formData.taux_tva) / 100);
  const montantTTC = montantHT + montantTVA;

  if (loading) return <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🛒 {purchaseId ? 'Modifier l\'achat' : 'Nouvel achat'}</h1>
              <p className="text-sm text-gray-500 mt-1">Gestion des achats de produits</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/achats')}
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
          {/* Supplier & Taxes Section */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">📋 Informations principales</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fournisseur *</label>
                <select
                  value={formData.fournisseur}
                  onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs.map(fournisseur => (
                    <option key={fournisseur.id} value={fournisseur.id}>
                      {fournisseur.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taux TVA (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.taux_tva}
                  onChange={(e) => setFormData({ ...formData, taux_tva: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">🛍️ Produits *</h2>

            {/* Search & Add Item */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    onFocus={() => setShowSuggestions(filteredProducts.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    placeholder="Rechercher produit..."
                  />
                  {showSuggestions && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto top-full mt-1">
                      {filteredProducts.map(product => (
                        <div
                          key={product.id}
                          onClick={() => selectProduct(product)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 text-sm"
                        >
                          <div className="font-medium text-gray-800">{product.nom}</div>
                          <div className="text-xs text-gray-500">{product.reference} • {product.prix_achat} DA</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Input Fields - Responsive Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quantité</label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.quantite}
                    onChange={(e) => setNewItem({ ...newItem, quantite: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    placeholder="Qté"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">P.U.</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.prix_unitaire}
                    onChange={(e) => setNewItem({ ...newItem, prix_unitaire: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    placeholder="Prix"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition h-[42px] flex items-center justify-center"
                  >
                    ➕
                  </button>
                </div>
              </div>
            </div>

            {/* Items Table - Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-3 text-left">Produit</th>
                    <th className="px-4 py-3 text-center">Quantité</th>
                    <th className="px-4 py-3 text-right">P.U. (DA)</th>
                    <th className="px-4 py-3 text-right">Total (DA)</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium">{item.produit?.nom}</td>
                      <td className="px-4 py-3 text-center">{item.quantite}</td>
                      <td className="px-4 py-3 text-right">{parseFloat(item.prix_unitaire).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">{item.montant_total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-600 hover:text-red-800 font-medium transition"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Items Cards - Mobile View */}
            <div className="sm:hidden space-y-3">
              {formData.items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-medium text-gray-800">{item.produit?.nom}</div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Quantité</div>
                      <div className="font-semibold">{item.quantite}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">P.U.</div>
                      <div className="font-semibold">{parseFloat(item.prix_unitaire).toFixed(2)} DA</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="font-semibold text-green-600">{item.montant_total.toFixed(2)} DA</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md border border-blue-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Résumé</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Montant HT:</span>
                <span className="font-semibold text-lg text-gray-900">{montantHT.toFixed(2)} DA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Remise:</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.montant_remise}
                  onChange={(e) => setFormData({ ...formData, montant_remise: e.target.value })}
                  className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">TVA ({formData.taux_tva}%):</span>
                <span className="font-semibold text-lg text-gray-900">{montantTVA.toFixed(2)} DA</span>
              </div>
              <div className="border-t-2 border-blue-200 pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Montant TTC:</span>
                <span className="text-2xl font-bold text-green-600">{montantTTC.toFixed(2)} DA</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 md:p-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">📝 Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              rows="3"
              placeholder="Ajouter des notes ou commentaires..."
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/achats')}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition"
            >
              ✕ Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>✅ Enregistrer</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
