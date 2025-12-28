import SalesHeader from "@/components/SalesHeader";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, ShoppingCart, DollarSign } from "lucide-react";
import { mockPetItems } from "@/lib/mockData";

export default function SalesDashboard() {
    const { user } = useAuth();

    if (!user || user.role !== "sales") return <Navigate to="/login" />;

    // Calculate summary statistics
    const totalProducts = mockPetItems.length;
    const lowStockProducts = mockPetItems.filter(item => item.stock < 10).length;
    const medicines = mockPetItems.filter(item => item.category === "medication").length;
    const salesToday = 12; // Mock value

    const summaryCards = [
        { title: "Total Products", value: totalProducts, icon: Package, color: "text-blue-600" },
        { title: "Low Stock Products", value: lowStockProducts, icon: AlertTriangle, color: "text-orange-600" },
        { title: "Medicines", value: medicines, icon: ShoppingCart, color: "text-green-600" },
        { title: "Sales Today", value: salesToday, icon: DollarSign, color: "text-purple-600" },
    ];

    return (
        <div className="min-h-screen bg-background">
            <SalesHeader />
            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg p-8 mb-8">
                    <h1 className="text-4xl font-bold mb-2">Sales Staff Dashboard</h1>
                    <p className="text-blue-100 text-lg">Manage inventory, process sales, and handle customer orders</p>
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

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link to="/sales/inventory">
                            <button className="w-full bg-primary text-white px-4 py-3 rounded-md hover:bg-primary/90 transition">
                                Manage Inventory
                            </button>
                        </Link>
                        <Link to="/sales/sales-page">
                            <button className="w-full border border-border px-4 py-3 rounded-md hover:bg-accent transition">
                                Process Sale
                            </button>
                        </Link>
                        <Link to="/sales/invoice">
                            <button className="w-full border border-border px-4 py-3 rounded-md hover:bg-accent transition">
                                Create Invoice
                            </button>
                        </Link>
                        <Link to="/sales/profile">
                            <button className="w-full border border-border px-4 py-3 rounded-md hover:bg-accent transition">
                                View Profile
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest transactions and inventory updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <p className="font-medium">Sale completed - Order #1234</p>
                                    <p className="text-sm text-muted-foreground">Customer: John Doe</p>
                                </div>
                                <span className="text-sm text-muted-foreground">2 hours ago</span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <p className="font-medium">Stock updated - Premium Dog Food</p>
                                    <p className="text-sm text-muted-foreground">Quantity: +50 units</p>
                                </div>
                                <span className="text-sm text-muted-foreground">5 hours ago</span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <p className="font-medium">Low stock alert - Antibiotic Drops</p>
                                    <p className="text-sm text-red-600">Only 8 units remaining</p>
                                </div>
                                <span className="text-sm text-muted-foreground">1 day ago</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Sale completed - Order #1233</p>
                                    <p className="text-sm text-muted-foreground">Customer: Jane Smith</p>
                                </div>
                                <span className="text-sm text-muted-foreground">1 day ago</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
