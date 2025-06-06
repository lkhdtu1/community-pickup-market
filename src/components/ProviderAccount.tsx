import React, { useState } from 'react';
import { User, Package, BarChart3, Settings, LogOut, Store, ShoppingCart, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '@/lib/auth';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import ProducerAnalytics from './ProducerAnalytics';
import ProducerProfile from './ProducerProfile';

const ProviderAccount = () => {  const [activeTab, setActiveTab] = useState('dashboard');
  const [hasShop, setHasShop] = useState(true); // Changé à true pour montrer l'interface complète
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'products', label: 'Mes produits', icon: Package },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytiques', icon: TrendingUp },
    { id: 'profile', label: 'Profil boutique', icon: Store },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  // If no shop exists, show shop creation prompt
  if (!hasShop) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Bienvenue sur votre espace producteur</h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Pour commencer à vendre vos produits sur Local Market, vous devez d'abord créer votre boutique. 
            Cela ne prend que quelques minutes et vous permettra de présenter votre exploitation et vos produits aux clients.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Créez votre boutique</h3>
              <p className="text-sm text-gray-600">Présentez votre exploitation et votre savoir-faire</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Ajoutez vos produits</h3>
              <p className="text-sm text-gray-600">Mettez en ligne votre catalogue de produits</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Vendez en local</h3>
              <p className="text-sm text-gray-600">Connectez-vous avec les consommateurs locaux</p>
            </div>
          </div>

          <Link
            to="/create-shop"
            className="inline-flex items-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Store size={20} />
            <span>Créer ma boutique</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-6">
            <h1 className="text-2xl font-bold text-gray-900">Espace Producteur</h1>            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </div>
          
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Tableau de bord</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800">Ventes du mois</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">1,247 €</p>
                  <p className="text-sm text-green-600 mt-1">+12% par rapport au mois dernier</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800">Commandes actives</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">23</p>
                  <p className="text-sm text-blue-600 mt-1">En attente de retrait</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800">Produits actifs</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">12</p>
                  <p className="text-sm text-purple-600 mt-1">Produits en ligne</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-800">Clients fidèles</h3>
                  <p className="text-3xl font-bold text-orange-600 mt-2">18</p>
                  <p className="text-sm text-orange-600 mt-1">Clients réguliers</p>
                </div>
              </div>

              {/* Aperçu des commandes récentes */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4">Commandes récentes</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white p-4 rounded-lg">
                    <div>
                      <span className="font-medium">Commande #001 - Marie Dupont</span>
                      <p className="text-sm text-gray-600">2x Tomates bio, 1x Miel de lavande</p>
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-medium">21,00 €</span>
                      <p className="text-sm text-yellow-600">En attente</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-white p-4 rounded-lg">
                    <div>
                      <span className="font-medium">Commande #002 - Jean Martin</span>
                      <p className="text-sm text-gray-600">1x Tomates bio</p>
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-medium">4,50 €</span>
                      <p className="text-sm text-green-600">Prête</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('products')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium">Ajouter un produit</p>
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium">Gérer les commandes</p>
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium">Voir les statistiques</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'analytics' && <ProducerAnalytics />}
          {activeTab === 'profile' && <ProducerProfile />}

          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Paramètres</h3>
              <p className="text-gray-500 mb-6">Gérez vos préférences et paramètres de compte</p>
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Notifications par email</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Notifications SMS</span>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Boutique visible</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderAccount;
