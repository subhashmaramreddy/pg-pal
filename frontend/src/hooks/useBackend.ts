import { useEffect, useState, useCallback } from 'react';
import apiClient, { Room, Tenant, Joiner, Payment, DashboardStats } from '@/services/api';
import { toast } from 'sonner';

export const useRooms = (pgType: 'boys' | 'girls') => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getRooms(pgType);
      setRooms(data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch rooms';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [pgType]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { rooms, loading, error, refetch: fetch, setRooms };
};

export const useActiveTenants = (pgType: 'boys' | 'girls') => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getActiveTenants(pgType);
      setTenants(data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch tenants';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [pgType]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { tenants, loading, error, refetch: fetch, setTenants };
};

export const usePendingJoiners = (pgType: 'boys' | 'girls') => {
  const [joiners, setJoiners] = useState<Joiner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getPendingJoiners(pgType);
      setJoiners(data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch joiners';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [pgType]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { joiners, loading, error, refetch: fetch, setJoiners };
};

export const usePayments = (pgType: 'boys' | 'girls') => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getPaymentsByPG(pgType);
      setPayments(data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch payments';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [pgType]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { payments, loading, error, refetch: fetch, setPayments };
};

export const useDashboardStats = (pgType: 'boys' | 'girls') => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getDashboardStats(pgType);
      setStats(data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch dashboard stats';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [pgType]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stats, loading, error, refetch: fetch };
};

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (pgType: 'boys' | 'girls') => {
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await apiClient.connectSocket(token, pgType);
      setConnected(true);
    } catch (err: any) {
      const message = err.message || 'Failed to connect WebSocket';
      setError(message);
      toast.error(message);
    }
  }, []);

  const disconnect = useCallback(() => {
    apiClient.disconnectSocket();
    setConnected(false);
  }, []);

  return { connected, error, connect, disconnect };
};
