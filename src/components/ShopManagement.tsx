import React, { useState, useEffect } from 'react';
import { Plus, Store, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { shopsAPI } from '@/lib/api';
import PhotoUpload from './PhotoUpload';

interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  specialties: string[];
  images?: string[];
  isActive: boolean;
  createdAt: string;
}

const ShopManagement = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    specialties: '',
    images: [] as string[]
  });

  useEffect(() => {
    loadShops();
  }, []);  const loadShops = async () => {
    try {
      setLoading(true);
      const shopsData = await shopsAPI.getMyShops();
      setShops(shopsData);
    } catch (error) {
      console.error('Error loading shops:', error);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };  const handleCreateShop = async () => {
    try {
      const shopData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        specialties: formData.specialties.split(',').map(s => s.trim()),
        images: formData.images
      };
      
      const newShop = await shopsAPI.create(shopData);
      setShops(prev => [...prev, newShop]);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error creating shop:', error);
      alert('Erreur lors de la création de la boutique: ' + (error.message || 'Erreur inconnue'));
    }
  };  const handleUpdateShop = async () => {
    if (!editingShop) return;
    
    try {
      const shopData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        specialties: formData.specialties.split(',').map(s => s.trim()),
        images: formData.images
      };
      
      const updatedShop = await shopsAPI.update(editingShop.id, shopData);
      setShops(prev => prev.map(shop => 
        shop.id === editingShop.id ? updatedShop : shop
      ));
      setEditingShop(null);
      resetForm();
    } catch (error) {
      console.error('Error updating shop:', error);
      alert('Erreur lors de la mise à jour de la boutique: ' + (error.message || 'Erreur inconnue'));
    }
  };const handleDeleteShop = async (shopId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) return;
    
    try {
      await shopsAPI.delete(shopId);
      setShops(prev => prev.filter(shop => shop.id !== shopId));
    } catch (error) {
      console.error('Error deleting shop:', error);
      alert('Erreur lors de la suppression de la boutique: ' + (error.message || 'Erreur inconnue'));
    }
  };
  const startEdit = (shop: Shop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name,
      description: shop.description,
      address: shop.address,
      phone: shop.phone,
      email: shop.email,
      specialties: shop.specialties.join(', '),
      images: shop.images || []
    });
  };
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      specialties: '',
      images: []
    });
  };

  const cancelEdit = () => {
    setEditingShop(null);
    setShowCreateForm(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestion des boutiques</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos boutiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des boutiques</h2>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus size={16} className="mr-2" />
          Ajouter une boutique
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingShop) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingShop ? 'Modifier la boutique' : 'Créer une nouvelle boutique'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom de la boutique</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Ferme Bio du Soleil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@ferme-bio.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Décrivez votre exploitation et vos produits..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Adresse</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Route de la Campagne"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="04 42 12 34 56"
                />
              </div>
            </div>            <div>
              <label className="block text-sm font-medium mb-1">Spécialités</label>
              <Input
                value={formData.specialties}
                onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                placeholder="Légumes bio, Fruits de saison, Miel..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Photos de la boutique</label>
              <PhotoUpload
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                maxImages={5}
              />
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={editingShop ? handleUpdateShop : handleCreateShop}
                className="bg-green-600 hover:bg-green-700"
              >
                {editingShop ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shops List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shops.map((shop) => (
          <Card key={shop.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{shop.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      shop.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {shop.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(shop)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteShop(shop.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </CardHeader>            <CardContent className="space-y-3">
              {/* Shop Image */}
              {shop.images && shop.images.length > 0 && (
                <div className="w-full h-32 rounded-lg overflow-hidden">
                  <img
                    src={shop.images[0]}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <p className="text-sm text-gray-600">{shop.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{shop.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone size={14} className="text-gray-400" />
                  <span>{shop.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail size={14} className="text-gray-400" />
                  <span>{shop.email}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Spécialités:</p>
                <div className="flex flex-wrap gap-1">
                  {shop.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {shops.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune boutique</h3>
          <p className="text-gray-500 mb-6">Créez votre première boutique pour commencer à vendre</p>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus size={16} className="mr-2" />
            Créer ma première boutique
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShopManagement;
