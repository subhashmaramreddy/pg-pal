import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import apiClient from "@/services/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "tenant";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Determine which token to check based on role
      let token = null;
      if (requiredRole === "admin") {
        token = localStorage.getItem("admin_token");
      } else if (requiredRole === "tenant") {
        token = localStorage.getItem("auth_token") || localStorage.getItem("tenant_token");
      } else {
        token = localStorage.getItem("admin_token") || localStorage.getItem("auth_token") || localStorage.getItem("tenant_token");
      }
      
      if (!token) {
        setIsAuthenticated(false);
        setHasRequiredRole(false);
        return;
      }

      // Verify token is still valid
      const isValid = await apiClient.verifyToken();
      setIsAuthenticated(isValid);

      // Check role if required
      if (isValid && requiredRole) {
        if (requiredRole === "admin") {
          const pgType = localStorage.getItem("pg_type");
          const adminEmail = localStorage.getItem("admin_email");
          // Assuming an admin token means they are admin, but checking pgType as well
          setHasRequiredRole(!!pgType && !!adminEmail);
        } else if (requiredRole === "tenant") {
          const tenantId = localStorage.getItem("tenant_id");
          setHasRequiredRole(!!tenantId);
        }
      } else {
        setHasRequiredRole(isValid); // if no required role, hasRequiredRole mirrors isValid
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false);
      setHasRequiredRole(false);
    } finally {
      // Failsafe: if states are still null, set them to false to prevent infinite loading
      setIsAuthenticated(prev => prev === null ? false : prev);
      setHasRequiredRole(prev => prev === null ? false : prev);
    }
  };

  // Loading state
  if (isAuthenticated === null || (requiredRole && hasRequiredRole === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated) {
    const loginPath = requiredRole === "admin" ? "/admin/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Role mismatch
  if (requiredRole && !hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  // Authenticated and authorized
  return <>{children}</>;
}
