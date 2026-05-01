import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, User, CheckSquare } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
      : 'text-gray-500 hover:text-gray-900';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Nav Links */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <CheckSquare className="text-white" size={18} />
              </div>
              <span className="text-xl font-bold text-gray-900">TaskFlow</span>
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 transition-colors ${isActive('/dashboard')}`}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <Link
                to="/projects"
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 transition-colors ${isActive('/projects')}`}
              >
                <FolderKanban size={15} />
                Projects
              </Link>
            </div>
          </div>

          {/* User info + Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-700">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 leading-none">{user?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
              </div>
              {isAdmin && (
                <span className="hidden sm:inline bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  Admin
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <LogOut size={16} />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
