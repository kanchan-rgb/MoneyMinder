import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Assuming it's already in JS
import { Button } from '@/components/ui/button';
import {
  Home,
  PlusCircle,
  FileText,
  LogOut,
  DollarSign,
  IndianRupee
} from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    navigate('/login');
  };

  return (
    <nav className="bg-card border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <IndianRupee className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">MoneyMinder</h1>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/dashboard"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              isActive('/dashboard')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link to="/gmail-connect" className="...">
  Gmail
</Link>

          <Link
            to="/expenses"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              isActive('/expenses')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Expenses</span>
          </Link>

          <Link
            to="/reports"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              isActive('/reports')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
