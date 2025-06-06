import React, { useState } from 'react';
import { X, User, Mail, Lock, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '@/lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  userType?: 'customer' | 'producer';
  onAuthSuccess?: () => void;
}

const AuthModal = ({ isOpen, onClose, defaultMode = 'login', userType = 'customer', onAuthSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState(defaultMode);
  const [currentUserType, setCurrentUserType] = useState(userType);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    businessName: '',
    phone: '',
  });
  const navigate = useNavigate();

  if (!isOpen) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        const user = await login(formData.email, formData.password, currentUserType);
        // Navigate based on the actual user role from the backend, not the UI selection
        navigate(user.role === 'customer' ? '/products' : '/account/provider');
        onAuthSuccess?.();
        onClose();
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }

        const profileData = currentUserType === 'producer' 
          ? { 
              shopName: formData.businessName,
              description: formData.businessName ? `Bienvenue chez ${formData.businessName}` : 'Nouveau producteur local',
              address: '',
              certifications: [],
              pickupInfo: {
                location: '',
                hours: '',
                instructions: ''
              }
            }
          : { 
              firstName: formData.firstName, 
              lastName: formData.lastName,
              phone: formData.phone || '',
              address: '',
              preferences: []
            };

        const user = await register(formData.email, formData.password, currentUserType, profileData);
        // For registration, we can trust currentUserType since we're creating the account with that role
        navigate(user.role === 'customer' ? '/products' : '/account/provider');
        onAuthSuccess?.();
        onClose();
      }
    } catch (err: any) {
      // Provide specific error messages for role mismatches
      if (err.message === 'Invalid credentials for this account type') {
        setError(`Ce compte n'est pas un compte ${currentUserType === 'customer' ? 'client' : 'producteur'}. Veuillez sélectionner le bon type de compte.`);
      } else {
        setError(err.message || 'Une erreur est survenue');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Connexion' : 'Inscription'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* User Type Selection */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentUserType('customer')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                currentUserType === 'customer'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Client
            </button>
            <button
              onClick={() => setCurrentUserType('producer')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                currentUserType === 'producer'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Producteur
            </button>
          </div>

          {mode === 'login' && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
              💡 <strong>Astuce:</strong> Assurez-vous de sélectionner le bon type de compte (Client ou Producteur) selon votre inscription initiale.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {currentUserType === 'producer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'entreprise
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {mode === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              {mode === 'login' 
                ? "Pas encore de compte ? S'inscrire" 
                : "Déjà un compte ? Se connecter"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
