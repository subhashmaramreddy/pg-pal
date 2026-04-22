import { useEffect, useCallback } from "react";
import socketService from "@/services/socket";

/**
 * Hook to manage socket connection
 */
export const useSocket = () => {
  useEffect(() => {
    const connect = async () => {
      try {
        await socketService.connect();
      } catch (error) {
        console.error("Failed to connect socket:", error);
      }
    };

    connect();

    return () => {
      // Don't disconnect on unmount to keep connection alive across pages
      // socketService.disconnect();
    };
  }, []);

  return socketService;
};

/**
 * Hook to listen to socket events
 */
export const useSocketEvent = (
  event: string,
  callback: (...args: any[]) => void,
  dependencies: any[] = []
) => {
  useEffect(() => {
    const socket = socketService.getSocket();
    if (socket?.connected) {
      socket.on(event, callback);
    }

    return () => {
      socket?.off(event, callback);
    };
  }, [event, callback, ...dependencies]);
};

/**
 * Hook to subscribe to joiner events
 */
export const useJoinersSubscription = (
  pgType: "boys" | "girls",
  callback: (data: any) => void
) => {
  useEffect(() => {
    socketService.subscribeToJoiners(pgType, callback);
    return () => {
      socketService.unsubscribeFromJoiners(pgType);
    };
  }, [pgType, callback]);
};

/**
 * Hook to subscribe to tenant events
 */
export const useTenantsSubscription = (
  pgType: "boys" | "girls",
  callback: (data: any) => void
) => {
  useEffect(() => {
    socketService.subscribeToTenants(pgType, callback);
    return () => {
      socketService.unsubscribeFromTenants(pgType);
    };
  }, [pgType, callback]);
};

/**
 * Hook to subscribe to payment events
 */
export const usePaymentsSubscription = (
  pgType: "boys" | "girls",
  callback: (data: any) => void
) => {
  useEffect(() => {
    socketService.subscribeToPayments(pgType, callback);
    return () => {
      socketService.unsubscribeFromPayments(pgType);
    };
  }, [pgType, callback]);
};

/**
 * Hook to subscribe to leave events
 */
export const useLeavesSubscription = (
  pgType: "boys" | "girls",
  callback: (data: any) => void
) => {
  useEffect(() => {
    socketService.subscribeToLeaves(pgType, callback);
    return () => {
      socketService.unsubscribeFromLeaves(pgType);
    };
  }, [pgType, callback]);
};

/**
 * Hook to subscribe to room updates
 */
export const useRoomUpdatesSubscription = (
  pgType: "boys" | "girls",
  callback: (data: any) => void
) => {
  useEffect(() => {
    socketService.subscribeToRoomUpdates(pgType, callback);
    return () => {
      socketService.unsubscribeFromRoomUpdates(pgType);
    };
  }, [pgType, callback]);
};
