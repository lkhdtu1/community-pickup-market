import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation } from 'lucide-react';

interface PickupPoint {
  id: number;
  name: string;
  address: string;
  schedule: string;
  nextAvailable: string;
  coordinates: [number, number];
  type: 'market' | 'farm' | 'shop';
  rating?: number;
  phone?: string;
}

interface MapViewProps {
  pickupPoints: PickupPoint[];
  onPointSelect: (point: PickupPoint) => void;
  selectedPoint?: PickupPoint | null;
  mapboxToken: string;
}

const MapView = ({ pickupPoints, onPointSelect, selectedPoint, mapboxToken }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Default to Paris coordinates
          setUserLocation([2.3522, 48.8566]);
        }
      );
    } else {
      // Default to Paris coordinates
      setUserLocation([2.3522, 48.8566]);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;
    if (!mapboxToken) return;
    mapboxgl.accessToken = mapboxToken;
    
    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: userLocation,
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location marker
    new mapboxgl.Marker({ 
      color: '#3B82F6',
      scale: 0.8
    })
      .setLngLat(userLocation)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML('<div class="p-2"><strong>Votre position</strong></div>')
      )
      .addTo(map.current);

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, [mapboxToken, userLocation]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add pickup point markers
    pickupPoints.forEach((point) => {
      const el = document.createElement('div');
      el.className = 'pickup-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = getMarkerColor(point.type);
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '16px';
      el.style.transition = 'transform 0.2s';
      
      // Add icon based on type
      const icon = getTypeIcon(point.type);
      el.innerHTML = icon;

      // Highlight selected point
      if (selectedPoint?.id === point.id) {
        el.style.transform = 'scale(1.2)';
        el.style.border = '4px solid #10B981';
      }

      el.addEventListener('mouseenter', () => {
        if (selectedPoint?.id !== point.id) {
          el.style.transform = 'scale(1.1)';
        }
      });

      el.addEventListener('mouseleave', () => {
        if (selectedPoint?.id !== point.id) {
          el.style.transform = 'scale(1)';
        }
      });

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div class="p-3 max-w-xs">
          <h3 class="font-semibold text-lg mb-1">${point.name}</h3>
          <p class="text-sm text-gray-600 mb-2">${point.address}</p>
          <div class="flex justify-between items-center text-sm">
            <span class="text-green-600 font-medium">${point.nextAvailable}</span>
            ${point.rating ? `<span class="text-yellow-500">★ ${point.rating}</span>` : ''}
          </div>
          <p class="text-xs text-gray-500 mt-1">${point.schedule}</p>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat(point.coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onPointSelect(point);
        map.current?.flyTo({
          center: point.coordinates,
          zoom: 15,
          duration: 1000
        });
      });

      markers.current.push(marker);
    });
  }, [pickupPoints, selectedPoint, onPointSelect]);

  const getMarkerColor = (type: string) => {
    switch(type) {
      case 'market': return '#10B981';
      case 'farm': return '#F59E0B';
      case 'shop': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'market': return '🏪';
      case 'farm': return '🚜';
      case 'shop': return '🏬';
      default: return '📍';
    }
  };

  if (!mapboxToken) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex flex-col items-center justify-center p-6">
        <MapPin className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Configuration de la carte</h3>
        <p className="text-gray-600 text-center mb-4">
          Le token Mapbox est requis pour afficher la carte interactive.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className="h-96 rounded-lg shadow-lg" />
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Marchés</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Fermes</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Épiceries</span>
          </div>
        </div>
      </div>
      {selectedPoint && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <h4 className="font-semibold">{selectedPoint.name}</h4>
          <p className="text-sm text-gray-600">{selectedPoint.nextAvailable}</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
