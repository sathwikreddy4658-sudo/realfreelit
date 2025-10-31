import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { profileSchema } from "@/lib/validation";
import { sanitizeError } from "@/lib/errorUtils";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });

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

    if (data) {
      setProfile(data);
      setFormData({
        name: data.name,
        email: data.email,
        address: data.address,
      });
    }
  };

  const handleSave = async () => {
    // Validate profile data
    const validationResult = profileSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation failed",
        description: firstError.message,
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update(validationResult.data)
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Update failed",
        description: sanitizeError(error),
        variant: "destructive"
      });
    } else {
      toast({ title: "Profile updated successfully" });
      setEditing(false);
      fetchProfile(user.id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Card className="p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            {editing ? (
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            ) : (
              <p className="mt-1">{profile?.name}</p>
            )}
          </div>

          <div>
            <Label>Email</Label>
            {editing ? (
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            ) : (
              <p className="mt-1">{profile?.email}</p>
            )}
          </div>

          <div>
            <Label>Address</Label>
            {editing ? (
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            ) : (
              <p className="mt-1">{profile?.address}</p>
            )}
          </div>

          <div className="flex gap-2">
            {editing ? (
              <>
                <Button onClick={handleSave} className="font-poppins font-bold">Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)} className="font-poppins font-bold">
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)} className="font-poppins font-bold">Edit Profile</Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
