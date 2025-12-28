import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Heart, Calendar, Gift, Package, User, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { getMembershipDisplay, DEFAULT_MEMBERSHIP_LEVEL } from "@/lib/membershipUtils";
import { apiGet } from "@/api/api";

export default function CustomerDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "customer") {
    return <Navigate to="/login" />;
  }

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard stats from backend
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      try {
        const response = await apiGet('/dashboard/stats');
        setDashboardData(response?.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-lg" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalOrders: 0,
    totalPets: 0,
    upcomingAppointments: 0,
    loyaltyPoints: 0
  };

  const loyaltyTier = {
    tier: user.membershipLevel || DEFAULT_MEMBERSHIP_LEVEL,
    points: stats.loyaltyPoints,
    nextTier: user.membershipLevel === "Cơ bản" ? "Thân thiết" : "VIP",
    pointsToNext: user.membershipLevel === "VIP" ? 0 : 500 - (stats.loyaltyPoints % 500),
    discount: user.membershipLevel === "VIP" ? 15 : (user.membershipLevel === "Thân thiết" ? 10 : 0)
  };

  const summaryCards = [
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-blue-600" },
    { title: "My Pets", value: stats.totalPets, icon: Heart, color: "text-pink-600" },
    { title: "Upcoming Appointments", value: stats.upcomingAppointments, icon: Calendar, color: "text-green-600" },
    { title: "Loyalty Points", value: stats.loyaltyPoints, icon: Gift, color: "text-purple-600" },
  ];

  const recentOrders = dashboardData?.recentOrders || [];
  const upcomingAppointments = dashboardData?.upcomingAppointments || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section - Sales Style */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.fullName}!</h1>
          <p className="text-blue-100 text-lg">Manage your pets, appointments, and orders all in one place</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Loyalty Status Card */}
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Membership: {getMembershipDisplay(loyaltyTier.tier)}</CardTitle>
                  <CardDescription>
                    Upgraded automatically based on yearly spending
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{loyaltyTier.points}</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(loyaltyTier.points / 500) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-sm font-medium text-primary">{loyaltyTier.discount}% discount</div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/appointments?tab=book">
              <button className="w-full bg-primary text-white px-4 py-3 rounded-md hover:bg-primary/90 transition">
                Book Appointment
              </button>
            </Link>
            <Link to="/shop">
              <button className="w-full border border-border px-4 py-3 rounded-md hover:bg-accent transition">
                Browse Products
              </button>
            </Link>
            <Link to="/medical-history">
              <button className="w-full border border-border px-4 py-3 rounded-md hover:bg-accent transition">
                Medical History
              </button>
            </Link>
            <Link to="/profile">
              <button className="w-full border border-border px-4 py-3 rounded-md hover:bg-accent transition">
                Manage Pets
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled veterinary visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <div>
                      <p className="font-medium">{appointment.service_type} - {appointment.pet_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.appointment_time).toLocaleDateString(undefined, {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">with {appointment.doctor_name}</p>
                      <div className="mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${appointment.status === 'Đã xác nhận' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
                {upcomingAppointments.length === 0 && (
                  <p className="text-center py-4 text-muted-foreground">No upcoming appointments</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.invoice_id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <div>
                      <p className="font-medium">#{order.invoice_id}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {order.items?.map((i: any) => i.product_name).join(", ")}
                      </p>
                      <p className="text-sm text-blue-600 capitalize">{order.payment_method}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.final_amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <p className="text-center py-4 text-muted-foreground">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
