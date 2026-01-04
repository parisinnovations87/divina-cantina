import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wine, LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 bg-[url('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-wine-950/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="bg-wine-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wine className="text-wine-600" size={32} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">Divina Cantina</h1>
          <p className="text-slate-500 mt-2">Accedi alla tua collezione privata</p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-full transition-all shadow-sm hover:shadow"
            >
               <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
               Continua con Google
            </button>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          I tuoi dati sono salvati in cloud in modo sicuro.
        </p>
      </div>
    </div>
  );
};

export default Login;