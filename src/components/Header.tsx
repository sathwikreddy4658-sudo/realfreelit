import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/freelit-logo.svg";

const Header = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="border-b sticky top-0 bg-background z-50">
      <div className="container mx-auto pl-0 pr-4 py-4 bg-[b5edce]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-8 w-8 text-[#b5edce]" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-black/25 border-0">
                  <div className="flex justify-end mb-4">
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <nav className="flex flex-col gap-0">
                    <Link to="/products" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="text-white hover:bg-white/10 font-poppins font-bold text-lg py-6 w-full justify-start border-b border-white/20">Products</Button>
                    </Link>
                    <Link to="/about" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="text-white hover:bg-white/10 font-poppins font-bold text-lg py-6 w-full justify-start border-b border-white/20">About Us</Button>
                    </Link>
                    {user ? (
                      <Link to="/orders" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="text-white hover:bg-white/10 font-poppins font-bold text-lg py-6 w-full justify-start border-b border-white/20">My Orders</Button>
                      </Link>
                    ) : (
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="text-white hover:bg-white/10 font-poppins font-bold text-lg py-6 w-full justify-start border-b border-white/20">Sign In</Button>
                      </Link>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            <Link to="/" className="flex items-center ml-0">
              <img src={logo} alt="Freelit" className="h-12" />
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <Link to="/products">
                <Button variant="ghost" className="bg-white hover:bg-[#b5edce]/50 font-poppins font-bold">Products</Button>
              </Link>
              {user ? (
                <Link to="/orders">
                  <Button variant="ghost" className="bg-white hover:bg-[#b5edce]/50 font-poppins font-bold">My Orders</Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button className="bg-white hover:bg-[#b5edce]/50 font-poppins font-bold">Sign In</Button>
                </Link>
              )}
            </div>

            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
