import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { venteService } from '../services/api';

const statutColors = {
  brouillon: 'bg-gray-100 text-gray-800',
  confirmée: 'bg-blue-100 text-blue-800',
  livrée: 'bg-green-100 text-green-800',
  annulée: 'bg-red-100 text-red-800',
};

export function SalesList() {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [statut, setStatut] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
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
  }, [statut, debouncedSearch, page]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await venteService.getAll(page, debouncedSearch, statut);
      setSales(data.results || []);
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Ventes</h2>
        <div className="flex gap-2">
          {selectedSales.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium"
            >
              🗑️ Supprimer ({selectedSales.length})
            </button>
          )}
          <button
            onClick={() => navigate('/sales/new')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
          >
            + Nouvelle vente
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 pr-10 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>
        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent md:w-auto w-full"
        >
          <option value="">Tous les statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="confirmée">Confirmée</option>
          <option value="livrée">Livrée</option>
          <option value="annulée">Annulée</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md bg-white">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <tr>
              <th className="px-3 md:px-6 py-4 text-center font-semibold text-xs md:text-sm">
                <input
                  type="checkbox"
                  checked={selectedSales.length === sales.length && sales.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                  aria-label="Sélectionner tout"
                />
              </th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm">N° Vente</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm">Client</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm hidden md:table-cell">Date</th>
              <th className="px-3 md:px-6 py-4 text-right font-semibold text-xs md:text-sm">Montant</th>
              <th className="px-3 md:px-6 py-4 text-center font-semibold text-xs md:text-sm hidden md:table-cell">Statut</th>
              <th className="px-3 md:px-6 py-4 text-center font-semibold text-xs md:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📄</span>
                      <span>Aucune vente trouvée</span>
                    </div>
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-blue-50 transition-colors duration-150 border-b border-gray-200">
                    <td className="px-3 md:px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedSales.includes(sale.id)}
                        onChange={() => handleSelectSale(sale.id)}
                        className="rounded"
                      />
                    </td>
                    <td className={`px-3 md:px-6 py-4 font-semibold text-xs md:text-sm ${!sale.est_paye ? 'text-red-600' : 'text-gray-900'}`}>
                      {sale.numero || '-'}
                    </td>

                    <td className="px-3 md:px-6 py-4 text-xs md:text-sm text-gray-700">
                      {sale.client_nom || 'Client inconnu'}
                    </td>

                    <td className="px-3 md:px-6 py-4 text-xs md:text-sm text-gray-600 hidden md:table-cell">
                      {sale.date_vente
                        ? new Date(sale.date_vente).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>

                    <td className="px-3 md:px-6 py-4 text-right font-bold text-green-600 text-xs md:text-sm">
                      {(sale.montant_ttc || 0)} DA
                    </td>

                    <td className="px-3 md:px-6 py-4 text-center hidden md:table-cell">
                      <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${statutColors[sale.statut] || 'bg-gray-100'}`}>
                        {sale.statut || 'N/A'}
                      </span>
                    </td>

                    <td className="px-3 md:px-6 py-4 text-center space-x-1 md:space-x-3">
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-150 text-xs md:text-sm font-medium"
                      >
                        🗑️
                      </button>

                      <button
                        onClick={() => navigate(`/sales/${sale.id}/edit`)}
                        className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors duration-150 text-xs md:text-sm font-medium"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
        </table>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            ←
          </button>

          <span className="px-4 py-2">{page}</span>

          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
