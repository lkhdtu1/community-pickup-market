
import React, { useState, useEffect } from 'react';
import { Save, Camera, MapPin, Phone, Mail, Globe, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface ProducerProfileData {
  shopName: string;
  description: string;
  address: string;
  phone?: string;
  email: string;
  website?: string;
  certifications: string[];
  pickupInfo?: {
    location: string;
    hours: string;
    instructions: string;
  };
  pickupDays?: string;
  pickupHours?: string;
  deliveryZones?: string;
}

const ProducerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProducerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.producers.getProfile();
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Error loading producer profile:', err);
      setError('Erreur lors du chargement du profil');      // Set default data if profile doesn't exist
      setProfile({
        shopName: '',
        description: '',
        address: '',
        email: '',
        certifications: [],
        pickupInfo: {
          location: '',
          hours: '',
          instructions: ''
        },
        pickupDays: '',
        pickupHours: '',
        deliveryZones: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      await api.producers.updateProfile(profile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Erreur lors de la sauvegarde du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProducerProfileData, value: any) => {
    if (!profile) return;
    setProfile({
      ...profile,
      [field]: value
    });
  };

  const handlePickupInfoChange = (field: string, value: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      pickupInfo: {
        ...profile.pickupInfo,
        [field]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Profil de ma boutique</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Profil de ma boutique</h2>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Erreur lors du chargement du profil'}</p>
          <Button onClick={loadProfile}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profil de ma boutique</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700">
            Modifier le profil
          </Button>
        ) : (
          <div className="space-x-2">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save size={16} />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
          </div>
        )}
      </div>      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Photo de la boutique */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src="/placeholder.svg"
                alt="Photo de la boutique"
                className="w-32 h-32 rounded-lg object-cover"
              />
              {isEditing && (
                <button className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-white hover:bg-opacity-70">
                  <Camera size={24} />
                </button>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{profile.shopName || 'Nom de boutique'}</h3>
              <p className="text-gray-600">{profile.description || 'Description à ajouter'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom de la boutique</label>
              {isEditing ? (
                <Input
                  value={profile.shopName}
                  onChange={(e) => setProfile(prev => ({ ...prev, shopName: e.target.value }))}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{profile.shopName}</p>
              )}
            </div>            <div>
              <label className="block text-sm font-medium mb-1">Certifications</label>
              {isEditing ? (
                <Input
                  value={profile.certifications.join(', ')}
                  onChange={(e) => handleInputChange('certifications', e.target.value.split(', ').filter(c => c.trim()))}
                  placeholder="Agriculture Biologique, Label Rouge..."
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{profile.certifications.join(', ') || 'Aucune certification'}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            {isEditing ? (
              <textarea
                value={profile.description}
                onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
              />
            ) : (
              <p className="p-2 bg-gray-50 rounded">{profile.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Coordonnées */}
      <Card>
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                <MapPin size={16} className="mr-1" />
                Adresse
              </label>
              {isEditing ? (
                <Input
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{profile.address}</p>
              )}
            </div>            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                <Phone size={16} className="mr-1" />
                Téléphone
              </label>
              {isEditing ? (
                <Input
                  value={profile.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{profile.phone || 'Non renseigné'}</p>
              )}
            </div>
            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                <Mail size={16} className="mr-1" />
                Email
              </label>
              {isEditing ? (
                <Input
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{profile.email}</p>
              )}
            </div>
            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                <Globe size={16} className="mr-1" />
                Site web
              </label>
              {isEditing ? (
                <Input
                  value={profile.website}
                  onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{profile.website}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations de retrait */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de retrait et livraison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jours de retrait</label>
              {isEditing ? (
                <Input
                  value={profile.pickupDays}
                  onChange={(e) => setProfile(prev => ({ ...prev, pickupDays: e.target.value }))}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{profile.pickupDays}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Horaires de retrait</label>
              {isEditing ? (
                <Input
                  value={profile.pickupHours}
                  onChange={(e) => setProfile(prev => ({ ...prev, pickupHours: e.target.value }))}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{profile.pickupHours}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Zones de livraison</label>
            {isEditing ? (
              <Input
                value={profile.deliveryZones}
                onChange={(e) => setProfile(prev => ({ ...prev, deliveryZones: e.target.value }))}
              />
            ) : (
              <p className="p-2 bg-gray-50 rounded">{profile.deliveryZones}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProducerProfile;
