import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Users, 
  Search,
  LogOut,
  Home,
  UserCheck,
  UserX,
  ClipboardList,
  TrendingUp,
  IndianRupee,
  Eye,
  Check,
  X,
  ArrowLeftRight,
  FileText,
  Download,
  UserMinus,
  ArrowRightLeft,
  History,
  Filter,
  Loader
} from "lucide-react";
import { usePGStore, Joiner, Tenant, Room, Payment, PastTenant } from "@/store/pgStore";
import { toast } from "sonner";
import { downloadReceipt } from "@/components/PaymentReceipt";
import { TenantProfileDialog } from "@/components/TenantProfileDialog";
import { ApprovalDetailsDialog } from "@/components/ApprovalDetailsDialog";
import { RealtimeNotifications } from "@/components/RealtimeNotifications";
import { useSocket } from "@/hooks/useSocket";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [roomFilter, setRoomFilter] = useState<"all" | "2_sharing" | "3_sharing">("all");
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [selectedJoiner, setSelectedJoiner] = useState<Joiner | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [rentAmount, setRentAmount] = useState<string>("8000");
  const [depositAmount, setDepositAmount] = useState<string>("16000");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showTenantDialog, setShowTenantDialog] = useState(false);
  const [showTenantProfileDialog, setShowTenantProfileDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");

  // Room capacity dialog
  const [showRoomCapacityDialog, setShowRoomCapacityDialog] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [roomCapacity, setRoomCapacity] = useState<string>("3");
  
  // Stats detail dialogs
  const [showStatsDialog, setShowStatsDialog] = useState<string | null>(null);

  // New dialogs
  const [showVacateDialog, setShowVacateDialog] = useState(false);
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [shiftToRoom, setShiftToRoom] = useState<string>("");
  const [showIdProofDialog, setShowIdProofDialog] = useState(false);

  // Store
  const { 
    rooms, tenants, pastTenants, joiners, payments, 
    getStats, getActiveTenants, approveJoiner, rejectJoiner, 
    markPayment, setRoomCapacity: updateRoomCapacity,
    vacateTenant, shiftTenant, loadAllData
  } = usePGStore();

  // Socket connection for real-time updates
  useSocket();

  // Load data and verify auth on mount
  useEffect(() => {
    const verifyAuthAndLoadData = async () => {
      // Read token from localStorage
      const token = localStorage.getItem("admin_token");
      
      // If missing -> redirect to /admin/login
      if (!token) {
        navigate("/admin/login");
        return;
      }

      try {
        setLoading(true);
        // Token is already verified locally by ProtectedRoute.
        // We only need to check if we have a pg_type to load data.
        
        const pgType = localStorage.getItem('pg_type') as 'boys' | 'girls';
        if (pgType) {
          await loadAllData(pgType);
        }
      } catch (error) {
        console.error('Dashboard data load failed, but session is still valid:', error);
        toast.error('Failed to load dashboard data. Please refresh the page.');
        // Do NOT redirect to login on data load failure
        // User is still authenticated, just the data failed to load
      } finally {
        // Always stop loading in finally
        setLoading(false);
      }
    };

    verifyAuthAndLoadData();
  }, [loadAllData, navigate]);

  const stats = getStats();
  const activeTenants = getActiveTenants();
  
  const pendingJoiners = joiners.filter(j => j.status === 'pending');
  const floors = [1, 2, 3, 4, 5, 6, 7];

  // Filter rooms by sharing type
  const filteredRooms = rooms.filter(room => {
    if (roomFilter === "2_sharing") return room.capacity === 2;
    if (roomFilter === "3_sharing") return room.capacity === 3;
    return true;
  });

  // Filter tenants by search
  const filteredTenants = activeTenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.room.includes(searchQuery) ||
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get available rooms for assignment
  const availableRooms = rooms.filter(r => r.tenantIds.length < r.capacity);

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const handleApprove = () => {
    if (!selectedJoiner || !selectedRoom) {
      toast.error("Please select a room");
      return;
    }
    const rent = parseInt(rentAmount) || 8000;
    const deposit = parseInt(depositAmount) || 16000;
    approveJoiner(selectedJoiner.id, selectedRoom, rent, deposit);
    toast.success(`${selectedJoiner.fullName} approved and assigned to room ${selectedRoom}`);
    setShowApproveDialog(false);
    setSelectedJoiner(null);
    setSelectedRoom("");
    setRentAmount("8000");
    setDepositAmount("16000");
  };

  const handleReject = (joiner: Joiner) => {
    rejectJoiner(joiner.id);
    toast.success(`Application rejected for ${joiner.fullName}`);
    setShowApproveDialog(false);
    setSelectedJoiner(null);
  };

  const handleMarkPayment = (method: 'cash' | 'online') => {
    if (!selectedPaymentId) return;
    markPayment(selectedPaymentId, method);
    toast.success("Payment marked as received");
    setShowPaymentDialog(false);
    setSelectedPaymentId("");
  };

  const handleVacateTenant = () => {
    if (!selectedTenant) return;
    vacateTenant(selectedTenant.id);
    toast.success(`${selectedTenant.name} has been vacated from Room ${selectedTenant.room}`);
    setShowVacateDialog(false);
    setShowTenantDialog(false);
    setShowTenantProfileDialog(false);
    setSelectedTenant(null);
  };

  const handleShiftTenant = () => {
    if (!selectedTenant || !shiftToRoom) {
      toast.error("Please select a room to shift to");
      return;
    }
    const oldRoom = selectedTenant.room;
    shiftTenant(selectedTenant.id, shiftToRoom);
    toast.success(`${selectedTenant.name} shifted from Room ${oldRoom} to Room ${shiftToRoom}`);
    setShowShiftDialog(false);
    setShiftToRoom("");
    setSelectedTenant(null);
  };

  const getRoomTenants = (room: Room): Tenant[] => {
    return activeTenants.filter(t => t.room === room.number);
  };

  const handleSaveRoomCapacity = () => {
    if (!roomToEdit) return;
    const capacity = roomCapacity === "2" ? 2 : 3;
    if (roomToEdit.tenantIds.length > capacity) {
      toast.error(`Room ${roomToEdit.number} already has ${roomToEdit.tenantIds.length} tenants`);
      return;
    }
    const ok = updateRoomCapacity(roomToEdit.number, capacity);
    if (!ok) {
      toast.error("Unable to update room capacity");
      return;
    }
    toast.success(`Room ${roomToEdit.number} set to ${capacity} sharing`);
    setShowRoomCapacityDialog(false);
    setRoomToEdit(null);
  };

  const handleDownloadReceipt = (payment: Payment) => {
    if (payment.status !== 'paid' || !payment.paidDate || !payment.method) {
      toast.error("Receipt not available for unpaid payments");
      return;
    }
    downloadReceipt({
      tenantName: payment.tenantName,
      roomNumber: payment.room,
      month: payment.month,
      amount: payment.amount,
      paidDate: payment.paidDate,
      method: payment.method,
    });
    toast.success("Receipt downloaded");
  };

  const handleSearchResultClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowTenantProfileDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Loading Indicator */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <Card className="p-6 flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Loading dashboard data...</p>
          </Card>
        </div>
      )}

      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Boys PG Manager</h1>
                <p className="text-xs opacity-80">Dashboard</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                <Input
                  placeholder="Search tenant or room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => navigate("/admin/girls-dashboard")}
              >
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Girls PG
              </Button>
              <Button 
                size="sm" 
                onClick={handleLogout} 
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Results */}
        {searchQuery && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Search Results for "{searchQuery}"</CardTitle>
              <CardDescription>Click on a tenant to view full profile</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTenants.length === 0 ? (
                <p className="text-muted-foreground">No tenants found matching your search.</p>
              ) : (
                <div className="space-y-2">
                  {filteredTenants.map((tenant) => (
                    <div 
                      key={tenant.id} 
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleSearchResultClick(tenant)}
                    >
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-muted-foreground">Room {tenant.room} • {tenant.email}</p>
                        <p className="text-xs text-muted-foreground">{tenant.college}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={tenant.presenceStatus === 'present' ? 'default' : 'secondary'}>
                          {tenant.presenceStatus === 'present' ? 'Present' : 'On Leave'}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card 
            className="col-span-1 cursor-pointer hover:border-primary transition-colors"
            onClick={() => setShowStatsDialog('totalRooms')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Rooms</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.totalRooms}</p>
            </CardContent>
          </Card>

          <Card 
            className="col-span-1 cursor-pointer hover:border-primary transition-colors"
            onClick={() => setShowStatsDialog('occupied')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Occupied</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.occupiedRooms}</p>
            </CardContent>
          </Card>

          <Card 
            className="col-span-1 cursor-pointer hover:border-primary transition-colors"
            onClick={() => setShowStatsDialog('tenants')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Tenants</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.totalTenants}</p>
            </CardContent>
          </Card>

          <Card 
            className="col-span-1 cursor-pointer hover:border-primary transition-colors"
            onClick={() => setShowStatsDialog('present')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Present</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.presentToday}</p>
            </CardContent>
          </Card>

          <Card 
            className="col-span-1 cursor-pointer hover:border-primary transition-colors"
            onClick={() => setShowStatsDialog('onLeave')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">On Leave</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.onLeaveToday}</p>
            </CardContent>
          </Card>

          <Card 
            className="col-span-1 cursor-pointer hover:border-primary transition-colors"
            onClick={() => setShowStatsDialog('collected')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Collected</span>
              </div>
              <p className="text-2xl font-bold mt-1">₹{(stats.totalCollected / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>

          <Card 
            className="col-span-1 cursor-pointer hover:border-destructive transition-colors border-amber-500/50"
            onClick={() => setShowStatsDialog('pending')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Pending</span>
              </div>
              <p className="text-2xl font-bold mt-1">₹{(stats.pendingAmount / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rooms" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="approvals">
              Approvals {pendingJoiners.length > 0 && <Badge className="ml-1 h-5 w-5 p-0 justify-center">{pendingJoiners.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="past">
              <History className="h-4 w-4 mr-1" />
              Past
            </TabsTrigger>
          </TabsList>

          {/* Rooms Tab */}
          <TabsContent value="rooms">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Building Overview</CardTitle>
                    <CardDescription>
                      View and manage all rooms across 7 floors ({stats.occupiedRooms} occupied, {stats.availableRooms} available)
                    </CardDescription>
                  </div>
                  {/* Room Type Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={roomFilter} onValueChange={(v) => setRoomFilter(v as typeof roomFilter)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter rooms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Rooms</SelectItem>
                        <SelectItem value="2_sharing">2 Sharing</SelectItem>
                        <SelectItem value="3_sharing">3 Sharing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Floor Selection */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  <Button
                    variant={selectedFloor === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFloor(null)}
                  >
                    All Floors
                  </Button>
                  {floors.map((floor) => (
                    <Button
                      key={floor}
                      variant={selectedFloor === floor ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFloor(floor)}
                    >
                      Floor {floor}
                    </Button>
                  ))}
                </div>

                {/* Room Grid by Floor */}
                <div className="space-y-6">
                  {floors
                    .filter((floor) => selectedFloor === null || selectedFloor === floor)
                    .map((floor) => {
                      const floorRooms = filteredRooms.filter((room) => room.floor === floor);
                      if (floorRooms.length === 0) return null;
                      return (
                        <div key={floor} className="space-y-3">
                          <h3 className="font-semibold text-lg border-b pb-2">
                            Floor {floor} 
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                              ({floorRooms.length} rooms)
                            </span>
                          </h3>
                          <div className="grid grid-cols-5 sm:grid-cols-9 gap-3">
                            {floorRooms.map((room) => {
                              const roomTenants = getRoomTenants(room);
                              return (
                                <div
                                  key={room.number}
                                  className={`
                                    p-3 rounded-lg border-2 text-center cursor-pointer transition-all hover:scale-105
                                    ${room.status === "occupied" 
                                      ? "bg-primary/10 border-primary" 
                                      : "bg-green-500/10 border-green-500"
                                    }
                                  `}
                                  title={roomTenants.length > 0 ? roomTenants.map(t => t.name).join(', ') : 'Available'}
                                  onClick={() => {
                                    setRoomToEdit(room);
                                    setRoomCapacity(String(room.capacity));
                                    setShowRoomCapacityDialog(true);
                                  }}
                                >
                                  <p className="font-bold">{room.number}</p>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs mt-1 ${
                                      room.capacity === 2 ? "bg-blue-500/10 border-blue-500 text-blue-600" : ""
                                    }`}
                                  >
                                    {room.status === "occupied" ? `${roomTenants.length}/${room.capacity}` : `${room.capacity}S`}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="flex gap-6 mt-6 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary"></div>
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500/20 border-2 border-green-500"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-500/10 border-blue-500 text-blue-600 text-xs">2S</Badge>
                    <span>2 Sharing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals ({pendingJoiners.length})</CardTitle>
                <CardDescription>
                  Review and approve new joiner applications. Click "View Details" to see full application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingJoiners.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending applications</p>
                ) : (
                  <div className="space-y-4">
                    {pendingJoiners.map((joiner) => (
                      <div 
                        key={joiner.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card gap-4"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{joiner.fullName}</p>
                          <p className="text-sm text-muted-foreground">{joiner.email} • {joiner.mobile}</p>
                          <p className="text-sm text-muted-foreground">{joiner.college} - {joiner.department} (Year {joiner.year})</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline">{joiner.pgType === 'boys' ? 'Boys PG' : 'Girls PG'}</Badge>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {joiner.roomType === '2_sharing' ? '2 Sharing' : '3 Sharing'}
                            </Badge>
                            <Badge variant="outline">Join: {joiner.joiningDate}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{joiner.applicationDate}</Badge>
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedJoiner(joiner);
                              setShowApproveDialog(true);
                            }}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants">
            <Card>
              <CardHeader>
                <CardTitle>Active Tenants ({activeTenants.length})</CardTitle>
                <CardDescription>
                  Manage tenant details, shift rooms, or vacate tenants. Click eye icon for full profile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeTenants.map((tenant) => (
                    <div 
                      key={tenant.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{tenant.name}</p>
                          <Badge 
                            variant={tenant.presenceStatus === "present" ? "default" : "secondary"}
                          >
                            {tenant.presenceStatus === "present" ? "Present" : "On Leave"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{tenant.email} • {tenant.mobile}</p>
                        <p className="text-sm text-muted-foreground">{tenant.college}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <div className="text-center">
                          <p className="text-muted-foreground">Room</p>
                          <p className="font-bold">{tenant.room}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Floor</p>
                          <p className="font-bold">{tenant.floor}</p>
                        </div>
                        <Badge 
                          variant={tenant.rentStatus === "paid" ? "outline" : "destructive"}
                          className={tenant.rentStatus === "paid" ? "border-green-500 text-green-600" : ""}
                        >
                          {tenant.rentStatus === "paid" ? "Rent Paid" : "Pending"}
                        </Badge>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setShowTenantProfileDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setShiftToRoom("");
                              setShowShiftDialog(true);
                            }}
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setShowVacateDialog(true);
                            }}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>
                  Track and record rent payments (Collected: ₹{stats.totalCollected.toLocaleString()} | Pending: ₹{stats.pendingAmount.toLocaleString()})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card gap-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{payment.tenantName}</p>
                        <p className="text-sm text-muted-foreground">Room {payment.room} • {payment.month}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{payment.amount.toLocaleString()}</p>
                          {payment.paidDate && (
                            <p className="text-xs text-muted-foreground">Paid: {payment.paidDate}</p>
                          )}
                        </div>
                        {payment.status === 'paid' ? (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500 text-white">
                              <Check className="mr-1 h-3 w-3" />
                              {payment.method === 'cash' ? 'Cash' : 'Online'}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadReceipt(payment)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedPaymentId(payment.id);
                              setShowPaymentDialog(true);
                            }}
                          >
                            <IndianRupee className="mr-1 h-4 w-4" />
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Past Tenants Tab */}
          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Tenants ({pastTenants.length})</CardTitle>
                <CardDescription>
                  View history of vacated tenants
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pastTenants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No past tenants</p>
                ) : (
                  <div className="space-y-3">
                    {pastTenants.map((tenant) => (
                      <div 
                        key={tenant.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card gap-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-sm text-muted-foreground">{tenant.email} • {tenant.mobile}</p>
                          <p className="text-sm text-muted-foreground">{tenant.college}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <div className="text-center">
                            <p className="text-muted-foreground">Previous Room</p>
                            <p className="font-bold">{tenant.previousRoom}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground">Joined</p>
                            <p className="font-medium">{tenant.joinDate}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground">Vacated</p>
                            <p className="font-medium">{tenant.vacateDate}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground">Total Paid</p>
                            <p className="font-bold text-green-600">₹{tenant.totalPaid.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Room Capacity Dialog */}
      <Dialog open={showRoomCapacityDialog} onOpenChange={setShowRoomCapacityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Settings</DialogTitle>
            <DialogDescription>Switch a room between 2 sharing and 3 sharing.</DialogDescription>
          </DialogHeader>
          {roomToEdit && (
            <div className="space-y-4">
              <div className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Room {roomToEdit.number}</p>
                    <p className="text-sm text-muted-foreground">
                      Occupancy: {roomToEdit.tenantIds.length}/{roomToEdit.capacity}
                    </p>
                  </div>
                  <Badge variant="outline">Floor {roomToEdit.floor}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Room sharing</Label>
                <Select value={roomCapacity} onValueChange={setRoomCapacity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sharing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Sharing</SelectItem>
                    <SelectItem value="3">3 Sharing</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Note: You can't reduce capacity below the current tenant count.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoomCapacityDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveRoomCapacity}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Details Dialog */}
      <ApprovalDetailsDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        joiner={selectedJoiner}
        availableRooms={availableRooms}
        selectedRoom={selectedRoom}
        onRoomChange={setSelectedRoom}
        rentAmount={rentAmount}
        onRentChange={setRentAmount}
        depositAmount={depositAmount}
        onDepositChange={setDepositAmount}
        onApprove={handleApprove}
        onReject={() => selectedJoiner && handleReject(selectedJoiner)}
      />

      {/* Tenant Profile Dialog */}
      <TenantProfileDialog
        open={showTenantProfileDialog}
        onOpenChange={setShowTenantProfileDialog}
        tenant={selectedTenant}
        payments={payments}
        onVacate={() => setShowVacateDialog(true)}
        onShift={() => {
          setShiftToRoom("");
          setShowShiftDialog(true);
        }}
      />

      {/* Vacate Confirmation Dialog */}
      <Dialog open={showVacateDialog} onOpenChange={setShowVacateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vacate Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to vacate {selectedTenant?.name} from Room {selectedTenant?.room}?
              This action will mark them as inactive and free up the room.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVacateDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleVacateTenant}>
              <UserMinus className="mr-2 h-4 w-4" />
              Confirm Vacate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Room Dialog */}
      <Dialog open={showShiftDialog} onOpenChange={setShowShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shift Tenant</DialogTitle>
            <DialogDescription>
              Move {selectedTenant?.name} from Room {selectedTenant?.room} to a new room
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-sm font-medium mb-2 block">Select New Room</Label>
            <Select value={shiftToRoom} onValueChange={setShiftToRoom}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an available room" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms
                  .filter(r => r.number !== selectedTenant?.room)
                  .map((room) => (
                    <SelectItem key={room.number} value={room.number}>
                      Room {room.number} (Floor {room.floor}) - {room.tenantIds.length}/{room.capacity} occupied
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShiftDialog(false)}>Cancel</Button>
            <Button onClick={handleShiftTenant}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Shift Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Method Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Mark Payment</DialogTitle>
            <DialogDescription>Select payment method</DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 py-4">
            <Button className="flex-1" variant="outline" onClick={() => handleMarkPayment('cash')}>
              <IndianRupee className="mr-2 h-4 w-4" />
              Cash
            </Button>
            <Button className="flex-1" onClick={() => handleMarkPayment('online')}>
              <IndianRupee className="mr-2 h-4 w-4" />
              Online
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Detail Dialog */}
      <Dialog open={!!showStatsDialog} onOpenChange={() => setShowStatsDialog(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {showStatsDialog === 'totalRooms' && 'All Rooms'}
              {showStatsDialog === 'occupied' && 'Occupied Rooms'}
              {showStatsDialog === 'tenants' && 'All Tenants'}
              {showStatsDialog === 'present' && 'Present Tenants'}
              {showStatsDialog === 'onLeave' && 'Tenants On Leave'}
              {showStatsDialog === 'collected' && 'Collected Payments'}
              {showStatsDialog === 'pending' && 'Pending Payments'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2 p-1">
              {/* Total/Occupied Rooms */}
              {(showStatsDialog === 'totalRooms' || showStatsDialog === 'occupied') && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {rooms
                    .filter(r => showStatsDialog === 'totalRooms' || r.status === 'occupied')
                    .map(room => {
                      const roomTenants = getRoomTenants(room);
                      return (
                        <div key={room.number} className={`p-2 rounded border text-center ${room.status === 'occupied' ? 'bg-primary/10 border-primary' : 'bg-green-500/10 border-green-500'}`}>
                          <p className="font-bold">{room.number}</p>
                          <p className="text-xs text-muted-foreground">{roomTenants.length}/{room.capacity}</p>
                          {roomTenants.length > 0 && (
                            <p className="text-xs truncate">{roomTenants.map(t => t.name.split(' ')[0]).join(', ')}</p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Tenants List */}
              {showStatsDialog === 'tenants' && (
                activeTenants.map(tenant => (
                  <div 
                    key={tenant.id} 
                    className="flex justify-between items-center p-2 border rounded cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setShowStatsDialog(null);
                      setSelectedTenant(tenant);
                      setShowTenantProfileDialog(true);
                    }}
                  >
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">Room {tenant.room}</p>
                    </div>
                    <Badge variant={tenant.presenceStatus === 'present' ? 'default' : 'secondary'}>
                      {tenant.presenceStatus === 'present' ? 'Present' : 'On Leave'}
                    </Badge>
                  </div>
                ))
              )}

              {/* Present/On Leave */}
              {(showStatsDialog === 'present' || showStatsDialog === 'onLeave') && (
                activeTenants
                  .filter(t => showStatsDialog === 'present' ? t.presenceStatus === 'present' : t.presenceStatus === 'on_leave')
                  .map(tenant => (
                    <div 
                      key={tenant.id} 
                      className="flex justify-between items-center p-2 border rounded cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setShowStatsDialog(null);
                        setSelectedTenant(tenant);
                        setShowTenantProfileDialog(true);
                      }}
                    >
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-muted-foreground">Room {tenant.room} • {tenant.mobile}</p>
                      </div>
                    </div>
                  ))
              )}

              {/* Collected/Pending Payments */}
              {(showStatsDialog === 'collected' || showStatsDialog === 'pending') && (
                payments
                  .filter(p => showStatsDialog === 'collected' ? p.status === 'paid' : p.status === 'pending')
                  .map(payment => (
                    <div key={payment.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{payment.tenantName}</p>
                        <p className="text-sm text-muted-foreground">Room {payment.room} • {payment.month}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">₹{payment.amount.toLocaleString()}</span>
                        {payment.status === 'paid' && payment.paidDate && (
                          <Button size="sm" variant="outline" onClick={() => handleDownloadReceipt(payment)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {payment.status === 'pending' && (
                          <Button size="sm" onClick={() => {
                            setSelectedPaymentId(payment.id);
                            setShowPaymentDialog(true);
                          }}>
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
