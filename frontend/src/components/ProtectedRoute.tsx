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
      let token: string | null = null;

      // Get token
      if (requiredRole === "admin") {
        token = localStorage.getItem("admin_token");
      } else if (requiredRole === "tenant") {
        token =
          localStorage.getItem("tenant_token") ||
          localStorage.getItem("auth_token");
      } else {
        token =
          localStorage.getItem("admin_token") ||
          localStorage.getItem("tenant_token") ||
          localStorage.getItem("auth_token");
      }

      if (!token) {
        setIsAuthenticated(false);
        setHasRequiredRole(false);
        return;
      }

      // ✅ verify token (backend call)
      const isValid = await apiClient.verifyToken();
      setIsAuthenticated(isValid);

      // Role check
      if (isValid && requiredRole) {
        if (requiredRole === "admin") {
          setHasRequiredRole(!!localStorage.getItem("admin_token"));
        } else if (requiredRole === "tenant") {
          setHasRequiredRole(!!localStorage.getItem("tenant_id"));
        }
      } else {
        setHasRequiredRole(isValid);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setHasRequiredRole(false);
    }
  };

  // Loading
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

  // Not logged in
  if (!isAuthenticated) {
    const loginPath = requiredRole === "admin" ? "/admin/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Role mismatch
  if (requiredRole && !hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}