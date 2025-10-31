import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

const AnalyticsTab = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    soldProducts: [] as any[],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data: orders } = await supabase
      .from("orders")
      .select("total_price, status");

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, quantity, product_price");

    if (orders) {
      const completedOrders = orders.filter(o => o.status !== "cancelled");
      setStats({
        totalOrders: completedOrders.length,
        totalRevenue: completedOrders.reduce((sum, o) => sum + o.total_price, 0),
        soldProducts: items || [],
      });
    }
  };

  const productSales = stats.soldProducts.reduce((acc: any, item) => {
    if (!acc[item.product_name]) {
      acc[item.product_name] = { quantity: 0, revenue: 0 };
    }
    acc[item.product_name].quantity += item.quantity;
    acc[item.product_name].revenue += item.quantity * item.product_price;
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Sales Analytics</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">₹{stats.totalRevenue}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Product Sales</h3>
        <div className="space-y-3">
          {Object.entries(productSales).map(([name, data]: [string, any]) => (
            <div key={name} className="flex justify-between items-center pb-3 border-b">
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-muted-foreground">
                  {data.quantity} units sold
                </p>
              </div>
              <p className="font-bold">₹{data.revenue}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
