import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venteService, clientService, produitService } from '../services/api';

export function SalesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const saleId = id ? parseInt(id, 10) : null;
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    client: '',
    montant_remise: 0,
    taux_tva: 20,
    est_paye: false,
    statut: 'brouillon',
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
    if (saleId) {
      loadSale();
    }
  }, [saleId]);

  const loadData = async () => {
    try {
      const [clientsData, productsData] = await Promise.all([
        clientService.getAll(),
        produitService.getAll(),
      ]);
      setClients(clientsData.results || clientsData);
      setProducts(productsData.results || productsData);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSale = async () => {
    try {
      setLoading(true);
      const sale = await venteService.getById(saleId);
      setFormData({
        client: sale.client.id,
        montant_remise: sale.montant_remise,
        taux_tva: sale.taux_tva,
        est_paye: sale.est_paye,
        statut: sale.statut,
        items: sale.items.map(item => ({
          ...item,
          produit_id: item.produit.id,
          produit: item.produit,
          montant_total: item.quantite * item.prix_unitaire,
        })),
        notes: sale.notes,
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
      prix_unitaire: product.prix_vente,
    });
    setProductSearch(`${product.nom} (${product.reference})`);
    setShowSuggestions(false);
  };

  const handleAddItem = () => {
    if (!newItem.produit_id || !newItem.produit) {
      alert('Veuillez sélectionner un produit');
      return;
    }
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          ...newItem,
          produit_id: parseInt(newItem.produit_id),
          produit: newItem.produit,
          montant_total: newItem.quantite * newItem.prix_unitaire,
        },
      ],
    });
    setNewItem({ produit_id: '', produit: null, quantite: 1, prix_unitaire: 0 });
    setProductSearch('');
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'confirmée' && formData.items.length === 0) {
      setError('Impossible de confirmer une vente sans produits');
      return;
    }
    if (newStatus === 'annulée' && window.confirm('Êtes-vous sûr de vouloir annuler cette vente ?')) {
      setFormData({ ...formData, statut: newStatus });
    } else if (newStatus !== 'annulée') {
      setFormData({ ...formData, statut: newStatus });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client) {
      setError('Veuillez sélectionner un client');
      return;
    }
    if (formData.items.length === 0) {
      setError('Veuillez ajouter au moins un produit');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = {
        client: formData.client,
        montant_remise: parseFloat(formData.montant_remise),
        taux_tva: parseFloat(formData.taux_tva),
        est_paye: formData.est_paye,
        statut: formData.statut,
        items: formData.items.map(item => ({
          produit_id: item.produit_id,
          quantite: parseInt(item.quantite),
          prix_unitaire: parseFloat(item.prix_unitaire),
        })),
        notes: formData.notes,
      };

      if (saleId) {
        await venteService.update(saleId, data);
      } else {
        const result = await venteService.create(data);
        console.log('Vente créée:', result);
      }

      navigate('/sales');
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de la vente');
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">💰 {saleId ? 'Modifier la vente' : 'Nouvelle vente'}</h1>
              <p className="text-sm text-gray-500 mt-1">Gestion des ventes et facturations</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  formData.statut === 'confirmée' ? 'bg-blue-100 text-blue-800' :
                  formData.statut === 'annulée' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {formData.statut === 'brouillon' ? 'Brouillon' : formData.statut === 'confirmée' ? 'Confirmée' : 'Annulée'}
                </span>
                {formData.est_paye && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                    Payée
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition flex items-center gap-2"
              >
                🖨️ Imprimer
              </button>
              <button
                type="button"
                onClick={() => navigate('/sales')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                ✕ Fermer
              </button>
            </div>
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
          {/* Client & Taxes Section */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">📋 Informations principales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
                <select
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="confirmée">Confirmée</option>
                  <option value="annulée">Annulée</option>
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

              <div className="flex items-end">
                <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition flex-1">
                  <input
                    type="checkbox"
                    checked={formData.est_paye}
                    onChange={(e) => setFormData({ ...formData, est_paye: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-offset-0"
                  />
                  <span className="font-medium text-gray-700">Vente payée</span>
                </label>
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
                          <div className="text-xs text-gray-500">{product.reference} • {product.prix_vente} DA</div>
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
              onClick={() => navigate('/sales')}
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

      {/* Print Layout - Hidden on screen, visible when printing */}
      <div className="print-only sales-order" style={{ display: 'none' }}>
        <div className="sales-order-header">
          <div className="sales-order-title">BON DE COMMANDE</div>
          <div>N° {saleId ? `V${String(saleId).padStart(4, '0')}` : 'NOUVELLE'}</div>
        </div>

        <div className="sales-order-info">
          <div><strong>Client:</strong> {clients.find(c => c.id == formData.client)?.nom || 'N/A'}</div>
          <div><strong>Date:</strong> {new Date().toLocaleDateString('fr-FR')}</div>
          <div><strong>Statut:</strong> {formData.statut === 'brouillon' ? 'Brouillon' : formData.statut === 'confirmée' ? 'Confirmée' : 'Annulée'}</div>
          {formData.est_paye && <div><strong>Payé:</strong> Oui</div>}
        </div>

        <div className="sales-order-items">
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th className="text-right">Qté</th>
                <th className="text-right">P.U.</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.produit?.nom}</td>
                  <td className="text-right">{item.quantite}</td>
                  <td className="text-right">{parseFloat(item.prix_unitaire).toFixed(2)}</td>
                  <td className="text-right">{item.montant_total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sales-order-totals">
          <div><span>Montant HT:</span> <span>{montantHT.toFixed(2)} DA</span></div>
          {parseFloat(formData.montant_remise) > 0 && (
            <div><span>Remise:</span> <span>-{parseFloat(formData.montant_remise).toFixed(2)} DA</span></div>
          )}
          <div><span>TVA ({formData.taux_tva}%):</span> <span>{montantTVA.toFixed(2)} DA</span></div>
          <div className="total"><span>Montant TTC:</span> <span>{montantTTC.toFixed(2)} DA</span></div>
        </div>

        {formData.notes && (
          <div className="sales-order-notes" style={{ marginTop: '15px' }}>
            <strong>Notes:</strong> {formData.notes}
          </div>
        )}

        <div className="sales-order-footer">
          Merci pour votre confiance !
        </div>
      </div>
    </div>
  );
}
