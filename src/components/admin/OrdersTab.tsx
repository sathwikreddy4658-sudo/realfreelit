import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const OrdersTab = () => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("admin-orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*),
        profiles (name, email)
      `)
      .order("created_at", { ascending: false });

    if (data) setOrders(data);
  };

  const handleStatusChange = async (orderId: string, newStatus: "pending" | "shipped" | "delivered" | "cancelled") => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Status update failed", variant: "destructive" });
    } else {
      toast({ title: "Order status updated" });
      fetchOrders();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "shipped":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Orders Management</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID: {order.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">
                  Date: {new Date(order.created_at).toLocaleDateString()}
                </p>
                <p className="font-semibold mt-2">{order.profiles?.name}</p>
                <p className="text-sm">{order.profiles?.email}</p>
                <p className="text-sm mt-1">{order.address}</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Status:</span>
                  <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                </div>
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusChange(order.id, value as "pending" | "shipped" | "delivered" | "cancelled")}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              <div className="space-y-1">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>₹{item.product_price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total:</span>
                <span>₹{order.total_price}</span>
              </div>
              {order.payment_id && (
                <p className="text-xs text-muted-foreground mt-2">
                  Payment ID: {order.payment_id}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersTab;
