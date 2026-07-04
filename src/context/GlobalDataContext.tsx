import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api, BASE_URL, DashboardDetailsResponse, AdminBooking, AdminCarOut, AdminUserDetails, UserProfileResponse, TicketOut, NotificationItem } from '../lib/api';

interface GlobalDataContextType {
  isDataLoading: boolean;
  
  // Customer Data
  customerProfile: UserProfileResponse | null;
  setCustomerProfile: React.Dispatch<React.SetStateAction<UserProfileResponse | null>>;
  customerCars: any[];
  setCustomerCars: React.Dispatch<React.SetStateAction<any[]>>;
  customerTickets: TicketOut[];
  setCustomerTickets: React.Dispatch<React.SetStateAction<TicketOut[]>>;

  // Notifications
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  
  // Admin Data
  adminDashboardData: DashboardDetailsResponse | null;
  adminBookings: AdminBooking[];
  setAdminBookings: React.Dispatch<React.SetStateAction<AdminBooking[]>>;
  adminCars: AdminCarOut[];
  setAdminCars: React.Dispatch<React.SetStateAction<AdminCarOut[]>>;
  adminUsers: AdminUserDetails[];
  setAdminUsers: React.Dispatch<React.SetStateAction<AdminUserDetails[]>>;
  adminTickets: any[];
  setAdminTickets: React.Dispatch<React.SetStateAction<any[]>>;
  
  refreshGlobalData: () => Promise<void>;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

export const GlobalDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [customerProfile, setCustomerProfile] = useState<UserProfileResponse | null>(null);
  const [customerCars, setCustomerCars] = useState<any[]>([]);
  const [customerTickets, setCustomerTickets] = useState<TicketOut[]>([]);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [adminDashboardData, setAdminDashboardData] = useState<DashboardDetailsResponse | null>(null);
  const [adminBookings, setAdminBookings] = useState<AdminBooking[]>([]);
  const [adminCars, setAdminCars] = useState<AdminCarOut[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserDetails[]>([]);
  const [adminTickets, setAdminTickets] = useState<any[]>([]);

  const fetchAllData = async () => {
    if (!isLoggedIn || !user) {
      // Clear data on logout
      setCustomerProfile(null);
      setCustomerCars([]);
      setCustomerTickets([]);
      setNotifications([]);
      setUnreadCount(0);
      setAdminDashboardData(null);
      setAdminBookings([]);
      setAdminCars([]);
      setAdminUsers([]);
      setAdminTickets([]);
      return;
    }

    setIsDataLoading(true);
    const token = localStorage.getItem('auth_token') || '';

    try {
      if (user.role?.toUpperCase() === 'ADMIN') {
        // Fetch all admin data in parallel for speed
        const [dash, bookings, cars, users, tickets, notifs] = await Promise.all([
          api.getDashboardDetails(token).catch(() => null),
          api.getAdminBookings(token).catch(() => []),
          api.getAdminCars(token).catch(() => []),
          api.getAdminUsersDetails(token).catch(() => []),
          api.getAdminTickets(token).catch(() => []),
          api.getMyNotifications(token).catch(() => [])
        ]);

        setAdminDashboardData(dash);
        setAdminBookings(bookings);
        setAdminCars(cars);
        setAdminUsers(users);
        setAdminTickets(tickets);
        if (notifs && Array.isArray(notifs)) {
          setNotifications(notifs);
          setUnreadCount(notifs.filter((n: NotificationItem) => !n.is_read).length);
        }
      } else {
        // Fetch customer data
        const promises: Promise<any>[] = [
          api.getAllCars(token).catch(() => []),
          api.getMyTickets(token).catch(() => []),
          api.getMyNotifications(token).catch(() => [])
        ];
        
        if (user.email) {
          promises.push(api.getCustomerProfile(user.email).catch(() => null));
        }

        const [cars, tickets, notifs, profile] = await Promise.all(promises);
        setCustomerCars(cars);
        setCustomerTickets(tickets);
        if (profile) setCustomerProfile(profile);
        if (notifs && Array.isArray(notifs)) {
          setNotifications(notifs);
          setUnreadCount(notifs.filter((n: NotificationItem) => !n.is_read).length);
        }
      }
    } catch (e) {
      console.error("Failed to fetch global data", e);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user, isLoggedIn]);

  // Setup Notification SSE Stream
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    let isActive = true;
    const controller = new AbortController();

    const connectStream = async () => {
      if (!isActive) return;
      try {
        const response = await fetch(`${BASE_URL || 'http://localhost:8000'}/notification/stream`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/event-stream',
            'ngrok-skip-browser-warning': 'true',
            'Bypass-Tunnel-Reminder': 'true'
          },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (isActive) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const incoming: NotificationItem[] = JSON.parse(line.slice(6));
              if (incoming.length > 0) {
                setNotifications(prev => {
                  // Filter out duplicates just in case
                  const newItems = incoming.filter(newInc => !prev.find(p => p.id === newInc.id));
                  return [...newItems, ...prev];
                });
                setUnreadCount(prev => prev + incoming.length);
              }
            } catch {
              // ignore malformed JSON
            }
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        if (isActive) {
          setTimeout(connectStream, 3000);
        }
      }
    };

    connectStream();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [user, isLoggedIn]);

  return (
    <GlobalDataContext.Provider value={{
      isDataLoading,
      customerProfile, setCustomerProfile,
      customerCars, setCustomerCars,
      customerTickets, setCustomerTickets,
      notifications, setNotifications,
      unreadCount, setUnreadCount,
      adminDashboardData,
      adminBookings, setAdminBookings,
      adminCars, setAdminCars,
      adminUsers, setAdminUsers,
      adminTickets, setAdminTickets,
      refreshGlobalData: fetchAllData
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useGlobalData = (): GlobalDataContextType => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider');
  }
  return context;
};
