import React, { useState, useEffect } from 'react';
import { Save, User, Building, Mail, Phone, MapPin, Clock, Award, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

interface ProducerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  siretNumber: string;
  vatNumber: string;
  businessAddress: string;
  farmName: string;
  farmDescription: string;
  farmSize: string;
  productionMethods: string[];
  certifications: string[];
  contactHours: string;
  websiteUrl: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

const ProducerInformation = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [information, setInformation] = useState<ProducerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInformation();
  }, []);

  const loadInformation = async () => {
    try {
      setLoading(true);
      const data = await api.producers.getInformation();
      setInformation(data);
      setError(null);
    } catch (err) {
      console.error('Error loading producer information:', err);
      setError('Erreur lors du chargement des informations');
      setInformation({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        businessName: '',
        businessType: '',
        siretNumber: '',
        vatNumber: '',
        businessAddress: '',
        farmName: '',
        farmDescription: '',
        farmSize: '',
        productionMethods: [],
        certifications: [],
        contactHours: '',
        websiteUrl: '',
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: ''
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!information) return;
    
    try {
      setSaving(true);
      await api.producers.updateInformation(information);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error saving information:', err);
      setError('Erreur lors de la sauvegarde des informations');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProducerInfo, value: any) => {
    if (!information) return;
    setInformation({
      ...information,
      [field]: value
    });
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    if (!information) return;
    setInformation({
      ...information,
      socialMedia: {
        ...information.socialMedia,
        [platform]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Informations producteur</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (!information) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Informations producteur</h2>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Erreur lors du chargement des informations'}</p>
          <Button onClick={loadInformation}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Informations producteur</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700">
            <User size={16} className="mr-2" />
            Modifier les informations
          </Button>
        ) : (
          <div className="space-x-2">
            <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
              <Save size={16} className="mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User size={20} className="mr-2" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prénom</label>
              {isEditing ? (
                <Input
                  value={information.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Votre prénom"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{information.firstName || 'Non renseigné'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              {isEditing ? (
                <Input
                  value={information.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Votre nom"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{information.lastName || 'Non renseigné'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building size={20} className="mr-2" />
            Informations entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom de l'entreprise</label>
              {isEditing ? (
                <Input
                  value={information.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Nom de votre entreprise"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{information.businessName || 'Non renseigné'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type d'entreprise</label>
              {isEditing ? (
                <Input
                  value={information.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  placeholder="SARL, EURL, Auto-entrepreneur..."
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{information.businessType || 'Non renseigné'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farm Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText size={20} className="mr-2" />
            Informations d'exploitation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom de l'exploitation</label>
            {isEditing ? (
              <Input
                value={information.farmName}
                onChange={(e) => handleInputChange('farmName', e.target.value)}
                placeholder="Nom de votre ferme/exploitation"
              />
            ) : (
              <p className="p-2 bg-gray-50 rounded">{information.farmName || 'Non renseigné'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description de l'exploitation</label>
            {isEditing ? (
              <Textarea
                value={information.farmDescription}
                onChange={(e) => handleInputChange('farmDescription', e.target.value)}
                placeholder="Décrivez votre exploitation..."
                rows={3}
              />
            ) : (
              <p className="p-2 bg-gray-50 rounded whitespace-pre-line">{information.farmDescription || 'Non renseigné'}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProducerInformation;
