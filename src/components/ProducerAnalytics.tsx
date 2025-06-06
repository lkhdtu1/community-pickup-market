
import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api } from '@/lib/api';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  customerCount: number;
  revenueGrowth: number;
  ordersGrowth: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
}

const ProducerAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.orders.getOrderStatistics();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Analytiques et rapports</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Analytiques et rapports</h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error || 'Aucune donnée disponible'}</p>
          <button 
            onClick={loadAnalytics}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytiques et rapports</h2>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventes ce mois</p>                <p className="text-2xl font-bold">{analytics.totalRevenue.toFixed(2)} €</p>
                <p className={`text-xs mt-1 ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}% vs mois dernier
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>                <p className="text-sm font-medium text-gray-600">Commandes</p>
                <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                <p className={`text-xs mt-1 ${analytics.ordersGrowth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {analytics.ordersGrowth >= 0 ? '+' : ''}{analytics.ordersGrowth.toFixed(1)}% vs mois dernier
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>                <p className="text-sm font-medium text-gray-600">Panier moyen</p>
                <p className="text-2xl font-bold">{analytics.averageOrderValue.toFixed(2)} €</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>                <p className="text-sm font-medium text-gray-600">Clients actifs</p>
                <p className="text-2xl font-bold">{analytics.customerCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des ventes</CardTitle>
          </CardHeader>
          <CardContent>            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nombre de commandes</CardTitle>
          </CardHeader>
          <CardContent>            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top produits */}
      <Card>
        <CardHeader>
          <CardTitle>Produits les plus vendus</CardTitle>
        </CardHeader>
        <CardContent>          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={product.productName} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="font-medium">{product.productName}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (product.revenue / Math.max(...analytics.topProducts.map(p => p.revenue))) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{product.revenue.toFixed(2)} €</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prochains objectifs */}
      <Card>
        <CardHeader>
          <CardTitle>Objectifs du mois</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Objectif de ventes: 1,500 €</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '83%' }}></div>
                </div>
                <span className="text-sm font-medium">83%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Objectif commandes: 30</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '77%' }}></div>
                </div>
                <span className="text-sm font-medium">77%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProducerAnalytics;
