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

  if (loading) return <div className="text-center py-4">Chargement...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Produits</h2>
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium"
            >
              🗑️ Supprimer ({selectedProducts.length})
            </button>
          )}
          <button
            onClick={() => navigate('/products/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
          >
            + Nouveau produit
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 pr-10 rounded"
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
      <div className="overflow-x-auto rounded-lg shadow-md bg-white">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <tr>
              <th className="px-3 md:px-6 py-4 text-center font-semibold text-xs md:text-sm">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm hidden md:table-cell">Image</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm">Nom</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm hidden md:table-cell">Référence</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm hidden md:table-cell">Description</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm hidden md:table-cell">Catégorie</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm">P. Achat</th>
              <th className="px-3 md:px-6 py-4 text-left font-semibold text-xs md:text-sm">P. Vente</th>
              <th className="px-3 md:px-6 py-4 text-center font-semibold text-xs md:text-sm">Stock</th>
              <th className="px-3 md:px-6 py-4 text-center font-semibold text-xs md:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">📦</span>
                    <span>Aucun produit trouvé</span>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-3 md:px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 md:px-6 py-4 hidden md:table-cell">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.nom} className="w-10 md:w-12 h-10 md:h-12 object-cover rounded-lg border border-gray-200" />
                    ) : (
                      <div className="w-10 md:w-12 h-10 md:h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs font-semibold">No img</div>
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-4 font-semibold text-gray-900 text-xs md:text-sm">{product.nom}</td>
                  <td className="px-3 md:px-6 py-4 text-gray-700 text-xs md:text-sm font-mono hidden md:table-cell">{product.reference}</td>
                  <td className="px-3 md:px-6 py-4 text-gray-600 text-xs md:text-sm line-clamp-2 hidden md:table-cell">{product.description}</td>
                  <td className="px-3 md:px-6 py-4 text-gray-700 text-xs md:text-sm hidden md:table-cell">{product.categorie_nom}</td>
                  <td className="px-3 md:px-6 py-4 text-gray-700 text-xs md:text-sm">{parseFloat(product.prix_achat).toFixed(2)} DA</td>
                  <td className="px-3 md:px-6 py-4 font-bold text-green-600 text-xs md:text-sm">{parseFloat(product.prix_vente).toFixed(2)} DA</td>
                  <td className="px-3 md:px-6 py-4 text-center">
                    <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                      product.quantite_en_stock > 10
                        ? 'bg-green-100 text-green-800'
                        : product.quantite_en_stock > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.quantite_en_stock}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-center space-x-1 md:space-x-2">
                    <button
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-150 text-xs md:text-sm font-medium"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-150 text-xs md:text-sm font-medium"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
