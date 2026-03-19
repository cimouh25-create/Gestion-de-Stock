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

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
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

  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{saleId ? 'Modifier la vente' : 'Nouvelle vente'}</h1>
        <button
          type="button"
          onClick={() => navigate('/sales')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Annuler
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client *</label>
          <select
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            className="w-full border border-gray-300 px-3 py-2 rounded"
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
          <label className="block text-sm font-medium mb-1">Taux TVA (%)</label>
          <input
            type="number"
            step="0.01"
            value={formData.taux_tva}
            onChange={(e) => setFormData({ ...formData, taux_tva: e.target.value })}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.est_paye}
          onChange={(e) => setFormData({ ...formData, est_paye: e.target.checked })}
          className="mr-2"
        />
        <label className="text-sm font-medium">Vente payée</label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Produits *</label>
        <div className="space-y-2 mb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => handleProductSearch(e.target.value)}
                onFocus={() => setShowSuggestions(filteredProducts.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full border border-gray-300 px-2 py-2 rounded text-sm"
                placeholder="Rechercher produit par nom, référence..."
              />
              {showSuggestions && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b shadow-lg max-h-40 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => selectProduct(product)}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {product.nom} - {product.reference} - {product.prix_vente} DA
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="number"
              min="1"
              value={newItem.quantite}
              onChange={(e) => setNewItem({ ...newItem, quantite: e.target.value })}
              className="w-20 border border-gray-300 px-2 py-2 rounded text-sm"
              placeholder="Qté"
            />
            <input
              type="number"
              step="0.01"
              value={newItem.prix_unitaire}
              onChange={(e) => setNewItem({ ...newItem, prix_unitaire: e.target.value })}
              className="w-24 border border-gray-300 px-2 py-2 rounded text-sm"
              placeholder="Prix"
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Ajouter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Produit</th>
                <th className="border p-2 text-center">Quantité</th>
                <th className="border p-2 text-right">P.U.</th>
                <th className="border p-2 text-right">Total</th>
                <th className="border p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{item.produit?.nom}</td>
                  <td className="border p-2 text-center">{item.quantite}</td>
                  <td className="border p-2 text-right">{item.prix_unitaire} €</td>
                  <td className="border p-2 text-right font-semibold">{item.montant_total.toFixed(2)} €</td>
                  <td className="border p-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded space-y-2">
        <div className="flex justify-between">
          <span>Montant HT:</span>
          <span className="font-semibold">{montantHT.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Remise:</span>
          <input
            type="number"
            step="0.01"
            value={formData.montant_remise}
            onChange={(e) => setFormData({ ...formData, montant_remise: e.target.value })}
            className="w-24 border border-gray-300 px-2 py-1 rounded text-right"
          />
        </div>
        <div className="flex justify-between">
          <span>TVA ({formData.taux_tva}%):</span>
          <span className="font-semibold">{montantTVA.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Montant TTC:</span>
          <span className="text-green-600">{montantTTC.toFixed(2)} €</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full border border-gray-300 px-3 py-2 rounded"
          rows="3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? 'Enregistrement...' : 'Enregistrer la vente'}
      </button>

      <button
        type="button"
        onClick={() => navigate('/sales')}
        className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500 mt-2"
      >
        Annuler
      </button>
    </form>
  </div>
  );
}
