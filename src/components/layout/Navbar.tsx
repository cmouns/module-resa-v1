import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User as UserIcon, Menu, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const { user, profil, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            
            <div className="flex items-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Espace Réservation
              </span>
            </div>

            <div className="hidden md:flex items-center">
              {user ? (
                <div className="flex items-center space-x-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{profil?.prenom || user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-600 transition-colors flex items-center"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4 text-sm">
                  <Link to="/login" className="text-gray-500 hover:text-gray-900 transition-colors">
                    Connexion
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link to="/register" className="text-gray-900 font-medium hover:text-gray-600 transition-colors">
                    Créer un compte
                  </Link>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(true)}
                className="text-gray-500 hover:text-gray-900 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col md:hidden">
          
          <div className="flex items-center h-14 px-4 border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none flex items-center"
            >
              <ArrowLeft className="h-6 w-6 mr-3" />
              <span className="font-medium">Retour</span>
            </button>
          </div>

          <div className="flex flex-col grow px-6 py-8 space-y-8 bg-white overflow-y-auto pb-12">
            {user ? (
              <>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 shrink-0">
                  <UserIcon className="h-8 w-8 text-indigo-600 bg-indigo-100 rounded-full p-1 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Connecté</p>
                    <p className="font-semibold text-gray-900 text-lg">{profil?.prenom || user.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full py-4 px-4 border-2 border-red-100 text-red-600 rounded-lg font-medium text-lg hover:bg-red-50 transition-colors mt-auto shrink-0"
                >
                  <LogOut className="h-6 w-6 mr-2" />
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-4 mt-4 shrink-0">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex justify-center w-full py-4 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium text-lg hover:bg-gray-50 transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex justify-center w-full py-4 px-4 border border-transparent text-white bg-indigo-600 rounded-lg font-medium text-lg hover:bg-indigo-700 transition-colors"
                >
                  Créer un compte
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}