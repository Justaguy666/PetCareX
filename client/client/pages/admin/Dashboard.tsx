import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, DollarSign, Users, TrendingUp } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiGet } from "@/api/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Fetch dashboard stats on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiGet('/dashboard/stats');
        if (mounted) {
          setDashboardData(response?.data);
        }
      } catch (e: any) {
        console.error('Failed to load admin data', e);
        if (mounted) setError(e?.message || 'Failed to load data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const stats = dashboardData?.stats || {
    todayAppointments: 0,
    totalAppointments: 0,
    totalInvoices: 0,
    totalRevenue: 0
  };

  const chartData = dashboardData?.chartData || [];
  const appointments = dashboardData?.recentAppointments || [];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard overview</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.fullName}! Here's your hospital overview.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Today's Appointments</p>
                <p className="text-3xl font-bold text-foreground mt-2">{loading ? '—' : stats.todayAppointments}</p>
              </div>
              <Calendar className="w-12 h-12 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Appointments</p>
                <p className="text-3xl font-bold text-foreground mt-2">{loading ? '—' : stats.totalAppointments}</p>
              </div>
              <Users className="w-12 h-12 text-secondary/20" />
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Invoices</p>
                <p className="text-3xl font-bold text-foreground mt-2">{loading ? '—' : stats.totalInvoices}</p>
              </div>
              <DollarSign className="w-12 h-12 text-destructive/20" />
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground mt-2">{loading ? '—' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500/20" />
            </div>
          </Card>
        </div>

        {/* Small per-day appointments chart (last 7 days) */}
        <div className="mb-8">
          <Card className="p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Appointments (last 7 days)</h2>
            {loading ? (
              <div className="text-center py-8">Loading chart...</div>
            ) : error ? (
              <div className="text-destructive py-4">{error}</div>
            ) : (
              <div className="flex items-end gap-2 h-32">
                {chartData.map((d: any) => {
                  const max = Math.max(...chartData.map((p: any) => p.count), 1);
                  const height = Math.round((d.count / max) * 100);
                  return (
                    <div key={d.date} className="flex-1 text-center">
                      <div className="mx-auto bg-primary/60 rounded-b" style={{ height: `${height}%`, width: '100%' }} />
                      <div className="text-xs mt-2">{new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                      <div className="text-xs text-muted-foreground">{d.count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Recent Appointments</h2>
          {appointments.length === 0 ? (
            <p className="text-muted-foreground">No appointments yet</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt: any) => (
                <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Appointment #{apt.id} - {apt.pet_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(apt.appointment_time))}
                    </p>
                    <p className="text-sm text-muted-foreground">Customer: {apt.customer_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${apt.status === 'Đã xác nhận' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
