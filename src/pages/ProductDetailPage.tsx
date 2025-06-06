
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import Header from '../components/Header';
import { mockProducts } from '../data/mockData';
import { Button } from '../components/ui/button';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = mockProducts.find(p => p.id === parseInt(id || '0'));

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          cartItemsCount={0}
          onCartClick={() => {}}
          onSearch={() => {}}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
            <Button onClick={() => navigate('/products')}>
              Retour aux produits
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log(`Added ${quantity} x ${product.name} to cart`);
    // You can add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemsCount={0}
        onCartClick={() => {}}
        onSearch={() => {}}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/products')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux produits
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {product.category}
                </span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {product.producer}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-green-600">
                  {product.price}€
                </span>
                <span className="text-gray-500">/{product.unit}</span>
              </div>
              
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 fill-yellow-400 text-yellow-400" 
                    />
                  ))}
                </div>
                <span className="text-gray-600">(4.8) · 24 avis</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "Produit frais et de qualité, cultivé localement avec passion par nos producteurs partenaires. Idéal pour vos préparations culinaires quotidiennes."}
              </p>
            </div>

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Quantité</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-gray-600">
                  Total: {(product.price * quantity).toFixed(2)}€
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Ajouter au panier
            </Button>

            {/* Producer Info */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-2">À propos du producteur</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">
                    {product.producer.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{product.producer}</p>
                  <p className="text-gray-600 text-sm">Producteur local certifié</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
