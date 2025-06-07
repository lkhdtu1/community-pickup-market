import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, Settings, LogOut, Edit2, CreditCard, Bell, Shield, Gift, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/lib/auth';
import { api } from '@/lib/api';
import EnhancedOrderTracking from './EnhancedOrderTracking';

interface CustomerProfile {
  id: string;  // UUID string from backend
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  preferences?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  cardLastFour: string;
  cardBrand: string;
  expiryMonth: string;
  holderName?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Address {
  id: string;
  type: string;
  street: string;
  street2?: string;
  city: string;
  postalCode: string;
  country: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const CustomerAccount = () => {  const [activeTab, setActiveTab] = useState('profil');
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<CustomerProfile | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [preferences, setPreferences] = useState({
    notifications: true,
    newsletter: true,
    sms: false,
    emailPromotions: true
  });

  useEffect(() => {
    loadCustomerData();
  }, []);  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const [profile, customerPaymentMethods, customerAddresses] = await Promise.all([
        api.customers.getProfile(),
        api.customers.getPaymentMethods(),
        api.customers.getAddresses()
      ]);
      setProfileData(profile);
      setPaymentMethods(customerPaymentMethods);
      setAddresses(customerAddresses);
      setError(null);
    } catch (err) {
      console.error('Error loading customer data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };const updateProfile = async (updatedData: Partial<CustomerProfile>) => {
    try {
      const updated = await api.customers.updateProfile(updatedData);
      setProfileData(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      // TODO: Show error message to user
    }
  };

  // Payment method handlers
  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      await api.customers.updatePaymentMethod(paymentMethodId, { isDefault: true });
      await loadCustomerData(); // Refresh data
    } catch (err) {
      console.error('Error setting default payment method:', err);
      setError('Erreur lors de la mise à jour du moyen de paiement');
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?')) {
      return;
    }
    
    try {
      await api.customers.deletePaymentMethod(paymentMethodId);
      await loadCustomerData(); // Refresh data
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setError('Erreur lors de la suppression du moyen de paiement');
    }
  };

  // Address handlers
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddAddress(true);
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await api.customers.updateAddress(addressId, { isDefault: true });
      await loadCustomerData(); // Refresh data
    } catch (err) {
      console.error('Error setting default address:', err);
      setError('Erreur lors de la mise à jour de l\'adresse');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      return;
    }
    
    try {
      await api.customers.deleteAddress(addressId);
      await loadCustomerData(); // Refresh data
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Erreur lors de la suppression de l\'adresse');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Erreur lors du chargement du profil'}</p>
          <button 
            onClick={loadCustomerData}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-4"
          >
            Réessayer
          </button>
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }
  const handleSaveProfile = async () => {
    if (!profileData) return;
    
    try {
      await updateProfile(profileData);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Erreur lors de la sauvegarde du profil');
    }
  };  const handleRateOrder = (orderId: string, rating: number) => {
    console.log(`Commande ${orderId} notée: ${rating}/5`);
  };
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'profil', label: 'Mon Profil', icon: User },
    { id: 'commandes', label: 'Mes Commandes', icon: Package },
    { id: 'adresses', label: 'Mes Adresses', icon: MapPin },
    { id: 'paiement', label: 'Paiement', icon: CreditCard },
    { id: 'fidelite', label: 'Fidélité', icon: Gift },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'parametres', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Add Payment Method Modal */}
      {showAddPaymentMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Ajouter un moyen de paiement</h3>            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              
              // Extract card info
              const cardNumber = (formData.get('cardNumber') as string)?.replace(/\s/g, '');
              const expiryDate = formData.get('expiryDate') as string;
              const holderName = formData.get('holderName') as string;
              
              if (!cardNumber || !expiryDate || !holderName) {
                setError('Tous les champs sont requis');
                return;
              }

              // Determine card brand based on number
              let cardBrand = 'unknown';
              if (cardNumber.startsWith('4')) cardBrand = 'visa';
              else if (cardNumber.startsWith('5')) cardBrand = 'mastercard';
              else if (cardNumber.startsWith('3')) cardBrand = 'amex';

              const paymentMethodData = {
                type: 'card',
                cardLastFour: cardNumber.slice(-4),
                cardBrand,
                expiryMonth: expiryDate,
                holderName,
                isDefault: paymentMethods.length === 0 // First card is default
              };

              try {
                await api.customers.addPaymentMethod(paymentMethodData);
                await loadCustomerData();
                setShowAddPaymentMethod(false);
              } catch (err) {
                console.error('Error adding payment method:', err);
                setError('Erreur lors de l\'ajout du moyen de paiement');
              }
            }}>              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de carte
                </label>
                <input
                  name="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  maxLength={19}
                  onChange={(e) => {
                    // Format card number with spaces
                    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                    value = value.replace(/(\d{4})/g, '$1 ').trim();
                    e.target.value = value;
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exp. MM/AA
                  </label>
                  <input
                    name="expiryDate"
                    type="text"
                    placeholder="12/25"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    maxLength={5}
                    onChange={(e) => {
                      // Format expiry date with slash
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                      }
                      e.target.value = value;
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    name="cvv"
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    maxLength={4}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, '');
                    }}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du titulaire
                </label>
                <input
                  name="holderName"
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentMethod(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingAddress ? 'Modifier l\'adresse' : 'Ajouter une adresse'}
            </h3>            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const addressData = {
                type: formData.get('type') as string,
                street: formData.get('street') as string,
                street2: (formData.get('street2') as string) || undefined,
                city: formData.get('city') as string,
                postalCode: formData.get('postalCode') as string,
                country: (formData.get('country') as string) || 'France',
                firstName: (formData.get('firstName') as string) || undefined,
                lastName: (formData.get('lastName') as string) || undefined,
                phone: (formData.get('phone') as string) || undefined,
                isDefault: formData.get('isDefault') === 'on'
              };

              try {
                if (editingAddress) {
                  await api.customers.updateAddress(editingAddress.id, addressData);
                } else {
                  await api.customers.addAddress(addressData);
                }
                await loadCustomerData();
                setShowAddAddress(false);
                setEditingAddress(null);
              } catch (err) {
                console.error('Error saving address:', err);
                setError('Erreur lors de la sauvegarde de l\'adresse');
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'adresse
                </label>
                <select
                  name="type"
                  defaultValue={editingAddress?.type || 'home'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="home">Domicile</option>
                  <option value="work">Travail</option>
                  <option value="billing">Facturation</option>
                  <option value="shipping">Livraison</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={editingAddress?.firstName || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={editingAddress?.lastName || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  name="street"
                  defaultValue={editingAddress?.street || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complément d'adresse
                </label>
                <input
                  type="text"
                  name="street2"
                  defaultValue={editingAddress?.street2 || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    defaultValue={editingAddress?.postalCode || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={editingAddress?.city || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingAddress?.phone || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isDefault"
                    defaultChecked={editingAddress?.isDefault || false}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Définir comme adresse par défaut</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAddress(false);
                    setEditingAddress(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingAddress ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-6">
            <h1 className="text-2xl font-bold text-gray-900">Mon Compte Client</h1>            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </div>
          
          <nav className="flex space-x-4 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profil' && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Informations personnelles</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                >
                  <Edit2 size={18} />
                  <span>{isEditing ? 'Annuler' : 'Modifier'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev!, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev!, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.email}</p>
                  )}
                </div>                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev!, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.phone || 'Non renseigné'}</p>
                  )}
                </div>                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.dateOfBirth || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev!, dateOfBirth: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('fr-FR') : 'Non renseigné'}
                    </p>
                  )}
                </div>                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.address || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev!, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.address || 'Non renseignée'}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-6">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Sauvegarder les modifications
                  </button>
                </div>
              )}
            </div>
          )}          {activeTab === 'commandes' && (
            <EnhancedOrderTracking userRole="customer" />
          )}{activeTab === 'paiement' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold mb-6">Moyens de paiement</h2>
              
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center uppercase">
                          {method.cardBrand}
                        </div>
                        <div>
                          <p className="font-medium">**** **** **** {method.cardLastFour}</p>
                          <p className="text-sm text-gray-600">Expire en {method.expiryMonth}</p>
                          {method.holderName && (
                            <p className="text-sm text-gray-600">{method.holderName}</p>
                          )}
                          {method.isDefault && (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mt-1">
                              Par défaut
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          disabled={method.isDefault}
                          className="text-green-600 hover:text-green-700 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {method.isDefault ? 'Par défaut' : 'Définir par défaut'}
                        </button>
                        <button 
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {paymentMethods.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun moyen de paiement enregistré</p>
                  </div>
                )}
                
                <button 
                  onClick={() => setShowAddPaymentMethod(true)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
                >
                  + Ajouter une nouvelle carte
                </button>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Portefeuille électronique</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-800">Solde actuel</p>
                      <p className="text-2xl font-bold text-green-600">25,80 €</p>
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Recharger
                    </button>
                  </div>
                </div>              </div>
            </div>
          )}

          {activeTab === 'fidelite' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Programme de fidélité</h2>
              
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-6">Le programme de fidélité sera bientôt disponible !</p>
              </div>

              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Comment ça marche ?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Gagnez 1 point pour chaque euro dépensé</li>
                  <li>• 100 points = 5€ de réduction</li>
                  <li>• Points valables 12 mois</li>
                  <li>• Bonus double points sur les produits bio</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold mb-6">Préférences de notification</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notifications push</h3>
                    <p className="text-sm text-gray-600">Recevoir des notifications sur votre navigateur</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notifications}
                      onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Newsletter</h3>
                    <p className="text-sm text-gray-600">Recevoir notre newsletter hebdomadaire</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.newsletter}
                      onChange={(e) => setPreferences(prev => ({ ...prev, newsletter: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">SMS</h3>
                    <p className="text-sm text-gray-600">Recevoir des SMS pour les commandes importantes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.sms}
                      onChange={(e) => setPreferences(prev => ({ ...prev, sms: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Offres promotionnelles</h3>
                    <p className="text-sm text-gray-600">Recevoir les offres spéciales par email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.emailPromotions}
                      onChange={(e) => setPreferences(prev => ({ ...prev, emailPromotions: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}          {activeTab === 'adresses' && (
            <div className="max-w-4xl">
              <h2 className="text-xl font-semibold mb-6">Mes Adresses</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                {addresses.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full capitalize">
                            {address.type}
                          </span>
                          {address.isDefault && (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Par défaut
                            </span>
                          )}
                        </div>
                        {(address.firstName || address.lastName) && (
                          <p className="font-medium text-gray-900">
                            {address.firstName} {address.lastName}
                          </p>
                        )}
                        <p className="text-gray-700">{address.street}</p>
                        {address.street2 && (
                          <p className="text-gray-700">{address.street2}</p>
                        )}
                        <p className="text-gray-700">
                          {address.postalCode} {address.city}
                        </p>
                        <p className="text-gray-700">{address.country}</p>
                        {address.phone && (
                          <p className="text-gray-600 text-sm mt-1">{address.phone}</p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1 ml-4">
                        <button 
                          onClick={() => handleEditAddress(address)}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleSetDefaultAddress(address.id)}
                          disabled={address.isDefault}
                          className="text-blue-600 hover:text-blue-700 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {address.isDefault ? 'Par défaut' : 'Définir par défaut'}
                        </button>
                        <button 
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {addresses.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune adresse enregistrée</p>
                  </div>
                )}
                
                <div className="col-span-2">
                  <button 
                    onClick={() => setShowAddAddress(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
                  >
                    + Ajouter une nouvelle adresse
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parametres' && (
            <div className="text-center py-12">
              <p className="text-gray-500">Cette section sera disponible prochainement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAccount;
