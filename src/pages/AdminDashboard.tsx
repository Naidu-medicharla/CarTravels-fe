import React, { useState } from 'react';
import { 
  LayoutDashboard, Car, Users, CalendarCheck, IndianRupee, Settings, LogOut, 
  TrendingUp, Activity, Bell
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Fleet Management', icon: Car },
    { name: 'Bookings', icon: CalendarCheck },
    { name: 'Customers', icon: Users },
    { name: 'Payments', icon: IndianRupee },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-white/5 flex flex-col pt-6">
        <div className="px-6 mb-10">
          <h2 className="font-heading font-bold text-2xl text-white">Luxe<span className="text-primary">Admin</span></h2>
          <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1 block">Control Panel</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]' 
                  : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <Icon size={18} /> {item.name}
              </button>
            )
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-background/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-10 sticky top-0">
          <h1 className="font-heading font-bold text-2xl text-white">{activeTab}</h1>
          
          <div className="flex items-center gap-6">
            <button className="relative text-muted-foreground hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-primary font-bold text-xs">AD</span>
              </div>
              <span className="text-sm font-medium text-white">System Admin</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {[
              { title: "Today's Bookings", val: "12", icon: CalendarCheck, trend: "+2", good: true },
              { title: "Revenue (Today)", val: "₹1,45,000", icon: IndianRupee, trend: "+14%", good: true },
              { title: "Active Fleet", val: "48 / 60", icon: Car, trend: "-1", good: false },
              { title: "New Customers", val: "5", icon: Users, trend: "+5", good: true },
            ].map((stat, i) => (
              <Card key={i} className="glass-panel p-6 rounded-2xl border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                    <stat.icon size={20} className="text-primary" />
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded bg-black/40 ${stat.good ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.val}</h3>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.title}</span>
              </Card>
            ))}
          </div>

          {/* Charts & Tables placeholder */}
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 glass-panel p-6 rounded-2xl border-white/5 min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading font-bold text-xl text-white flex items-center gap-2"><TrendingUp size={18} className="text-primary"/> Revenue Overview</h3>
                <select className="bg-black/40 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg outline-none">
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="flex-1 flex items-center justify-center text-muted-foreground border border-white/5 rounded-xl bg-black/20 border-dashed">
                [ Revenue Chart Placeholder ]
              </div>
            </Card>

            <Card className="glass-panel p-6 rounded-2xl border-white/5 min-h-[400px] flex flex-col">
              <h3 className="font-heading font-bold text-xl text-white flex items-center gap-2 mb-6"><Activity size={18} className="text-primary"/> Live Activity</h3>
              <div className="flex-1 space-y-4">
                {[
                  { text: "Booking #492 completed", time: "2m ago" },
                  { text: "New user registered", time: "15m ago" },
                  { text: "Payment ₹35k received", time: "1h ago" },
                  { text: "Fleet maintenance alert", time: "3h ago" },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-white">{log.text}</p>
                      <span className="text-xs text-muted-foreground">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
};
