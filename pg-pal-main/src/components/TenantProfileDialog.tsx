import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Phone, 
  Mail, 
  Building2, 
  GraduationCap, 
  Calendar,
  Download,
  CreditCard,
  Eye,
  FileText,
  Home,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { Tenant, Payment } from "@/store/pgStore";
import { downloadReceipt } from "@/components/PaymentReceipt";

interface TenantProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  payments: Payment[];
  onVacate?: () => void;
  onShift?: () => void;
}

export function TenantProfileDialog({
  open,
  onOpenChange,
  tenant,
  payments,
  onVacate,
  onShift,
}: TenantProfileDialogProps) {
  if (!tenant) return null;

  const tenantPayments = payments.filter(p => p.tenantId === tenant.id);

  const handleDownloadReceipt = (payment: Payment) => {
    if (payment.status !== 'paid' || !payment.paidDate || !payment.method) return;
    downloadReceipt({
      tenantName: payment.tenantName,
      roomNumber: payment.room,
      month: payment.month,
      amount: payment.amount,
      paidDate: payment.paidDate,
      method: payment.method,
    });
  };

  const handleViewIdProof = (base64Data: string | undefined, fileName: string) => {
    if (!base64Data) return;
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Tenant Profile
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4 space-y-4">
              {/* Basic Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{tenant.email}</p>
                      <p className="text-xs text-muted-foreground">Email</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{tenant.mobile}</p>
                      <p className="text-xs text-muted-foreground">Mobile</p>
                    </div>
                  </div>
                  {tenant.parentMobile && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{tenant.parentMobile}</p>
                        <p className="text-xs text-muted-foreground">Parent Mobile</p>
                      </div>
                    </div>
                  )}
                  {tenant.emergencyContact && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{tenant.emergencyContact}</p>
                        <p className="text-xs text-muted-foreground">Emergency Contact</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Academic Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Academic Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{tenant.college}</p>
                      <p className="text-xs text-muted-foreground">College</p>
                    </div>
                  </div>
                  {tenant.department && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{tenant.department}</p>
                        <p className="text-xs text-muted-foreground">Department</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Room Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Room Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Room {tenant.room} (Floor {tenant.floor})</p>
                      <p className="text-xs text-muted-foreground">Current Room</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">₹{tenant.rentAmount.toLocaleString()}/month</p>
                      <p className="text-xs text-muted-foreground">Rent Amount</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">₹{tenant.depositAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Security Deposit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{tenant.joinDate}</p>
                      <p className="text-xs text-muted-foreground">Joining Date</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={tenant.presenceStatus === 'present' ? 'default' : 'secondary'}>
                      {tenant.presenceStatus === 'present' ? 'Present' : 'On Leave'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={tenant.rentStatus === 'paid' ? 'outline' : 'destructive'} 
                      className={tenant.rentStatus === 'paid' ? 'border-success text-success' : ''}>
                      {tenant.rentStatus === 'paid' ? 'Rent Paid' : 'Rent Pending'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {(onVacate || onShift) && (
                <div className="flex gap-2">
                  {onShift && (
                    <Button variant="outline" className="flex-1" onClick={onShift}>
                      Shift to Another Room
                    </Button>
                  )}
                  {onVacate && (
                    <Button variant="destructive" className="flex-1" onClick={onVacate}>
                      Vacate Tenant
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">ID Proofs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tenant.aadhaarFile ? (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="font-medium">Aadhaar Card</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewIdProof(tenant.aadhaarFile, `Aadhaar_${tenant.name}.jpg`)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                      {tenant.aadhaarFile.startsWith('data:image') && (
                        <img 
                          src={tenant.aadhaarFile} 
                          alt="Aadhaar Card" 
                          className="max-h-48 rounded border object-contain"
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No Aadhaar card uploaded</p>
                  )}

                  <Separator />

                  {tenant.collegeIdFile ? (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="font-medium">College ID</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewIdProof(tenant.collegeIdFile, `CollegeID_${tenant.name}.jpg`)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                      {tenant.collegeIdFile.startsWith('data:image') && (
                        <img 
                          src={tenant.collegeIdFile} 
                          alt="College ID" 
                          className="max-h-48 rounded border object-contain"
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No College ID uploaded</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {tenantPayments.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No payment records found</p>
                  ) : (
                    <div className="space-y-3">
                      {tenantPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{payment.month}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.paidDate ? `Paid on ${payment.paidDate}` : 'Pending'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold">₹{payment.amount.toLocaleString()}</p>
                              <Badge 
                                variant={payment.status === 'paid' ? 'outline' : 'destructive'}
                                className={payment.status === 'paid' ? 'border-success text-success' : ''}
                              >
                                {payment.status === 'paid' ? 'Paid' : 'Pending'}
                              </Badge>
                            </div>
                            {payment.status === 'paid' && (
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => handleDownloadReceipt(payment)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
