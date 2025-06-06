import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProducerCard from '../components/ProducerCard';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface Producer {
  id: number;
  name: string;
  description: string;
  specialties: string[];
  image: string;
  location: string;
}

const ProducersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducers();
  }, []);

  const loadProducers = async () => {
    try {
      setLoading(true);
      const data = await api.producers.getPublicProducers();
      setProducers(data);
      setError(null);
    } catch (err) {
      console.error('Error loading producers:', err);
      setError('Erreur lors du chargement des producteurs');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducers = producers.filter(producer =>
    producer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    producer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    producer.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemsCount={0}
        onCartClick={() => {}}
        onSearch={setSearchQuery}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Nos producteurs</h1>
        
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des producteurs...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadProducers}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducers.map((producer) => (
              <ProducerCard
                key={producer.id}
                producer={producer}
                onClick={(producerId) => navigate(`/products?producer=${producerId}`)}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredProducers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Aucun producteur trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProducersPage;
