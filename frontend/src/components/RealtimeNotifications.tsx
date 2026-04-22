import { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Bell, X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  timestamp: Date;
}

export function RealtimeNotifications() {
  const socket = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 10)); // Keep last 10

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    const socket = require("@/services/socket").default;

    // Joiner events
    socket.on("joiner:new", (data: any) => {
      addNotification({
        type: "info",
        title: "New Application",
        message: `${data.name} has submitted a new application`,
      });
      toast.message("New Application", {
        description: `${data.name} wants to join`,
      });
    });

    socket.on("joiner:approved", (data: any) => {
      addNotification({
        type: "success",
        title: "Application Approved",
        message: `${data.name} has been approved`,
      });
      toast.success(`${data.name} approved and assigned to room ${data.roomNumber}`);
    });

    socket.on("joiner:rejected", (data: any) => {
      addNotification({
        type: "warning",
        title: "Application Rejected",
        message: `${data.name}'s application was rejected`,
      });
    });

    // Tenant events
    socket.on("tenant:joined", (data: any) => {
      addNotification({
        type: "success",
        title: "New Tenant",
        message: `${data.name} has joined and moved into room ${data.roomNumber}`,
      });
      toast.success(`${data.name} joined!`);
    });

    socket.on("tenant:vacated", (data: any) => {
      addNotification({
        type: "warning",
        title: "Tenant Vacated",
        message: `${data.name} has vacated room ${data.roomNumber}`,
      });
      toast.message("Tenant Vacated", {
        description: `${data.name} left room ${data.roomNumber}`,
      });
    });

    socket.on("presence:updated", (data: any) => {
      addNotification({
        type: "info",
        title: "Presence Updated",
        message: `${data.name} is now ${data.isPresent ? "present" : "absent"}`,
      });
    });

    // Payment events
    socket.on("payment:received", (data: any) => {
      addNotification({
        type: "success",
        title: "Payment Received",
        message: `₹${data.amount} received from ${data.tenantName} for ${data.month}`,
      });
      toast.success(`Payment received from ${data.tenantName}`);
    });

    socket.on("payment:overdue", (data: any) => {
      addNotification({
        type: "error",
        title: "Payment Overdue",
        message: `${data.tenantName}'s rent payment is overdue`,
      });
      toast.error(`Payment overdue: ${data.tenantName}`);
    });

    // Leave events
    socket.on("leave:created", (data: any) => {
      addNotification({
        type: "info",
        title: "Leave Request",
        message: `${data.tenantName} has requested leave from ${data.startDate}`,
      });
    });

    socket.on("leave:approved", (data: any) => {
      addNotification({
        type: "success",
        title: "Leave Approved",
        message: `${data.tenantName}'s leave request approved`,
      });
    });

    socket.on("leave:rejected", (data: any) => {
      addNotification({
        type: "error",
        title: "Leave Rejected",
        message: `${data.tenantName}'s leave request was rejected`,
      });
    });

    // Room events
    socket.on("room:updated", (data: any) => {
      addNotification({
        type: "info",
        title: "Room Updated",
        message: `Room ${data.roomNumber} has been updated`,
      });
    });

    return () => {
      socket.off("joiner:new");
      socket.off("joiner:approved");
      socket.off("joiner:rejected");
      socket.off("tenant:joined");
      socket.off("tenant:vacated");
      socket.off("presence:updated");
      socket.off("payment:received");
      socket.off("payment:overdue");
      socket.off("leave:created");
      socket.off("leave:approved");
      socket.off("leave:rejected");
      socket.off("room:updated");
    };
  }, [addNotification]);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Notification Bell Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {notifications.length}
            </span>
          )}
        </Button>
      </div>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="w-96 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border">
          <div className="p-4 border-b sticky top-0 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getBgColor(notification.type)}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
