import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Linkedin, Twitter, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Footer = () => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  return (
    <footer className="border-t mt-auto bg-[#3b2a20] font-poppins font-medium" style={{ color: '#b5edce' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Quote */}
          <div className="flex items-end">
            <p className="text-4xl md:text-5xl font-saira font-black text-white">
              EAT<br />FREEL IT
            </p>
          </div>

          {/* HELP Section */}
          <div className="md:block hidden">
            <h3 className="font-extrabold text-lg mb-4">HELP</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shipping-delivery" className="hover:opacity-80 transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:opacity-80 transition-colors">
                  Refund & Return Policy
                </Link>
              </li>
              <li>
                <Link to="/cash-on-delivery" className="hover:opacity-80 transition-colors">
                  Cash on Delivery Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:opacity-80 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:opacity-80 transition-colors">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:hidden">
            <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full font-extrabold text-lg mb-4">
                HELP
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${helpOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2">
                <div className="border-t border-[#b5edce]/30 pt-2">
                  <Link to="/shipping-delivery" className="block hover:opacity-80 transition-colors py-1">
                    Shipping & Delivery Policy
                  </Link>
                </div>
                <div className="border-t border-[#b5edce]/30 pt-2">
                  <Link to="/refund-policy" className="block hover:opacity-80 transition-colors py-1">
                    Refund & Return Policy
                  </Link>
                </div>
                <div className="border-t border-[#b5edce]/30 pt-2">
                  <Link to="/cash-on-delivery" className="block hover:opacity-80 transition-colors py-1">
                    Cash on Delivery Policy
                  </Link>
                </div>
                <div className="border-t border-[#b5edce]/30 pt-2">
                  <Link to="/privacy-policy" className="block hover:opacity-80 transition-colors py-1">
                    Privacy Policy
                  </Link>
                </div>
                <div className="border-t border-[#b5edce]/30 pt-2">
                  <Link to="/terms" className="block hover:opacity-80 transition-colors py-1">
                    Terms and Conditions
                  </Link>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* LINKS Section */}
          <div className="md:block hidden">
            <h3 className="font-extrabold text-lg mb-4">LINKS</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:opacity-80 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:opacity-80 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:opacity-80 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:opacity-80 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:hidden">
            <Collapsible open={linksOpen} onOpenChange={setLinksOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full font-extrabold text-lg mb-4">
                LINKS
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${linksOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2">
                <div className="border-t border-[#b5edce]/30 pt-2">
                  <Link to="/about" className="block hover:opacity-80 transition-colors py-1">
                    About Us
                  </Link>
                </div>
                <div className="border-t border-[#b5edce]/30 pt-2">
                  <Link to="/contact" className="block hover:opacity-80 transition-colors py-1">
                    Contact Us
                  </Link>
                </div>
                <div className="border-t border-[#b5edce]/30 pt-2">
                  <Link to="/profile" className="block hover:opacity-80 transition-colors py-1">
                    My Account
                  </Link>
                </div>
                <div className="border-t border-[#b5edce]/30 pt-2">
                  <Link to="/blog" className="block hover:opacity-80 transition-colors py-1">
                    Blog
                  </Link>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* NEWSLETTER Section */}
          <div className="md:block hidden">
            <h3 className="font-extrabold text-lg mb-4">NEWSLETTER</h3>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border-[#b5edce] text-[#b5edce] placeholder:text-[#b5edce]/70"
              />
              <Button className="w-full bg-[#b5edce] text-[#3b2a20] hover:bg-[#b5edce]/80 font-poppins font-bold">
                Sign Up
              </Button>
            </div>
          </div>
          <div className="md:hidden">
            <Collapsible open={newsletterOpen} onOpenChange={setNewsletterOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full font-extrabold text-lg mb-4">
                NEWSLETTER
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${newsletterOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2">
                <div className="pt-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-transparent border-[#b5edce] text-[#b5edce] placeholder:text-[#b5edce]/70 w-full"
                  />
                </div>
                <div className="pt-2">
                  <Button className="w-full bg-[#b5edce] text-[#3b2a20] hover:bg-[#b5edce]/80 font-poppins font-bold">
                    Sign Up
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* SOCIALs and Copyright */}
          <div>
            {/* SOCIALs Section */}
            <div className="mb-4">
              <h3 className="font-extrabold text-lg mb-4">SOCIALS</h3>
              <div className="flex space-x-4">
                <Link to="#" className="hover:opacity-80 transition-colors">
                  <Instagram size={24} style={{ color: '#b5edce' }} />
                </Link>
                <Link to="#" className="hover:opacity-80 transition-colors">
                  <Linkedin size={24} style={{ color: '#b5edce' }} />
                </Link>
                <Link to="#" className="hover:opacity-80 transition-colors">
                  <Twitter size={24} style={{ color: '#b5edce' }} />
                </Link>
              </div>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm">
                © 2025 Freelit. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
