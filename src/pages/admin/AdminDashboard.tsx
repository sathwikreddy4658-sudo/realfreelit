import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";
import ProductsTab from "@/components/admin/ProductsTab";
import OrdersTab from "@/components/admin/OrdersTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import PromoCodesTab from "@/components/admin/PromoCodesTab";
import BlogsTab from "@/components/admin/BlogsTab";
import NewsletterTab from "@/components/admin/NewsletterTab";
import CustomerRatingsTab from "@/components/admin/CustomerRatingsTab";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <ProtectedAdminRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout} className="font-poppins font-bold">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="promo-codes">Promo Codes</TabsTrigger>
            <TabsTrigger value="ratings">Customer Ratings</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="blogs">
            <BlogsTab />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="promo-codes">
            <PromoCodesTab />
          </TabsContent>

          <TabsContent value="ratings">
            <CustomerRatingsTab />
          </TabsContent>

          <TabsContent value="newsletter">
            <NewsletterTab />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminDashboard;
