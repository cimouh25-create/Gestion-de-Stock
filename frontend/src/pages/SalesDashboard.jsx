import { useState, useEffect } from 'react';
import { venteService } from '../services/api';

export function SalesDashboard() {
  const [stats, setStats] = useState(null);
  const [jours, setJours] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, [jours]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await venteService.getStatistics(jours);
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Chargement...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tableau de bord des ventes</h2>
        <select
          value={jours}
          onChange={(e) => setJours(parseInt(e.target.value))}
          className="border border-gray-300 px-3 py-2 rounded"
        >
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">90 derniers jours</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: "Ventes",
            value: stats.total_ventes,
            color: "blue",
            icon: "📋",
          },
          {
            title: "Montant total",
            value: `${(stats.montant_total || 0).toFixed(2)} DA`,
            color: "green",
            icon: "💰",
          },
          {
            title: "Moyenne",
            value: `${(stats.montant_moyen || 0).toFixed(2)} DA`,
            color: "yellow",
            icon: "📊",
          },
          {
            title: "Clients",
            value: stats.clients_distincts,
            color: "purple",
            icon: "👥",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <h2 className="text-2xl font-bold">{card.value}</h2>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold mb-4">Ventes par statut</h3>
          <div className="space-y-2">
            {Object.entries(stats.par_statut).map(([statut, count]) => (
              <div key={statut} className="flex justify-between">
                <span className="capitalize">{statut}:</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold mb-4">Top clients</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats.par_client.map((client, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{client.client__nom}</span>
                <span className="font-semibold">{parseFloat(client.montant).toFixed(2)} DA</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
