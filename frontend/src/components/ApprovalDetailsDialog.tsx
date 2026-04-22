import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Phone, 
  Mail, 
  Building2, 
  GraduationCap, 
  Calendar,
  Download,
  FileText,
  Home,
  Check,
  X
} from "lucide-react";
import { Joiner, Room } from "@/store/pgStore";
import { GirlsJoiner, GirlsRoom } from "@/store/girlsPGStore";

interface ApprovalDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  joiner: Joiner | GirlsJoiner | null;
  availableRooms: Room[] | GirlsRoom[];
  selectedRoom: string;
  onRoomChange: (room: string) => void;
  rentAmount: string;
  onRentChange: (rent: string) => void;
  depositAmount: string;
  onDepositChange: (deposit: string) => void;
  onApprove: () => void;
  onReject: () => void;
}

export function ApprovalDetailsDialog({
  open,
  onOpenChange,
  joiner,
  availableRooms,
  selectedRoom,
  onRoomChange,
  rentAmount,
  onRentChange,
  depositAmount,
  onDepositChange,
  onApprove,
  onReject,
}: ApprovalDetailsDialogProps) {
  if (!joiner) return null;

  const handleDownloadId = (base64Data: string | undefined, fileName: string) => {
    if (!base64Data) return;
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter rooms based on requested room type
  const matchingRooms = availableRooms.filter(room => {
    if (joiner.roomType === '2_sharing') return room.capacity === 2;
    if (joiner.roomType === '3_sharing') return room.capacity === 3;
    return true;
  });

  const otherRooms = availableRooms.filter(room => {
    if (joiner.roomType === '2_sharing') return room.capacity !== 2;
    if (joiner.roomType === '3_sharing') return room.capacity !== 3;
    return false;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Application Details - {joiner.fullName}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Application Status */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{joiner.pgType === 'boys' ? 'Boys PG' : 'Girls PG'}</Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {joiner.roomType === '2_sharing' ? '2 Sharing' : '3 Sharing'}
              </Badge>
              <Badge variant="outline">Applied: {joiner.applicationDate}</Badge>
              <Badge className="bg-amber-500 text-white">Joining: {joiner.joiningDate}</Badge>
            </div>

            {/* Personal Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{joiner.fullName}</p>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{joiner.gender === 'male' ? 'Male' : 'Female'}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{joiner.email}</p>
                      <p className="text-xs text-muted-foreground">Email</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{joiner.mobile}</p>
                      <p className="text-xs text-muted-foreground">Mobile</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{joiner.parentMobile}</p>
                      <p className="text-xs text-muted-foreground">Parent Mobile</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{joiner.emergencyContact}</p>
                      <p className="text-xs text-muted-foreground">Emergency Contact</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Academic Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{joiner.college}</p>
                      <p className="text-xs text-muted-foreground">College</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{joiner.department}</p>
                      <p className="text-xs text-muted-foreground">Department</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Year {joiner.year}</p>
                    <p className="text-xs text-muted-foreground">Year of Study</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ID Proofs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ID Proofs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {joiner.aadhaarFile && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium">Aadhaar Card</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadId(joiner.aadhaarFile, `Aadhaar_${joiner.fullName}.jpg`)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    {joiner.aadhaarFile.startsWith('data:image') && (
                      <img 
                        src={joiner.aadhaarFile} 
                        alt="Aadhaar Card" 
                        className="max-h-32 rounded border object-contain"
                      />
                    )}
                  </div>
                )}

                {joiner.collegeIdFile && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium">College ID</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadId(joiner.collegeIdFile, `CollegeID_${joiner.fullName}.jpg`)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    {joiner.collegeIdFile.startsWith('data:image') && (
                      <img 
                        src={joiner.collegeIdFile} 
                        alt="College ID" 
                        className="max-h-32 rounded border object-contain"
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Room Assignment */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Room Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Room *</Label>
                  <Select value={selectedRoom} onValueChange={onRoomChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {matchingRooms.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                            Matching ({joiner.roomType === '2_sharing' ? '2' : '3'} Sharing)
                          </div>
                          {matchingRooms.map(room => (
                            <SelectItem key={room.number} value={room.number}>
                              Room {room.number} ({room.tenantIds.length}/{room.capacity} occupied)
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {otherRooms.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2">
                            Other Rooms
                          </div>
                          {otherRooms.map(room => (
                            <SelectItem key={room.number} value={room.number}>
                              Room {room.number} ({room.tenantIds.length}/{room.capacity} occupied)
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monthly Rent (₹) *</Label>
                    <Input 
                      type="number" 
                      value={rentAmount}
                      onChange={(e) => onRentChange(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Security Deposit (₹) *</Label>
                    <Input 
                      type="number" 
                      value={depositAmount}
                      onChange={(e) => onDepositChange(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="flex gap-2">
          <Button variant="destructive" onClick={onReject}>
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button onClick={onApprove} disabled={!selectedRoom}>
            <Check className="h-4 w-4 mr-1" />
            Approve & Assign Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
