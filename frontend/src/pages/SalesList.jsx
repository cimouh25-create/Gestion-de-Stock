import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { venteService } from '../services/api';

const statutColors = {
  brouillon: 'bg-gray-100 text-gray-800',
  confirmée: 'bg-blue-100 text-blue-800',
  annulée: 'bg-red-100 text-red-800',
};

export function SalesList() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [statut, setStatut] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSales, setSelectedSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Debounce (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadSales();
  }, [debouncedSearch, statut]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await venteService.getAll(1, debouncedSearch, statut);
      setSales(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSale = (saleId) => {
    setSelectedSales(prev =>
      prev.includes(saleId)
        ? prev.filter(id => id !== saleId)
        : [...prev, saleId]
    );
  };

  const handleSelectAll = () => {
    setSelectedSales(prev =>
      prev.length === sales.length
        ? []
        : sales.map(sale => sale.id)
    );
  };

  const handleDeleteSale = async (saleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
      try {
        await venteService.delete(saleId);
        loadSales();
        setSelectedSales(prev => prev.filter(id => id !== saleId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSales.length === 0) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedSales.length} vente(s) ?`)) {
      try {
        await Promise.all(selectedSales.map(id => venteService.delete(id)));
        loadSales();
        setSelectedSales([]);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleValidateSale = async (saleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir valider cette vente ?')) {
      try {
        await venteService.valider(saleId);
        loadSales();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCancelSale = async (saleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette vente ?')) {
      try {
        await venteService.annuler(saleId);
        loadSales();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💰 Ventes</h1>
            <p className="text-sm text-gray-500 mt-1">{sales.length} vente(s) trouvée(s)</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {selectedSales.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                🗑️ Supprimer {selectedSales.length > 0 && `(${selectedSales.length})`}
              </button>
            )}
            <button
              onClick={() => navigate('/sales/new')}
              className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              ➕ Nouvelle
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
                placeholder="🔍 Rechercher une vente..."
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
              <option value="confirmée">Confirmée</option>
              <option value="annulée">Annulée</option>
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
                    checked={selectedSales.length === sales.length && sales.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded"
                  />
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">N°</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Client</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Date</th>
                <th className="px-6 py-4 text-center font-semibold text-sm">Statut</th>
                <th className="px-6 py-4 text-right font-semibold text-sm">Montant</th>
                <th className="px-6 py-4 text-center font-semibold text-sm">Payée</th>
                <th className="px-6 py-4 text-center font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <span className="text-4xl">📄</span>
                      <span>Aucune vente trouvée</span>
                    </div>
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedSales.includes(sale.id)}
                        onChange={() => handleSelectSale(sale.id)}
                        className="w-5 h-5 rounded"
                      />
                    </td>
                    <td className={`px-6 py-4 font-semibold text-sm ${!sale.est_paye ? 'text-orange-600' : 'text-gray-900'}`}>
                      {sale.numero || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">{sale.client_nom || 'Client inconnu'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {sale.date_vente ? new Date(sale.date_vente).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statutColors[sale.statut] || 'bg-gray-100 text-gray-800'}`}>
                        {sale.statut ? sale.statut.charAt(0).toUpperCase() + sale.statut.slice(1) : 'Inconnu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600 text-sm">
                      {parseFloat(sale.montant_ttc || 0).toFixed(2)} DA
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${sale.est_paye ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {sale.est_paye ? '✅ Payée' : '⏳ Impayée'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        {sale.statut === 'brouillon' && (
                          <button
                            onClick={() => handleValidateSale(sale.id)}
                            className="px-3 py-1 text-green-600 hover:bg-green-100 rounded-lg transition font-medium"
                            title="Valider"
                          >
                            ✔️
                          </button>
                        )}
                        {sale.statut === 'confirmée' && (
                          <button
                            onClick={() => handleCancelSale(sale.id)}
                            className="px-3 py-1 text-red-600 hover:bg-red-100 rounded-lg transition font-medium"
                            title="Annuler"
                          >
                            ✖️
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/sales/${sale.id}/edit`)}
                          className="px-3 py-1 text-orange-600 hover:bg-orange-100 rounded-lg transition font-medium"
                        >
                          ✏️ 
                        </button>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="px-3 py-1 text-red-600 hover:bg-red-100 rounded-lg transition font-medium"
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
          {sales.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">📄</span>
                <span>Aucune vente trouvée</span>
              </div>
            </div>
          ) : (
            sales.map((sale) => (
              <div key={sale.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={selectedSales.includes(sale.id)}
                    onChange={() => handleSelectSale(sale.id)}
                    className="w-5 h-5 rounded mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${!sale.est_paye ? 'text-orange-600' : 'text-gray-900'}`}>
                      {sale.numero || 'N/A'}
                    </h3>
                    <p className="text-xs text-gray-500">{sale.client_nom || 'Client inconnu'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Date</div>
                    <div className="font-semibold text-gray-800">{sale.date_vente ? new Date(sale.date_vente).toLocaleDateString('fr-FR') : '-'}</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Montant</div>
                    <div className="font-semibold text-green-700">{parseFloat(sale.montant_ttc || 0).toFixed(2)} DA</div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${sale.est_paye ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {sale.est_paye ? '✅ Payée' : '⏳ Impayée'}
                  </span>
                  <span className={`inline-block ml-2 px-2 py-1 rounded-full text-xs font-semibold ${statutColors[sale.statut] || 'bg-gray-100 text-gray-800'}`}>
                    {sale.statut ? sale.statut.charAt(0).toUpperCase() + sale.statut.slice(1) : ''}
                  </span>
                </div>

                <div className="flex gap-2">
                  {sale.statut === 'brouillon' && (
                    <button
                      onClick={() => handleValidateSale(sale.id)}
                      className="flex-1 px-3 py-2 text-green-600 hover:bg-green-100 rounded-lg transition font-medium text-sm"
                    >
                      ✔️ Valider
                    </button>
                  )}
                  {sale.statut === 'confirmée' && (
                    <button
                      onClick={() => handleCancelSale(sale.id)}
                      className="flex-1 px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition font-medium text-sm"
                    >
                      ✖️ Annuler
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/sales/${sale.id}/edit`)}
                    className="flex-1 px-3 py-2 text-orange-600 hover:bg-orange-100 rounded-lg transition font-medium text-sm"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteSale(sale.id)}
                    className="flex-1 px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition font-medium text-sm"
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
