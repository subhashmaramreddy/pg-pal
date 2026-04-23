import { io, Socket } from "socket.io-client";

interface SocketEvents {
  "connection": () => void;
  "disconnect": () => void;
  "error": (error: any) => void;
  "joiner:new": (data: any) => void;
  "joiner:approved": (data: any) => void;
  "joiner:rejected": (data: any) => void;
  "tenant:joined": (data: any) => void;
  "tenant:vacated": (data: any) => void;
  "payment:received": (data: any) => void;
  "payment:overdue": (data: any) => void;
  "leave:approved": (data: any) => void;
  "leave:rejected": (data: any) => void;
  "leave:created": (data: any) => void;
  "room:updated": (data: any) => void;
  "presence:updated": (data: any) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private url: string;
  private isConnecting: boolean = false;

  constructor(url: string = import.meta.env.VITE_API_URL || "http://localhost:5000") {
    // Strip /api from the URL to avoid connecting to the /api namespace
    this.url = url.replace(/\/api\/?$/, "");
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // If already connecting, wait a bit and try again
        setTimeout(() => this.connect().then(resolve).catch(reject), 100);
        return;
      }

      this.isConnecting = true;

      try {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("auth_token");
        
        this.socket = io(this.url, {
          auth: {
            token: token || "",
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ["websocket", "polling"],
        });

        this.socket.on("connect", () => {
          console.log("Socket connected:", this.socket?.id);
          this.isConnecting = false;
          resolve();
        });

        this.socket.on("connect_error", (error: any) => {
          console.error("Socket connection error:", error);
          this.isConnecting = false;
          reject(error);
        });

        this.socket.on("disconnect", () => {
          console.log("Socket disconnected");
        });

        // Set a timeout for connection
        setTimeout(() => {
          if (!this.socket?.connected && this.isConnecting) {
            this.isConnecting = false;
            reject(new Error("Connection timeout"));
          }
        }, 10000);
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get the socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Listen to a socket event
   */
  on<K extends keyof SocketEvents>(
    event: K,
    callback: (...args: any[]) => void
  ): void {
    if (!this.socket) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.on(event as string, callback);
  }

  /**
   * Listen to a socket event once
   */
  once<K extends keyof SocketEvents>(
    event: K,
    callback: (...args: any[]) => void
  ): void {
    if (!this.socket) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.once(event as string, callback);
  }

  /**
   * Remove a socket event listener
   */
  off<K extends keyof SocketEvents>(
    event: K,
    callback?: (...args: any[]) => void
  ): void {
    if (!this.socket) return;
    this.socket.off(event as string, callback);
  }

  /**
   * Emit a socket event
   */
  emit<K extends keyof SocketEvents>(
    event: K,
    data?: any
  ): void {
    if (!this.socket?.connected) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.emit(event as string, data);
  }

  /**
   * Join a room
   */
  joinRoom(room: string): void {
    this.emit("join", { room });
  }

  /**
   * Leave a room
   */
  leaveRoom(room: string): void {
    this.emit("leave", { room });
  }

  /**
   * Subscribe to joiner events
   */
  subscribeToJoiners(pgType: "boys" | "girls", callback: (data: any) => void): void {
    this.joinRoom(`joiners:${pgType}`);
    this.on("joiner:new", callback);
    this.on("joiner:approved", callback);
    this.on("joiner:rejected", callback);
  }

  /**
   * Unsubscribe from joiner events
   */
  unsubscribeFromJoiners(pgType: "boys" | "girls"): void {
    this.leaveRoom(`joiners:${pgType}`);
    this.off("joiner:new");
    this.off("joiner:approved");
    this.off("joiner:rejected");
  }

  /**
   * Subscribe to tenant events
   */
  subscribeToTenants(pgType: "boys" | "girls", callback: (data: any) => void): void {
    this.joinRoom(`tenants:${pgType}`);
    this.on("tenant:joined", callback);
    this.on("tenant:vacated", callback);
    this.on("presence:updated", callback);
  }

  /**
   * Unsubscribe from tenant events
   */
  unsubscribeFromTenants(pgType: "boys" | "girls"): void {
    this.leaveRoom(`tenants:${pgType}`);
    this.off("tenant:joined");
    this.off("tenant:vacated");
    this.off("presence:updated");
  }

  /**
   * Subscribe to payment events
   */
  subscribeToPayments(pgType: "boys" | "girls", callback: (data: any) => void): void {
    this.joinRoom(`payments:${pgType}`);
    this.on("payment:received", callback);
    this.on("payment:overdue", callback);
  }

  /**
   * Unsubscribe from payment events
   */
  unsubscribeFromPayments(pgType: "boys" | "girls"): void {
    this.leaveRoom(`payments:${pgType}`);
    this.off("payment:received");
    this.off("payment:overdue");
  }

  /**
   * Subscribe to leave events
   */
  subscribeToLeaves(pgType: "boys" | "girls", callback: (data: any) => void): void {
    this.joinRoom(`leaves:${pgType}`);
    this.on("leave:created", callback);
    this.on("leave:approved", callback);
    this.on("leave:rejected", callback);
  }

  /**
   * Unsubscribe from leave events
   */
  unsubscribeFromLeaves(pgType: "boys" | "girls"): void {
    this.leaveRoom(`leaves:${pgType}`);
    this.off("leave:created");
    this.off("leave:approved");
    this.off("leave:rejected");
  }

  /**
   * Subscribe to room updates
   */
  subscribeToRoomUpdates(pgType: "boys" | "girls", callback: (data: any) => void): void {
    this.joinRoom(`rooms:${pgType}`);
    this.on("room:updated", callback);
  }

  /**
   * Unsubscribe from room updates
   */
  unsubscribeFromRoomUpdates(pgType: "boys" | "girls"): void {
    this.leaveRoom(`rooms:${pgType}`);
    this.off("room:updated");
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
