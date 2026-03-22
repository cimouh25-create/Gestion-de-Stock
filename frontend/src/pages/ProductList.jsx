import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { produitService } from '../services/api';

export function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
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
    loadProducts();
  }, [debouncedSearch]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await produitService.getAll(1, debouncedSearch);
      setProducts(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr ?')) {
      try {
        await produitService.delete(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProducts(prev =>
      prev.length === products.length
        ? []
        : products.map(product => product.id)
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedProducts.length} produit(s) ?`)) {
      try {
        await Promise.all(selectedProducts.map(id => produitService.delete(id)));
        setProducts(products.filter(p => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">📦 Produits</h1>
            <p className="text-sm text-gray-600 mt-1">{products.length} produit(s) total</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {selectedProducts.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="order-2 sm:order-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                🗑️ Supprimer ({selectedProducts.length})
              </button>
            )}
            <button
              onClick={() => navigate('/products/new')}
              className="order-1 sm:order-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              ➕ Nouveau produit
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par nom, référence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Table - Desktop & Tablet */}
        <div className="hidden sm:block bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={handleSelectAll}
                      className="rounded cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Image</th>
                  <th className="px-4 py-3 text-left font-semibold">Nom</th>
                  <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Référence</th>
                  <th className="px-4 py-3 text-center font-semibold text-sm">Prix Achat</th>
                  <th className="px-4 py-3 text-center font-semibold text-sm">Prix Vente</th>
                  <th className="px-4 py-3 text-center font-semibold">Stock</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-5xl">📭</span>
                        <span className="font-medium">Aucun produit trouvé</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.nom} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">📷</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">{product.nom}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm font-mono hidden lg:table-cell">{product.reference}</td>
                      <td className="px-4 py-3 text-gray-700 text-sm text-center">{parseFloat(product.prix_achat).toFixed(2)} DA</td>
                      <td className="px-4 py-3 font-bold text-green-600 text-sm text-center">{parseFloat(product.prix_vente).toFixed(2)} DA</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          product.quantite_en_stock > 10
                            ? 'bg-green-100 text-green-800'
                            : product.quantite_en_stock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.quantite_en_stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition text-sm font-medium"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-sm font-medium"
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
        </div>

        {/* Cards - Mobile */}
        <div className="sm:hidden space-y-4">
          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl">📭</span>
                <span className="font-medium text-gray-600">Aucun produit trouvé</span>
              </div>
            </div>
          ) : (
            products.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded cursor-pointer"
                      />
                      <h3 className="font-bold text-gray-900">{product.nom}</h3>
                    </div>
                    <p className="text-xs text-gray-500">{product.reference}</p>
                  </div>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.nom} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-2xl">📷</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Prix Achat</p>
                    <p className="font-semibold text-gray-900">{parseFloat(product.prix_achat).toFixed(2)} DA</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Prix Vente</p>
                    <p className="font-bold text-green-600">{parseFloat(product.prix_vente).toFixed(2)} DA</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Stock</p>
                    <p className={`font-semibold ${
                      product.quantite_en_stock > 10 ? 'text-green-600' :
                      product.quantite_en_stock > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {product.quantite_en_stock} unités
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Statut</p>
                    <p className={`font-semibold text-sm ${product.est_actif ? 'text-blue-600' : 'text-gray-400'}`}>
                      {product.est_actif ? '✓ Actif' : '✗ Inactif'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded font-medium text-sm hover:bg-blue-200 transition"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded font-medium text-sm hover:bg-red-200 transition"
                  >
                    Supprimer
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
