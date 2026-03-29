import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { achatService } from '../services/api';

export function PurchaseList() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadPurchases();
  }, [debouncedSearch, statut]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await achatService.getAll(1, debouncedSearch, statut);
      setPurchases(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPurchase = (purchaseId) => {
    setSelectedPurchases(prev =>
      prev.includes(purchaseId)
        ? prev.filter(id => id !== purchaseId)
        : [...prev, purchaseId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPurchases(prev =>
      prev.length === purchases.length
        ? []
        : purchases.map(purchase => purchase.id)
    );
  };

  const handleDeletePurchase = async (purchaseId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet achat ?')) {
      try {
        await achatService.delete(purchaseId);
        loadPurchases();
        setSelectedPurchases(prev => prev.filter(id => id !== purchaseId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPurchases.length === 0) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedPurchases.length} achat(s) ?`)) {
      try {
        await Promise.all(selectedPurchases.map(id => achatService.delete(id)));
        loadPurchases();
        setSelectedPurchases([]);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleReceive = async (purchaseId) => {
    try {
      await achatService.recevoir(purchaseId);
      loadPurchases();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirm = async (purchaseId) => {
    try {
      await achatService.confirmer(purchaseId);
      loadPurchases();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🛒 Achats</h1>
            <p className="text-sm text-gray-500 mt-1">{purchases.length} achat(s) trouvé(s)</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {selectedPurchases.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                🗑️ Supprimer {selectedPurchases.length > 0 && `(${selectedPurchases.length})`}
              </button>
            )}
            <button
              onClick={() => navigate('/achats/new')}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              ➕ Nouvel achat
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 Rechercher un achat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="">Tous les statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="confirmé">Confirmé</option>
              <option value="reçu">Reçu</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <th className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedPurchases.length === purchases.length && purchases.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded"
                  />
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">N° Achat</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Fournisseur</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Date</th>
                <th className="px-6 py-4 text-right font-semibold text-sm">Montant TTC</th>
                <th className="px-6 py-4 text-center font-semibold text-sm">Statut</th>
                <th className="px-6 py-4 text-center font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <span className="text-4xl">🛒</span>
                      <span>Aucun achat trouvé</span>
                    </div>
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedPurchases.includes(purchase.id)}
                        onChange={() => handleSelectPurchase(purchase.id)}
                        className="w-5 h-5 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{purchase.numero}</td>
                    <td className="px-6 py-4 text-gray-700 text-sm">{purchase.fournisseur_nom}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {purchase.date_achat ? new Date(purchase.date_achat).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600 text-sm">
                      {parseFloat(purchase.montant_ttc).toFixed(2)} DA
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        purchase.statut === 'reçu' ? 'bg-green-100 text-green-800' :
                        purchase.statut === 'confirmé' ? 'bg-blue-100 text-blue-800' :
                        purchase.statut === 'brouillon' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {purchase.statut === 'reçu' ? '✅ Reçu' :
                         purchase.statut === 'confirmé' ? '✔️ Confirmé' :
                         purchase.statut === 'brouillon' ? '📝 Brouillon' :
                         '❌ Annulé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center flex-wrap">
                        <button
                          onClick={() => navigate(`/achats/${purchase.id}/edit`)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium text-sm"
                        >
                          ✏️ 
                        </button>
                        {purchase.statut === 'brouillon' && (
                          <button
                            onClick={() => handleConfirm(purchase.id)}
                            className="px-3 py-1 text-green-600 hover:bg-green-100 rounded-lg transition font-medium text-sm"
                          >
                            ✔️ 
                          </button>
                        )}
                        {purchase.statut === 'confirmé' && (
                          <button
                            onClick={() => handleReceive(purchase.id)}
                            className="px-3 py-1 text-green-600 hover:bg-green-100 rounded-lg transition font-medium text-sm"
                          >
                            📦 
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePurchase(purchase.id)}
                          className="px-3 py-1 text-red-600 hover:bg-red-100 rounded-lg transition font-medium text-sm"
                        >
                          🗑️ 
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {purchases.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">🛒</span>
                <span>Aucun achat trouvé</span>
              </div>
            </div>
          ) : (
            purchases.map((purchase) => (
              <div key={purchase.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={selectedPurchases.includes(purchase.id)}
                    onChange={() => handleSelectPurchase(purchase.id)}
                    className="w-5 h-5 rounded mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{purchase.numero}</h3>
                    <p className="text-xs text-gray-500">{purchase.fournisseur_nom}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Date</div>
                    <div className="font-semibold text-gray-800">{purchase.date_achat ? new Date(purchase.date_achat).toLocaleDateString('fr-FR') : '-'}</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Montant</div>
                    <div className="font-semibold text-green-700">{parseFloat(purchase.montant_ttc).toFixed(2)} DA</div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    purchase.statut === 'reçu' ? 'bg-green-100 text-green-800' :
                    purchase.statut === 'confirmé' ? 'bg-blue-100 text-blue-800' :
                    purchase.statut === 'brouillon' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {purchase.statut === 'reçu' ? '✅ Reçu' :
                     purchase.statut === 'confirmé' ? '✔️ Confirmé' :
                     purchase.statut === 'brouillon' ? '📝 Brouillon' :
                     '❌ Annulé'}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/achats/${purchase.id}/edit`)}
                    className="w-full px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium text-sm"
                  >
                    ✏️ Modifier
                  </button>
                  {purchase.statut === 'brouillon' && (
                    <button
                      onClick={() => handleConfirm(purchase.id)}
                      className="w-full px-3 py-2 text-green-600 hover:bg-green-100 rounded-lg transition font-medium text-sm"
                    >
                      ✔️ Confirmer
                    </button>
                  )}
                  {purchase.statut === 'confirmé' && (
                    <button
                      onClick={() => handleReceive(purchase.id)}
                      className="w-full px-3 py-2 text-green-600 hover:bg-green-100 rounded-lg transition font-medium text-sm"
                    >
                      📦 Recevoir
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePurchase(purchase.id)}
                    className="w-full px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition font-medium text-sm"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
