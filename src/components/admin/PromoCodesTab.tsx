import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PromoCode {
  id: string;
  code: string;
  discount_percentage: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  usage_limit: number | null;
  usage_count: number;
}

const PromoCodesTab = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discount_percentage: "",
    usage_limit: "",
  });

  const fetchPromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      toast.error("Failed to fetch promo codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const discount = parseFloat(formData.discount_percentage);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      toast.error("Discount percentage must be between 1 and 100");
      return;
    }

    const usageLimit = formData.usage_limit ? parseInt(formData.usage_limit) : null;
    if (usageLimit !== null && (isNaN(usageLimit) || usageLimit <= 0)) {
      toast.error("Usage limit must be a positive number");
      return;
    }

    try {
      if (editingCode) {
        const { error } = await supabase
          .from("promo_codes")
          .update({
            code: formData.code.toUpperCase(),
            discount_percentage: discount,
            usage_limit: usageLimit,
          })
          .eq("id", editingCode.id);

        if (error) throw error;
        toast.success("Promo code updated successfully");
      } else {
        const { error } = await supabase
          .from("promo_codes")
          .insert({
            code: formData.code.toUpperCase(),
            discount_percentage: discount,
            usage_limit: usageLimit,
          });

        if (error) throw error;
        toast.success("Promo code created successfully");
      }

      setFormData({ code: "", discount_percentage: "", usage_limit: "" });
      setShowForm(false);
      setEditingCode(null);
      fetchPromoCodes();
    } catch (error: any) {
      console.error("Error saving promo code:", error);
      if (error.code === "23505") {
        toast.error("Promo code already exists");
      } else {
        toast.error("Failed to save promo code");
      }
    }
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingCode(promoCode);
    setFormData({
      code: promoCode.code,
      discount_percentage: promoCode.discount_percentage.toString(),
      usage_limit: promoCode.usage_limit?.toString() || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;

    try {
      const { error } = await supabase
        .from("promo_codes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Promo code deleted successfully");
      fetchPromoCodes();
    } catch (error) {
      console.error("Error deleting promo code:", error);
      toast.error("Failed to delete promo code");
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("promo_codes")
        .update({ active })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Promo code ${active ? "activated" : "deactivated"}`);
      fetchPromoCodes();
    } catch (error) {
      console.error("Error updating promo code:", error);
      toast.error("Failed to update promo code");
    }
  };

  const resetForm = () => {
    setFormData({ code: "", discount_percentage: "", usage_limit: "" });
    setEditingCode(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading promo codes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Promo Codes</h2>
        <Button onClick={() => setShowForm(true)} className="font-poppins font-bold">
          <Plus className="mr-2 h-4 w-4" />
          Add Promo Code
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCode ? "Edit Promo Code" : "Add New Promo Code"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Promo Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount Percentage</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="100"
                    step="0.01"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    placeholder="10.00"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="usage_limit">Usage Limit (optional)</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  min="1"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Maximum number of times this promo code can be used. Leave empty for unlimited usage.
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="font-poppins font-bold">
                  {editingCode ? "Update" : "Create"} Promo Code
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Usage Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map((promoCode) => (
                <TableRow key={promoCode.id}>
                  <TableCell className="font-mono font-bold">{promoCode.code}</TableCell>
                  <TableCell>{promoCode.discount_percentage}%</TableCell>
                  <TableCell>{promoCode.usage_count}</TableCell>
                  <TableCell>{promoCode.usage_limit || "Unlimited"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={promoCode.active}
                        onCheckedChange={(checked) => toggleActive(promoCode.id, checked)}
                      />
                      <Badge variant={promoCode.active ? "default" : "secondary"}>
                        {promoCode.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(promoCode.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(promoCode)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(promoCode.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {promoCodes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No promo codes found. Create your first promo code to get started.
        </div>
      )}
    </div>
  );
};

export default PromoCodesTab;
