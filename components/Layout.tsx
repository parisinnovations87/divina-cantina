import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Wine as WineIcon, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/inventory', icon: <WineIcon size={20} />, label: 'La Mia Cantina' },
    { to: '/add', icon: <PlusCircle size={20} />, label: 'Aggiungi Bottiglia' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-wine-950 text-white fixed h-full z-10 shadow-xl">
        <div className="p-6 border-b border-wine-800">
          <h1 className="font-serif text-2xl font-bold tracking-wider text-wine-100">Divina Cantina</h1>
          <p className="text-xs text-wine-300 mt-1">Gestione Vini Premium</p>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-wine-800 text-white shadow-md' 
                    : 'text-wine-200 hover:bg-wine-900 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-wine-800 bg-wine-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="bg-wine-700 rounded-full overflow-hidden w-10 h-10 flex items-center justify-center shrink-0 border-2 border-wine-600">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-wine-300 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-wine-200 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Esci
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-wine-950 text-white z-20 flex justify-between items-center p-4 shadow-md">
        <span className="font-serif text-xl font-bold">Divina Cantina</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-wine-950 z-10 pt-20 px-6">
          <div className="flex flex-col gap-4">
             {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-lg ${
                      isActive ? 'bg-wine-800 text-white' : 'text-wine-200'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
              <div className="border-t border-wine-800 mt-6 pt-6 flex items-center gap-3">
                  <div className="bg-wine-700 rounded-full overflow-hidden w-10 h-10 flex items-center justify-center shrink-0 border-2 border-wine-600">
                    {user?.picture ? (
                        <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon size={20} />
                    )}
                  </div>
                   <div>
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-wine-300">{user?.email}</p>
                   </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-wine-200 mt-2"
              >
                <LogOut size={20} />
                Esci
              </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 pt-24 md:pt-6 min-h-screen transition-all">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;