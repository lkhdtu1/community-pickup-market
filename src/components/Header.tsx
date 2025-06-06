import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import { getCurrentUser, logout, isAuthenticated, validateSession } from '@/lib/auth';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onSearch: (query: string) => void;
}

const Header = ({ cartItemsCount, onCartClick, onSearch }: HeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'customer' | 'producer'>('customer');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await validateSession();
        setUser(user);
      } catch (error) {
        // If validation fails, clear user state
        setUser(null);
      }
    };
    
    initializeAuth();
  }, []);

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setUserType('customer');
    setIsAuthModalOpen(true);
  };
  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  const handleAuthSuccess = () => {
    const updatedUser = getCurrentUser();
    setUser(updatedUser);
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">@</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">SELLOC</h1>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">Accueil</Link>
              <Link to="/products" className="text-gray-700 hover:text-green-600 transition-colors">Produits</Link>
              <Link to="/producers" className="text-gray-700 hover:text-green-600 transition-colors">Producteurs</Link>
              <Link to="/pickup-points" className="text-gray-700 hover:text-green-600 transition-colors">Points Relais</Link>
            </nav>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <Search size={20} />
              </button>
              
              {isAuthenticated() && user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-green-600 transition-colors">
                    <User size={20} />
                    <span className="hidden md:block">{user.email}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        to={user.role === 'customer' ? '/account/customer' : '/account/provider'}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Mon compte
                      </Link>
                      {user.role === 'producer' && (
                        <Link
                          to="/create-shop"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Créer une boutique
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-green-600 transition-colors">
                    <LogIn size={20} />
                    <span className="hidden md:block">Connexion</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => handleAuthClick('login')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Connexion
                      </button>
                      <button
                        onClick={() => handleAuthClick('signup')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Inscription
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={onCartClick}
                className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <ShoppingCart size={20} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="pb-4">
              <input
                type="text"
                placeholder="Rechercher des produits..."
                className="w-full max-w-md mx-auto block px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    console.log('Search query:', searchQuery);
                    // Here you would typically trigger the actual search/filtering
                    // e.g., call a search function passed as a prop or update a global state
                    onSearch(searchQuery);
                  }
                }}
              />
            </div>
          )}
        </div>
      </header>      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
        userType={userType}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Header;
