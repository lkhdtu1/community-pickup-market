
import React, { useState } from 'react';
import { User, Package, MapPin, Settings, LogOut, Edit2, CreditCard, Bell, Shield, Gift, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/lib/auth';

const CustomerAccount = () => {
  const [activeTab, setActiveTab] = useState('profil');
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    prenom: 'Marie',
    nom: 'Dupont',
    email: 'marie.dupont@email.com',
    telephone: '06 12 34 56 78',
    adresse: '123 rue de la Paix, 75001 Paris',
    dateNaissance: '1985-03-15'
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    newsletter: true,
    sms: false,
    emailPromotions: true
  });

  const historiqueCommandes = [
    {
      id: 1,
      date: '2024-01-15',
      total: 45.80,
      statut: 'Récupérée',
      articles: ['Tomates bio x2', 'Pain artisanal', 'Miel de lavande'],
      pointRelais: 'Marché de Belleville',
      note: 5
    },
    {
      id: 2,
      date: '2024-01-08',
      total: 32.50,
      statut: 'Prête',
      articles: ['Fromage de chèvre', 'Salade verte', 'Œufs fermiers'],
      pointRelais: 'Ferme des Roses',
      note: null
    },
    {
      id: 3,
      date: '2024-01-01',
      total: 68.90,
      statut: 'Livrée',
      articles: ['Panier légumes de saison', 'Viande locale', 'Fruits bio'],
      pointRelais: 'Centre-ville',
      note: 4
    }
  ];

  const cartesFidelite = [
    { nom: 'Ferme Bio Martin', points: 245, reduction: '5%' },
    { nom: 'Boulangerie Artisanale', points: 89, reduction: '10€' },
    { nom: 'Maraîcher Local', points: 156, reduction: '3€' }
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    console.log('Profil sauvegardé:', profileData);
  };
  const handleRateOrder = (orderId: number, rating: number) => {
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.prenom}
                      onChange={(e) => setProfileData(prev => ({ ...prev, prenom: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.prenom}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.nom}
                      onChange={(e) => setProfileData(prev => ({ ...prev, nom: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.nom}</p>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.telephone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, telephone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.telephone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.dateNaissance}
                      onChange={(e) => setProfileData(prev => ({ ...prev, dateNaissance: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{new Date(profileData.dateNaissance).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.adresse}
                      onChange={(e) => setProfileData(prev => ({ ...prev, adresse: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.adresse}</p>
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
          )}

          {activeTab === 'commandes' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Historique des commandes</h2>
              <div className="space-y-4">
                {historiqueCommandes.map((commande) => (
                  <div key={commande.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">Commande #{commande.id}</h3>
                        <p className="text-sm text-gray-600">{new Date(commande.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{commande.total.toFixed(2)} €</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          commande.statut === 'Récupérée' || commande.statut === 'Livrée'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {commande.statut}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Articles : {commande.articles.join(', ')}</p>
                      <p className="text-sm text-gray-600">Point de retrait : {commande.pointRelais}</p>
                    </div>
                    {commande.statut === 'Livrée' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Votre note :</span>
                        {commande.note ? (
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={star <= commande.note! ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                              />
                            ))}
                            <span className="text-sm text-gray-600">({commande.note}/5)</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRateOrder(commande.id, star)}
                                className="text-gray-300 hover:text-yellow-400"
                              >
                                <Star size={16} />
                              </button>
                            ))}
                            <span className="text-sm text-gray-500">Cliquez pour noter</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'paiement' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold mb-6">Moyens de paiement</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center">VISA</div>
                      <div>
                        <p className="font-medium">**** **** **** 1234</p>
                        <p className="text-sm text-gray-600">Expire en 12/25</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-700 text-sm">Modifier</button>
                      <button className="text-red-600 hover:text-red-700 text-sm">Supprimer</button>
                    </div>
                  </div>
                </div>
                
                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors">
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
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fidelite' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Programme de fidélité</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cartesFidelite.map((carte, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{carte.nom}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Points accumulés</span>
                        <span className="font-medium">{carte.points}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Réduction disponible</span>
                        <span className="font-medium text-green-600">{carte.reduction}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((carte.points / 300) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {300 - carte.points > 0 ? `${300 - carte.points} points pour la prochaine récompense` : 'Récompense disponible !'}
                      </p>
                    </div>
                  </div>
                ))}
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
          )}

          {(activeTab === 'adresses' || activeTab === 'parametres') && (
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
