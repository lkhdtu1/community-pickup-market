import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Eye, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  items: { 
    id: number;
    productName: string; 
    quantity: number; 
    price: number 
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  pickupDate?: string;
  pickupPoint: string;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);
  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Load real orders from backend API
      const ordersData = await api.orders.getProducerOrders();
      
      // Transform backend data to match component interface
      const transformedOrders: Order[] = ordersData.map((order: any) => ({
        id: order.id,
        customerName: order.customerName || 
          (order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Client'),
        customerEmail: order.customerEmail || order.customer?.email || '',
        items: order.items?.map((item: any) => ({
          id: item.id,
          productName: item.productName || item.product?.name || 'Produit',
          quantity: item.quantity,
          price: parseFloat(item.price) || 0
        })) || [],
        total: parseFloat(order.total) || 0,
        status: order.status?.toLowerCase() === 'pending' ? 'pending' :
                order.status?.toLowerCase() === 'prepared' ? 'confirmed' :
                order.status?.toLowerCase() === 'ready' ? 'ready' :
                order.status?.toLowerCase() === 'picked_up' ? 'completed' :
                order.status?.toLowerCase() === 'cancelled' ? 'cancelled' : 'pending',
        createdAt: order.createdAt,
        pickupDate: order.pickupDate,
        pickupPoint: order.pickupPoint || 'Non spécifié'
      }));
      
      setOrders(transformedOrders);
      setError(null);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Erreur lors du chargement des commandes');
      
      // Fallback to empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', class: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Confirmée', class: 'bg-blue-100 text-blue-800' },
      ready: { label: 'Prête', class: 'bg-green-100 text-green-800' },
      completed: { label: 'Terminée', class: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Annulée', class: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-600" size={20} />;
      case 'confirmed': return <Package className="text-blue-600" size={20} />;
      case 'ready': return <CheckCircle className="text-green-600" size={20} />;
      case 'completed': return <CheckCircle className="text-gray-600" size={20} />;
      case 'cancelled': return <XCircle className="text-red-600" size={20} />;
      default: return <Clock className="text-gray-600" size={20} />;
    }
  };  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      // Map frontend status to backend status
      const backendStatus = newStatus === 'pending' ? 'en_attente' :
                          newStatus === 'confirmed' ? 'preparee' :
                          newStatus === 'ready' ? 'prete' :
                          newStatus === 'completed' ? 'retiree' :
                          newStatus === 'cancelled' ? 'annulee' : 'en_attente';
      
      await api.orders.updateStatus(orderId.toString(), backendStatus);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Erreur lors de la mise à jour du statut de la commande');
    }
  };
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestion des commandes</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestion des commandes</h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadOrders}
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
      <h2 className="text-2xl font-bold">Gestion des commandes</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Total commandes</p>
                <p className="text-xl font-bold">{orderStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="text-yellow-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-xl font-bold">{orderStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Prêtes</p>
                <p className="text-xl font-bold">{orderStats.ready}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-gray-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Complétées</p>
                <p className="text-xl font-bold">{orderStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>      {/* Liste des commandes */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Aucune commande trouvée.</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-semibold">Commande #{order.id}</h3>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-lg font-bold text-green-600 mt-1">{order.total.toFixed(2)} €</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium mb-2">Produits commandés:</h4>
                    <ul className="space-y-1">
                      {order.items.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {item.quantity}x {item.productName} - {(item.quantity * item.price).toFixed(2)} €
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-gray-500" />
                        <span className="text-sm">Point de retrait: {order.pickupPoint}</span>
                      </div>
                      <p className="text-sm text-gray-600">Commandé le: {new Date(order.createdAt).toLocaleDateString()}</p>
                      {order.pickupDate && (
                        <p className="text-sm text-gray-600">Retrait prévu: {new Date(order.pickupDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => {
                        console.log(`Attempting to update order ${order.id} to status 'confirmed'`);
                        updateOrderStatus(order.id, 'confirmed');
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Confirmer la commande
                    </Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Marquer comme prête
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      variant="outline"
                    >
                      Marquer comme retirée
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye size={14} />
                    Détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
