import React from 'react';
import Header from '../components/Header';
import CustomerAccount from '../components/CustomerAccount';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CustomerAccountPage = () => {
  const navigate = useNavigate();
  const { cartItemsCount } = useCart();

  const handleSearch = (query: string) => {
    navigate(`/products?search=${query}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemsCount={cartItemsCount}
        onCartClick={() => navigate('/products')}
        onSearch={handleSearch}
      />
      <CustomerAccount />
    </div>
  );
};

export default CustomerAccountPage;
