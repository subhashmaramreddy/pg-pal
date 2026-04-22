import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";
import type { Tenant, Payment, Room } from "@/services/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  CreditCard,
  LogOut,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Mail,
  GraduationCap,
  Loader,
  Home,
  Clock,
  Download,
  FileText,
  CalendarIcon
} from "lucide-react";
import { format, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { downloadReceipt } from "@/components/PaymentReceipt";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  useEffect(() => {
    loadTenantData();
  }, []);

  const loadTenantData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get tenant ID from localStorage (set during login)
      const tenantId = localStorage.getItem('tenant_id');
      if (!tenantId) {
        toast.error("Tenant not found. Please login again.");
        navigate('/login');
        return;
      }

      // Fetch tenant profile
      const profileResponse = await apiClient.getTenantProfile(tenantId);
      setTenant(profileResponse.tenant);
      setRoom(profileResponse.room);

      // Fetch payment history
      const paymentList = await apiClient.getPaymentsByTenant(tenantId);
      setPayments(paymentList);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to load dashboard data";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Error Loading Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadTenantData} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  } 