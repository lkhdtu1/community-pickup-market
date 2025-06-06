import React from 'react';
import { Producer } from '../types/product';

interface ProducerCardProps {
  producer: Producer;
  onClick: (producerId: string) => void;
}

const ProducerCard = ({ producer, onClick }: ProducerCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img
          src={producer.image}
          alt={producer.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-gray-900">{producer.name}</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {producer.location}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{producer.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {producer.specialties.map((specialty, index) => (
            <span
              key={index}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>
        <button 
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          onClick={() => onClick(producer.id)}
        >
          Voir les produits
        </button>
      </div>
    </div>
  );
};

export default ProducerCard;
