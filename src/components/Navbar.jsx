import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { 
  Eye, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  Bot, 
  Upload, 
  MapPin,
  LayoutDashboard,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Home', icon: Eye },
    { path: '/schemes', label: 'Schemes', icon: FileText },
    { path: '/sentiment', label: 'Sentiment', icon: BarChart3 },
    { path: '/complaints', label: 'Complaints', icon: MessageSquare },
    { path: '/chat', label: 'AI Chat', icon: Bot },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/regions', label: 'Regions', icon: MapPin },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav className="glass-effect border-b border-border/50 fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">CiviLens</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActivePath(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            {user ? (
              <>
                {(user.role === 'admin' || user.role === 'government') && (
                  <Link to="/admin/dashboard">
                    <Button variant="outline" size="sm">
                      <LayoutDashboard className="w-4 h-4 mr-1" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <div className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-lg">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-medium">
                      {user.name[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-foreground">{user.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActivePath(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <div className="pt-2 border-t border-border/50">
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs text-primary-foreground font-medium">
                        {user.name[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-foreground">{user.name}</span>
                  </div>
                  {(user.role === 'admin' || user.role === 'government') && (
                    <Link 
                      to="/admin/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;