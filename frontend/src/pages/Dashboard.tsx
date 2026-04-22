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
  Loader
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

  // Mock data - will be replaced with actual data from database
  const mockTenantData = {
  id: "1",
  name: "Rahul Kumar",
  email: "rahul@email.com",
  mobile: "9876543210",
  parentMobile: "9876543200",
  emergencyContact: "9876543201",
  college: "ABC Engineering College",
  department: "Computer Science",
  roomNumber: "305",
  floor: 3,
  rentAmount: 8000,
  securityDeposit: 16000,
  joiningDate: new Date("2024-01-15"),
  status: "present" as "present" | "on_leave",
  aadhaarFile: null as string | null,
  collegeIdFile: null as string | null,
};

const mockPayments = [
  { id: "1", month: "January 2025", amount: 8000, status: "paid" as const, date: "2025-01-15", transactionId: "TXN1234567890" },
  { id: "2", month: "December 2024", amount: 8000, status: "paid" as const, date: "2024-12-15", transactionId: "TXN0987654321" },
  { id: "3", month: "November 2024", amount: 8000, status: "paid" as const, date: "2024-11-15", transactionId: "TXN1122334455" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [leaveFrom, setLeaveFrom] = useState<Date>();
  const [leaveTo, setLeaveTo] = useState<Date>();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const nextDueDate = addMonths(mockTenantData.joiningDate, 
    Math.ceil((new Date().getTime() - mockTenantData.joiningDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
  );

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleMarkLeave = () => {
    if (!leaveFrom || !leaveTo) {
      toast.error("Please select both dates");
      return;
    }
    if (leaveTo < leaveFrom) {
      toast.error("End date must be after start date");
      return;
    }
    toast.success(`Leave marked from ${format(leaveFrom, "PP")} to ${format(leaveTo, "PP")}`);
    setLeaveFrom(undefined);
    setLeaveTo(undefined);
  };

  const handleDownloadReceipt = (payment: typeof mockPayments[0]) => {
    downloadReceipt({
      tenantName: mockTenantData.name,
      roomNumber: mockTenantData.roomNumber,
      month: payment.month,
      amount: payment.amount,
      paidDate: payment.date,
      method: "online",
      transactionId: payment.transactionId,
    });
    toast.success("Receipt downloaded");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome, {mockTenantData.name}!
              </h1>
              <p className="text-muted-foreground">Manage your stay and payments</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={mockTenantData.status === "present" ? "default" : "secondary"}>
                {mockTenantData.status === "present" ? (
                  <><CheckCircle2 className="mr-1 h-3 w-3" /> Present</>
                ) : (
                  <><Home className="mr-1 h-3 w-3" /> On Leave</>
                )}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setShowProfileDialog(true)}>
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Room Number
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockTenantData.roomNumber}</div>
                <p className="text-xs text-muted-foreground">Floor {mockTenantData.floor}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Rent
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{mockTenantData.rentAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Deposit: ₹{mockTenantData.securityDeposit.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Next Due Date
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{format(nextDueDate, "d MMM")}</div>
                <p className="text-xs text-muted-foreground">
                  {format(nextDueDate, "yyyy")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Leave Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Mark Leave / Going Home
                </CardTitle>
                <CardDescription>
                  Let the admin know when you'll be away
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">From Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !leaveFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {leaveFrom ? format(leaveFrom, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={leaveFrom}
                          onSelect={setLeaveFrom}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">To Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !leaveTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {leaveTo ? format(leaveTo, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={leaveTo}
                          onSelect={setLeaveTo}
                          disabled={(date) => date < (leaveFrom || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Button onClick={handleMarkLeave} className="w-full">
                  Mark Leave
                </Button>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment History
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Your recent rent payments
                    </CardDescription>
                  </div>
                  <Button onClick={() => navigate("/payment")}>
                    Pay Rent
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPayments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{payment.month}</p>
                        <p className="text-sm text-muted-foreground">
                          Paid on {format(new Date(payment.date), "PP")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          UTR: {payment.transactionId}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold">₹{payment.amount.toLocaleString()}</p>
                          <Badge variant="outline" className="text-success border-success">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Paid
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDownloadReceipt(payment)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-4">
                  View All Payments
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Profile
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{mockTenantData.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{mockTenantData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Mobile</p>
                      <p className="font-medium">{mockTenantData.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Parent Mobile</p>
                      <p className="font-medium">{mockTenantData.parentMobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Emergency Contact</p>
                      <p className="font-medium">{mockTenantData.emergencyContact}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">College</p>
                      <p className="font-medium">{mockTenantData.college}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="font-medium">{mockTenantData.department}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Room</p>
                      <p className="font-medium">Room {mockTenantData.roomNumber}, Floor {mockTenantData.floor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Joining Date</p>
                      <p className="font-medium">{format(mockTenantData.joiningDate, "PP")}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-4 space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium">Aadhaar Card</span>
                      </div>
                      {mockTenantData.aadhaarFile ? (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      ) : (
                        <Badge variant="secondary">Not uploaded</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium">College ID</span>
                      </div>
                      {mockTenantData.collegeIdFile ? (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      ) : (
                        <Badge variant="secondary">Not uploaded</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
