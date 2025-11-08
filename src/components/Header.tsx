import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, User, LogOut, Menu, X, ShoppingBag } from "lucide-react";
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
      <div className="container mx-auto px-4 py-4 bg-[b5edce]">
        <div className="flex items-center justify-center md:justify-between">
          <div className="md:hidden absolute left-4 z-10">
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
                  <Link to="/blogs" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="text-white hover:bg-white/10 font-poppins font-bold text-lg py-6 w-full justify-start border-b border-white/20">Blog</Button>
                  </Link>
                  <Link to="/about" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="text-white hover:bg-white/10 font-poppins font-bold text-lg py-6 w-full justify-start border-b border-white/20">About Us</Button>
                  </Link>
                  {user ? (
                    <>
                      <Link to="/orders" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="text-white hover:bg-white/10 font-poppins font-bold text-lg py-6 w-full justify-start border-b border-white/20">My Orders</Button>
                      </Link>
                      <Link to="/profile" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="text-white hover:bg-white/10 font-poppins font-bold text-lg py-6 w-full justify-start border-b border-white/20">Profile</Button>
                      </Link>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="text-white hover:bg-white/10 font-poppins font-bold text-lg py-6 w-full justify-start border-b border-white/20">Sign In</Button>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <div className="md:hidden absolute right-4 z-10 flex items-center gap-2">
            {user && (
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            )}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>
          <div className="flex items-center md:justify-start">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Freelit" className="h-12" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/products">
              <Button variant="ghost" className="bg-white hover:bg-[#b5edce]/50 font-poppins font-bold">Products</Button>
            </Link>
            <Link to="/blogs">
              <Button variant="ghost" className="bg-white hover:bg-[#b5edce]/50 font-poppins font-bold">Blog</Button>
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

            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : null}

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
