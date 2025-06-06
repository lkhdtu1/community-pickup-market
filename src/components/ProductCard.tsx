
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking add to cart
    onAddToCart(product);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="aspect-square overflow-hidden bg-gray-100">        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {product.category}
          </span>
          <span className="text-xs text-gray-500">{product.producer.name}</span>
        </div>
        <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xl font-bold text-green-600">{product.price}€</span>
            <span className="text-gray-500 text-sm">/{product.unit}</span>
          </div>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
