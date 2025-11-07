import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { addressSchema } from "@/lib/validation";
import { toast } from "sonner";

interface AddressFormProps {
  onAddressSubmit: (address: string) => void;
  initialAddress?: string;
  isLoading?: boolean;
}

const AddressForm = ({ onAddressSubmit, initialAddress, isLoading }: AddressFormProps) => {
  const [formData, setFormData] = useState({
    flat_no: "",
    building_name: "",
    street_address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });


  // Parse initial address if provided
  useEffect(() => {
    if (initialAddress) {
      // Try to parse the existing address format
      const parts = initialAddress.split(', ');
      if (parts.length >= 4) {
        setFormData(prev => ({
          ...prev,
          flat_no: "",
          building_name: "",
          street_address: parts[0] || prev.street_address,
          city: parts[1] || prev.city,
          state: parts[2] || prev.state,
          pincode: parts[3]?.replace(/\D/g, '') || prev.pincode,
          landmark: parts[4] || prev.landmark,
        }));
      }
    }
  }, [initialAddress]);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validationResult = addressSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    // Format address
    const addressParts = [
      formData.flat_no && formData.building_name
        ? `${formData.flat_no}, ${formData.building_name}`
        : formData.flat_no || formData.building_name,
      formData.street_address,
      formData.city,
      formData.state,
      formData.pincode,
      formData.landmark,
    ].filter(Boolean);

    const formattedAddress = addressParts.join(", ");

    onAddressSubmit(formattedAddress);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Delivery Address
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flat_no">Flat/House Number (Optional)</Label>
              <Input
                id="flat_no"
                type="text"
                value={formData.flat_no}
                onChange={(e) => handleInputChange("flat_no", e.target.value)}
                placeholder="e.g., 101, A-101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="building_name">Building/Apartment Name (Optional)</Label>
              <Input
                id="building_name"
                type="text"
                value={formData.building_name}
                onChange={(e) => handleInputChange("building_name", e.target.value)}
                placeholder="e.g., Green Valley Apartments"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="street_address">Street Address *</Label>
            <Textarea
              id="street_address"
              value={formData.street_address}
              onChange={(e) => handleInputChange("street_address", e.target.value)}
              placeholder="Street name, area, locality"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                type="text"
                value={formData.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value)}
                placeholder="6-digit pincode"
                maxLength={6}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              type="text"
              value={formData.landmark}
              onChange={(e) => handleInputChange("landmark", e.target.value)}
              placeholder="e.g., Near XYZ mall, Opposite ABC hospital"
            />
          </div>



          <Button
            type="submit"
            className="w-full font-poppins font-bold"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Address & Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddressForm;
