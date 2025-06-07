import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Calendar,
  CreditCard,
  Bell,
  RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';

interface Order {
  id: string;
  producerName: string;
  customerName?: string;
  customerEmail?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  total: number;
  status: string;
  orderDate: string;
  pickupDate?: string;
  pickupPoint: string;
  notes?: string;
  paymentMethodId?: string;
  paymentIntentId?: string;
  paymentStatus?: string;
}

interface EnhancedOrderTrackingProps {
  userRole: 'customer' | 'producer';
}

const EnhancedOrderTracking: React.FC<EnhancedOrderTrackingProps> = ({ userRole }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [userRole]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ordersData = userRole === 'customer' 
        ? await api.orders.getCustomerOrders()
        : await api.orders.getProducerOrders();
      
      setOrders(ordersData);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.orders.updateStatus(orderId, newStatus);
      await loadOrders(); // Refresh to get updated data
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'en_attente': { 
        label: 'En attente', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        description: 'Commande en attente de traitement'
      },
      'preparee': { 
        label: 'En préparation', 
        color: 'bg-blue-100 text-blue-800',
        icon: Package,
        description: 'Commande en cours de préparation'
      },
      'prete': { 
        label: 'Prête', 
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        description: 'Commande prête pour le retrait'
      },
      'retiree': { 
        label: 'Retirée', 
        color: 'bg-gray-100 text-gray-800',
        icon: CheckCircle,
        description: 'Commande retirée avec succès'
      },
      'annulee': { 
        label: 'Annulée', 
        color: 'bg-red-100 text-red-800',
        icon: Clock,
        description: 'Commande annulée'
      }
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap['en_attente'];
  };

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    const statusMap = {
      'pending': { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      'paid': { label: 'Payé', color: 'bg-green-100 text-green-800' },
      'failed': { label: 'Échec', color: 'bg-red-100 text-red-800' },
      'refunded': { label: 'Remboursé', color: 'bg-blue-100 text-blue-800' }
    };
    
    const status = statusMap[paymentStatus as keyof typeof statusMap];
    if (!status) return null;
    
    return <Badge className={status.color}>{status.label}</Badge>;
  };

  const getAvailableStatusUpdates = (currentStatus: string) => {
    const statusFlow = {
      'en_attente': ['preparee'],
      'preparee': ['prete'],
      'prete': ['retiree'],
      'retiree': [],
      'annulee': []
    };
    
    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  const getStatusUpdateLabel = (status: string) => {
    const labels = {
      'preparee': 'Marquer en préparation',
      'prete': 'Marquer comme prête',
      'retiree': 'Marquer comme retirée'
    };
    
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Chargement des commandes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadOrders}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {userRole === 'customer' ? 'Mes Commandes' : 'Gestion des Commandes'}
        </h2>
        <Button
          onClick={refreshOrders}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune commande trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            const availableUpdates = getAvailableStatusUpdates(order.status);

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <StatusIcon className="w-5 h-5" />
                      Commande #{order.id.slice(-8)}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                      {order.paymentStatus && getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{statusInfo.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Commandé le {order.orderDate}</span>
                      </div>
                      {order.pickupDate && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Retrait prévu le {order.pickupDate}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{order.pickupPoint}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {userRole === 'producer' && order.customerName && (
                        <div>
                          <span className="text-sm font-medium">Client: </span>
                          <span className="text-sm">{order.customerName}</span>
                        </div>
                      )}
                      {userRole === 'customer' && (
                        <div>
                          <span className="text-sm font-medium">Producteur: </span>
                          <span className="text-sm">{order.producerName}</span>
                        </div>
                      )}
                      {order.paymentMethodId && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            Paiement: ****{order.paymentMethodId.slice(-4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="font-medium mb-2">Produits ({order.items.length})</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>{item.subtotal.toFixed(2)}€</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>{order.total.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div>
                      <h4 className="font-medium mb-1">Notes</h4>
                      <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                  )}

                  {/* Actions for Producer */}
                  {userRole === 'producer' && availableUpdates.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {availableUpdates.map((status) => (
                        <Button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {getStatusUpdateLabel(status)}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Status Alert for Customer */}
                  {userRole === 'customer' && order.status === 'prete' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Votre commande est prête pour le retrait !
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Rendez-vous à {order.pickupPoint} pour récupérer votre commande.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnhancedOrderTracking;
