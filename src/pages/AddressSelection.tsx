import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MapPin, Edit, Plus } from "lucide-react";
import AddressForm from "@/components/AddressForm";

const AddressSelection = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const handleAddressSubmit = async (address: string) => {
    if (!user) return;

    setSavingAddress(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ address })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Address saved successfully!");
      setShowAddressForm(false);
      fetchProfile(user.id);
    } catch (error: any) {
      toast.error("Failed to save address: " + error.message);
    } finally {
      setSavingAddress(false);
    }
  };

  const proceedToCheckout = () => {
    if (!profile?.address) {
      toast.error("Please add a delivery address first");
      return;
    }
    navigate("/checkout");
  };

  if (showAddressForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setShowAddressForm(false)}
            className="mb-4"
          >
            ← Back to Address Selection
          </Button>
        </div>
        <AddressForm
          onAddressSubmit={handleAddressSubmit}
          initialAddress={profile?.address}
          isLoading={savingAddress}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Select Delivery Address</h1>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Current Address */}
        {profile?.address ? (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Current Delivery Address
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{profile.name}</p>
                <p className="text-muted-foreground">{profile.email}</p>
                <p className="mt-2">{profile.address}</p>
              </div>
              <Button
                onClick={proceedToCheckout}
                className="w-full mt-4 font-poppins font-bold"
              >
                Deliver to this address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No delivery address found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Please add a delivery address to proceed with your order
              </p>
              <Button
                onClick={() => setShowAddressForm(true)}
                className="flex items-center gap-2 font-poppins font-bold"
              >
                <Plus className="h-4 w-4" />
                Add Delivery Address
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add New Address Option */}
        {profile?.address && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Plus className="h-8 w-8 text-gray-400 mb-2" />
              <Button
                variant="outline"
                onClick={() => setShowAddressForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Address
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddressSelection;
