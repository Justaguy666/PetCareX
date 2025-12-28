import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Order } from "@shared/types";
import { useEffect, useState } from "react";
import { apiGet } from "@/api/api";
import { Package, Calendar, DollarSign, ChevronDown } from "lucide-react";

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch orders from backend for authenticated user
        const resp = await apiGet('/me/orders');
        const rows = resp?.data || [];

        // TODO: adjust mapping if backend uses different field names
        const customerOrders = (rows as any[]).map((o) => ({ ...o } as Order));
        customerOrders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(customerOrders);
      } catch (err: any) {
        console.error('Failed to load orders', err);
        setError(err?.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "confirmed":
        return "bg-yellow-100 text-yellow-700";
      case "pending":
        return "bg-gray-100 text-gray-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return "✓";
      case "shipped":
        return "📦";
      case "confirmed":
        return "⏳";
      case "pending":
        return "⏱️";
      case "cancelled":
        return "��";
      default:
        return "•";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">Order History</h1>
            <p className="text-lg text-muted-foreground">
              View and track all your orders
            </p>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="border border-border overflow-hidden"
                >
                  {/* Order Header */}
                  <button
                    onClick={() =>
                      setExpandedOrder(expandedOrder === order.id ? null : order.id)
                    }
                    className="w-full p-6 hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-grow">
                      {/* Order Icon */}
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>

                      {/* Order Info */}
                      <div className="text-left">
                        <h3 className="font-semibold text-foreground">
                          Order #{order.id.slice(-6)}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Price and Status */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {formatPrice(order.total)}
                        </p>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)} {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform ml-4 flex-shrink-0 ${expandedOrder === order.id ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Order Details */}
                  {expandedOrder === order.id && (
                    <div className="border-t border-border p-6 bg-gray-50">
                      {/* Items */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-foreground mb-4">Order Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-border"
                            >
                              <div>
                                <p className="font-medium text-foreground">{item.itemName}</p>
                                <p className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold text-foreground">
                                {formatPrice(item.total)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="mb-6 p-4 bg-white rounded-lg border border-border">
                        <h4 className="font-semibold text-foreground mb-3">Price Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span>{formatPrice(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax (10%):</span>
                            <span>{formatPrice(order.tax)}</span>
                          </div>
                          {order.loyaltyDiscount > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                              <span>Loyalty Discount:</span>
                              <span>-{formatPrice(order.loyaltyDiscount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-border">
                            <span className="font-semibold text-foreground">Total:</span>
                            <span className="font-bold text-primary">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Loyalty Points */}
                      {order.loyaltyPointsApplied > 0 && (
                        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm">
                            <span className="font-semibold text-foreground">
                              Loyalty Points Earned:
                            </span>
                            <span className="text-primary font-bold ml-2">
                              +{order.loyaltyPointsApplied}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Order Timeline */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-foreground mb-3">Order Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-muted-foreground">
                              Order confirmed on {formatDate(order.createdAt)}
                            </span>
                          </div>
                          {order.status === "shipped" || order.status === "delivered" ? (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600">📦</span>
                              <span className="text-muted-foreground">
                                Order shipped
                              </span>
                            </div>
                          ) : null}
                          {order.status === "delivered" && order.deliveryDate ? (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">✓</span>
                              <span className="text-muted-foreground">
                                Delivered on {formatDate(order.deliveryDate)}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-border">
                        {order.status === "delivered" && (
                          <Button variant="outline" className="flex-1">
                            Reorder
                          </Button>
                        )}
                        <Button variant="outline" className="flex-1">
                          Download Invoice
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border border-border">
              <Package className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-30" />
              <h2 className="text-2xl font-bold text-foreground mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground mb-8">
                Start shopping to create your first order
              </p>
              <Link to="/store">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Shop Now
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
