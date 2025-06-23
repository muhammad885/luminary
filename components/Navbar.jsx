'use client';

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, User, Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import SearchDialog from "./SearchDialog";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { cartItems } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session, status} = useSession();


  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black shadow-lg py-3">
        <div className="container flex justify-between items-center">
          <div className="flex items-center ml-20 gap-4">
            <Link href="/" className="hover:scale-105 transition-all duration-300 cursor-pointer">
              <img 
                src="/logo.png"
                alt="Luminary Logo"
                width={250}
                height={100}
                className="h-10 w-auto"
              />
            </Link>
            <div className="hidden md:block">
              <h1 className="text-2xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#F5D68E] to-[#D4AF37]">
                Luminary Gifts Store
              </h1>
              <p className="text-xs text-white/80 tracking-widest">CURATED LUXURY GIFTS</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-2">
            <Link 
              href="/" 
              className="px-4 py-2 rounded-md bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-all duration-300 cursor-pointer"
            >
              Home
            </Link>
            <Link 
              href="/#products" 
              className="px-4 py-2 rounded-md bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-all duration-300 cursor-pointer"
            >
              Products
            </Link>
            <Link 
              href="/#testimonials" 
              className="px-4 py-2 rounded-md bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-all duration-300 cursor-pointer"
            >
              Testimonials
            </Link>
            <Link 
              href="/#contact" 
              className="px-4 py-2 rounded-md bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-all duration-300 cursor-pointer"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-[#D4AF37] hover:bg-white/10 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-full"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-[#D4AF37] hover:bg-white/10 transition-all duration-300 relative cursor-pointer backdrop-blur-sm rounded-full"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                  {cartItems.length}
                </span>
              )}
            </Button>

            {status === "authenticated" ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-[#D4AF37] hover:bg-white/10 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-full"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:text-[#D4AF37] bg-white/10  cursor-pointer rounded-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : status === "unauthenticated" ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:text-[#D4AF37] hover:bg-white/10 transition-all duration-300 cursor-pointer rounded-full backdrop-blur-sm"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-white text-[#D4AF37] hover:border-[#D4AF37] hover:bg-white/10 hover:text-white transition-all duration-300 cursor-pointer rounded-full backdrop-blur-sm"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            ) : null}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:text-[#D4AF37] hover:bg-white/10 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "fixed inset-0 bg-black/90 backdrop-blur-lg z-40 transition-all duration-500 transform pt-20",
            mobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          )}
        >
          <button
            onClick={closeMobileMenu}
            className="absolute top-4 right-4 p-2 text-white hover:text-[#D4AF37] transition-all duration-300"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>

          <nav className="flex flex-col items-center gap-4 p-8">
            <Link
              href="/"
              className="w-full text-center px-4 py-3 rounded-md bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-all duration-300 cursor-pointer"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link
              href="/#products"
              className="w-full text-center px-4 py-3 rounded-md bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-all duration-300 cursor-pointer"
              onClick={closeMobileMenu}
            >
              Products
            </Link>
            <Link
              href="/#testimonials"
              className="w-full text-center px-4 py-3 rounded-md bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-all duration-300 cursor-pointer"
              onClick={closeMobileMenu}
            >
              Testimonials
            </Link>
            <Link
              href="/#contact"
              className="w-full text-center px-4 py-3 rounded-md bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-all duration-300 cursor-pointer"
              onClick={closeMobileMenu}
            >
              Contact
            </Link>

            {status === "authenticated" ? (
              <div className="flex flex-col items-center space-y-4 mt-4 w-full">
                <Link href="/dashboard" className="w-full" onClick={closeMobileMenu}>
                  <Button
                    className="w-full bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-colors cursor-pointer"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  className="w-full bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-colors cursor-pointer"
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                >
                  Logout
                </Button>
              </div>
            ) : status === "unauthenticated" ? (
              <div className="flex flex-col space-y-4 w-full mt-4">
                <Link href="/auth/login" className="w-full" onClick={closeMobileMenu}>
                  <Button
                    className="w-full bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-colors cursor-pointer"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register" className="w-full" onClick={closeMobileMenu}>
                  <Button className="w-full bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-colors cursor-pointer">
                    Register
                  </Button>
                </Link>
              </div>
            ) : null}
          </nav>
        </div>
      </header>

      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;