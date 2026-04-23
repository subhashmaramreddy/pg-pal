import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import apiClient from "@/services/api";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<"tenant" | "admin" | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("admin_token");
    const tenantId = localStorage.getItem("tenant_id");
    const adminEmail = localStorage.getItem("admin_email");
    const tenantName = localStorage.getItem("tenant_name");

    if (!token) {
      setIsAuthenticated(false);
      setUserType(null);
      return;
    }

    setIsAuthenticated(true);
    if (tenantId) {
      setUserType("tenant");
      setUserName(tenantName || "User");
    } else if (adminEmail) {
      setUserType("admin");
      setUserName(adminEmail);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    setIsAuthenticated(false);
    setUserType(null);
    setUserName(null);
    toast.success("Logged out successfully");
    navigate("/");
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">PG Manager</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
                <Link 
                  to="/join" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Join PG
                </Link>
                <Link 
                  to="/login" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tenant Login
                </Link>
                <Button asChild variant="default">
                  <Link to="/admin/login">Admin Login</Link>
                </Button>
              </>
            ) : userType === "tenant" ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Profile
                </Link>
                <Link 
                  to="/payments" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Payments
                </Link>
                <Link 
                  to="/leaves" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Leaves
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {userName}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : userType === "admin" ? (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {userName}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col gap-4">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/" 
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/join" 
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Join PG
                  </Link>
                  <Link 
                    to="/login" 
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Tenant Login
                  </Link>
                  <Button asChild variant="default" className="w-full">
                    <Link to="/admin/login" onClick={() => setIsOpen(false)}>
                      Admin Login
                    </Link>
                  </Button>
                </>
              ) : userType === "tenant" ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/payments" 
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Payments
                  </Link>
                  <Link 
                    to="/leaves" 
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Leaves
                  </Link>
                  <div className="py-2 text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {userName}
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : userType === "admin" ? (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className="text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                  <div className="py-2 text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {userName}
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
