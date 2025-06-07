
import React, { useState } from 'react';
import { Search, Filter, MapPin, Clock, Navigation } from 'lucide-react';
import Header from '../components/Header';
import MapView from '../components/MapView';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useCart } from '../contexts/CartContext';

interface PickupPoint {
  id: number;
  name: string;
  address: string;
  schedule: string;
  nextAvailable: string;
  coordinates: [number, number];
  type: 'market' | 'farm' | 'shop';
  distance?: number;
  rating: number;
  phone?: string;
}

const mockPickupPoints: PickupPoint[] = [
  {
    id: 1,
    name: "Marché Bio de Belleville",
    address: "32 Boulevard de Belleville, 75020 Paris",
    schedule: "Mar-Sam: 8h-19h",
    nextAvailable: "Ouvert maintenant",
    coordinates: [2.3767, 48.8718],
    type: 'market',
    distance: 1.2,
    rating: 4.8,
    phone: "01 43 58 47 21"
  },
  {
    id: 2,
    name: "Ferme du Soleil",
    address: "15 Rue de la République, 94120 Fontenay-sous-Bois",
    schedule: "Lun-Ven: 9h-18h",
    nextAvailable: "Ferme à 18h",
    coordinates: [2.4569, 48.8503],
    type: 'farm',
    distance: 2.5,
    rating: 4.6,
    phone: "01 48 76 92 13"
  },
  {
    id: 3,
    name: "Épicerie Locale Plus",
    address: "78 Avenue Parmentier, 75011 Paris",
    schedule: "7j/7: 7h-22h",
    nextAvailable: "Ouvert 24h",
    coordinates: [2.3736, 48.8634],
    type: 'shop',
    distance: 0.8,
    rating: 4.4,
    phone: "01 43 57 82 96"
  },
];

const PickupPointsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'market' | 'farm' | 'shop'>('all');
  const [selectedPoint, setSelectedPoint] = useState<PickupPoint | null>(null);
  const [isMapView, setIsMapView] = useState(true);
  const navigate = useNavigate();
  const { cartItemsCount } = useCart();

  const handleSearch = (query: string) => {
    navigate(`/products?search=${query}`);
  };

  const handlePointSelect = (point: PickupPoint) => {
    setSelectedPoint(point);
  };

  const filteredPoints = mockPickupPoints.filter(point => {
    const matchesSearch = point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         point.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || point.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'market': return 'Marché';
      case 'farm': return 'Ferme';
      case 'shop': return 'Épicerie';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'market': return 'bg-green-100 text-green-800';
      case 'farm': return 'bg-yellow-100 text-yellow-800';
      case 'shop': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">      <Header 
        cartItemsCount={cartItemsCount}
        onCartClick={() => navigate('/products')}
        onSearch={handleSearch}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Points de retrait</h1>
          <div className="flex space-x-2">
            <Button
              variant={isMapView ? "default" : "outline"}
              onClick={() => setIsMapView(true)}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Carte
            </Button>
            <Button
              variant={!isMapView ? "default" : "outline"}
              onClick={() => setIsMapView(false)}
            >
              Liste
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un point de retrait..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              {(['all', 'market', 'farm', 'shop'] as const).map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                  size="sm"
                >
                  {type === 'all' ? 'Tous' : getTypeLabel(type)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Points List */}
          <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto">
            {filteredPoints.map((point) => (
              <div
                key={point.id}
                className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${
                  selectedPoint?.id === point.id ? 'border-green-500 shadow-md' : 'hover:shadow-md'
                }`}
                onClick={() => handlePointSelect(point)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{point.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(point.type)}`}>
                    {getTypeLabel(point.type)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{point.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{point.schedule}</span>
                  </div>
                  {point.distance && (
                    <div className="flex items-center">
                      <Navigation className="w-4 h-4 mr-2" />
                      <span>{point.distance} km</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < Math.floor(point.rating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">({point.rating})</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    point.nextAvailable.includes('Ouvert') ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {point.nextAvailable}
                  </span>
                </div>

                {point.phone && (
                  <div className="mt-2 pt-2 border-t">
                    <a 
                      href={`tel:${point.phone}`}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      📞 {point.phone}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            {isMapView && (
              <MapView
                pickupPoints={filteredPoints}
                onPointSelect={handlePointSelect}
                selectedPoint={selectedPoint}
              />
            )}
          </div>
        </div>

        {/* Selected Point Details */}
        {selectedPoint && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">{selectedPoint.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Informations</h3>
                <div className="space-y-2 text-gray-600">
                  <p><MapPin className="w-4 h-4 inline mr-2" />{selectedPoint.address}</p>
                  <p><Clock className="w-4 h-4 inline mr-2" />{selectedPoint.schedule}</p>
                  {selectedPoint.phone && (
                    <p>📞 <a href={`tel:${selectedPoint.phone}`} className="text-green-600 hover:text-green-700">{selectedPoint.phone}</a></p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Actions</h3>
                <div className="space-y-2">
                  <Button className="w-full" onClick={() => console.log('Navigate to', selectedPoint.address)}>
                    <Navigation className="w-4 h-4 mr-2" />
                    Itinéraire
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/products')}>
                    Voir les produits disponibles
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupPointsPage;
