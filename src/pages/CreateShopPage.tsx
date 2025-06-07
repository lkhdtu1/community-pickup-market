import React, { useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Store, MapPin, Phone, Mail, ImagePlus } from 'lucide-react';
import { shopsAPI } from '../lib/api';
import { useCart } from '../contexts/CartContext';

interface ShopFormData {
  shopName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  specialties: string;
}

const CreateShopPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cartItemsCount } = useCart();
  
  const handleSearch = (query: string) => {
    navigate(`/products?search=${query}`);
  };

  const form = useForm<ShopFormData>({
    defaultValues: {
      shopName: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      specialties: ''
    }
  });
  const onSubmit = async (data: ShopFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Transform form data to match API expectations
      const shopData = {
        name: data.shopName,
        description: data.description,
        address: data.address,
        phone: data.phone,
        email: data.email,
        specialties: data.specialties.split(',').map(s => s.trim()).filter(s => s),
        images: [],
        certifications: [],
        pickupInfo: {
          location: data.address,
          hours: 'Lun-Ven: 9h-18h',
          instructions: 'Contactez-nous pour organiser la récupération'
        }
      };

      await shopsAPI.create(shopData);
      // Navigate to provider account page after creation
      navigate('/account/provider');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">      <Header 
        cartItemsCount={cartItemsCount}
        onCartClick={() => navigate('/products')}
        onSearch={handleSearch}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-green-100 rounded-lg">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Créer votre boutique</h1>
              <p className="text-gray-600">Configurez votre espace producteur et commencez à vendre vos produits</p>
            </div>
          </div>          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="shopName"
                  rules={{ required: "Le nom de la boutique est requis" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la boutique</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ferme Bio du Soleil" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  rules={{ 
                    required: "L'email est requis",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email invalide"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Email de contact</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="contact@ferme-bio.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                rules={{ required: "La description est requise" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description de votre activité</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={4}
                        placeholder="Décrivez votre exploitation, vos méthodes de production, votre histoire..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  rules={{ required: "L'adresse est requise" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>Adresse</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="123 Route de la Campagne, 12345 Village" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  rules={{ required: "Le téléphone est requis" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>Téléphone</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="06 12 34 56 78" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specialties"
                rules={{ required: "Les spécialités sont requises" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spécialités</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Légumes bio, Fruits de saison, Miel, Fromages..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImagePlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Photo de votre exploitation</h3>
                <p className="text-gray-600 mb-4">Ajoutez une photo qui représente votre activité</p>
                <Button type="button" variant="outline">
                  Choisir une photo
                </Button>
              </div>

              <div className="flex space-x-4 pt-6">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? 'Création en cours...' : 'Créer ma boutique'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/account/provider')}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateShopPage;
