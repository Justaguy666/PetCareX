import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ShoppingBag, Calendar, Heart, Zap, Gift, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { Order, LoyaltyAccount, Pet, Appointment } from "@shared/types";

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!user) return;

    // Load orders
    const allOrders = JSON.parse(localStorage.getItem("petcare_orders") || "[]");
    const customerOrders = allOrders.filter((o: Order) => o.customerId === user.id);
    setOrders(customerOrders);

    // Load loyalty account
    const loyaltyAccounts = JSON.parse(localStorage.getItem("petcare_loyalty") || "[]");
    const customerLoyalty = loyaltyAccounts.find(
      (l: LoyaltyAccount) => l.customerId === user.id
    );
    setLoyalty(customerLoyalty);

    // Load pets
    const allPets = JSON.parse(localStorage.getItem("petcare_pets") || "[]");
    const customerPets = allPets.filter((p: Pet) => p.customerId === user.id);
    setPets(customerPets);

    // Load appointments
    const allAppointments = JSON.parse(localStorage.getItem("petcare_appointments") || "[]");
    const customerAppointments = allAppointments.filter(
      (a: Appointment) => a.customerId === user.id && a.status !== "cancelled"
    );
    setAppointments(customerAppointments.slice(0, 3)); // Show last 3
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "text-amber-600";
      case "silver":
        return "text-gray-400";
      case "gold":
        return "text-yellow-500";
      default:
        return "text-primary";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "🥉";
      case "silver":
        return "🥈";
      case "gold":
        return "🥇";
      default:
        return "⭐";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Welcome back, {user?.fullName}! 👋
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage your pets, appointments, and shop for pet supplies
                </p>
              </div>
              <Link to="/profile">
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <Card className="p-6 border border-border bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{orders.length}</p>
                </div>
                <ShoppingBag className="w-10 h-10 text-primary opacity-30" />
              </div>
            </Card>

            <Card className="p-6 border border-border bg-secondary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Your Pets</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{pets.length}</p>
                </div>
                <Heart className="w-10 h-10 text-secondary opacity-30" />
              </div>
            </Card>

            <Card className="p-6 border border-border bg-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Appointments</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{appointments.length}</p>
                </div>
                <Calendar className="w-10 h-10 text-blue-600 opacity-30" />
              </div>
            </Card>

            <Card className="p-6 border border-border bg-yellow-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Loyalty Points</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{loyalty?.points || 0}</p>
                </div>
                <Gift className="w-10 h-10 text-yellow-600 opacity-30" />
              </div>
            </Card>
          </div>

          {/* Loyalty & Pets Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Loyalty Card */}
            <Card className="p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Loyalty Tier</h2>
                <span className="text-3xl">{loyalty ? getTierIcon(loyalty.tier) : "⭐"}</span>
              </div>

              {loyalty ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Tier</p>
                    <p className={`text-2xl font-bold capitalize ${getTierColor(loyalty.tier)}`}>
                      {loyalty.tier}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Points</p>
                    <p className="text-2xl font-bold text-primary">{loyalty.points}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                    <p className="font-medium text-foreground">
                      {formatPrice(loyalty.totalSpent)}
                    </p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Discount Rate</p>
                    <p className="text-lg font-bold text-primary">
                      {loyalty.tier === "bronze"
                        ? "5%"
                        : loyalty.tier === "silver"
                          ? "10%"
                          : "15%"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading loyalty info...</p>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/store">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white justify-start">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Shop Now
                  </Button>
                </Link>
                <Link to="/appointments">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
                <Link to="/orders">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                </Link>
                <Link to="/vaccinations">
                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="w-4 h-4 mr-2" />
                    Vaccinations
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Pets Summary */}
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-6">Your Pets</h2>
              {pets.length > 0 ? (
                <div className="space-y-3">
                  {pets.map((pet) => (
                    <div
                      key={pet.id}
                      className="p-3 bg-primary/5 rounded-lg border border-primary/10"
                    >
                      <p className="font-medium text-foreground">{pet.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {pet.type} • {pet.breed}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{pet.age} years old</p>
                    </div>
                  ))}
                  <Link to="/profile">
                    <Button variant="outline" className="w-full mt-3">
                      Manage Pets
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-3">No pets added yet</p>
                  <Link to="/profile">
                    <Button variant="outline">Add Pet</Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Upcoming Appointments */}
          {appointments.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Appointments</h2>
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <Card key={apt.id} className="p-6 border border-border">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {apt.reasonForVisit || "Appointment"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(apt.appointmentDate)} at {apt.appointmentTime}
                        </p>
                      </div>
                      <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                        {apt.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {orders.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Recent Orders</h2>
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <Card key={order.id} className="p-6 border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Order #{order.id.slice(-4)}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(order.createdAt)} • {order.items.length} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(order.total)}
                        </p>
                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Link to="/orders">
                <Button variant="outline" className="w-full mt-6">
                  View All Orders
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
