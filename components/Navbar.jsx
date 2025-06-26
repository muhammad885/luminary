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
import Image from "next/image";
import { toast } from "sonner";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { cartItems } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

 const handleLogout = async () => {
  try {
    await signOut({ redirect: false }); // No need for callbackUrl here
    window.location.replace('/'); // Hard redirect handles the destination
  } catch (error) {
    toast.error('Logout failed:', error)
    // Optional: Show error to user (toast, etc.)
  }
};

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black shadow-lg py-3 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo and brand - always on left */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/" className="hover:scale-105 transition-all duration-300 cursor-pointer">
              <Image 
                src="https://res.cloudinary.com/djr7uqara/image/upload/f_auto,q_auto/xtanzam7aw0f7tdfwxlx"
                alt="Luminary Logo"
                width={120}
                height={40}
                className="h-8 w-auto md:h-10"
                priority
              />
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-2xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#F5D68E] to-[#D4AF37]">
                Luminary Gifts Store
              </h1>
              <p className="hidden md:block text-xs text-white/80 tracking-widest">CURATED LUXURY GIFTS</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 ml-8">
            <Link 
              href="/" 
              className="px-4 py-2 rounded-md bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-all duration-300 cursor-pointer text-sm"
            >
              Home
            </Link>
            <Link 
              href="/#products" 
              className="px-4 py-2 rounded-md bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-all duration-300 cursor-pointer text-sm"
            >
              Products
            </Link>
            <Link 
              href="/#testimonials" 
              className="px-4 py-2 rounded-md bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-all duration-300 cursor-pointer text-sm"
            >
              Testimonials
            </Link>
            <Link 
              href="/#contact" 
              className="px-4 py-2 rounded-md bg-[#D4AF37] text-white hover:bg-[#F5D68E] transition-all duration-300 cursor-pointer text-sm"
            >
              Contact
            </Link>
          </nav>

          {/* Right side icons and buttons */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-[#D4AF37] hover:bg-white/10 transition-all duration-300 cursor-pointer rounded-full h-9 w-9"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4 md:h-5 md:w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-[#D4AF37] hover:bg-white/10 transition-all duration-300 relative cursor-pointer rounded-full h-9 w-9"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Button>

            {status === "authenticated" ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-[#D4AF37] hover:bg-white/10 transition-all duration-300 cursor-pointer rounded-full gap-1"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm">Account</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-black border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] cursor-pointer rounded-full text-sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : status === "unauthenticated" ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300 cursor-pointer rounded-full text-sm"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300 cursor-pointer rounded-full text-sm"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            ) : null}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:text-[#D4AF37] hover:bg-white/10 transition-all duration-300 cursor-pointer rounded-full h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "fixed inset-0 bg-black/95 z-40 transition-all duration-300 pt-16",
            mobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          )}
        >
          <nav className="flex flex-col items-center gap-4 p-6">
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

            <div className="w-full border-t border-[#D4AF37]/30 my-3"></div>

            {status === "authenticated" ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <Link href="/dashboard" className="w-full" onClick={closeMobileMenu}>
                  <Button
                    className="w-full bg-white text-black hover:bg-[#F5D68E] transition-colors cursor-pointer"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  className="w-full bg-white text-black hover:bg-[#F5D68E] transition-colors cursor-pointer"
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                >
                  Logout
                </Button>
              </div>
            ) : status === "unauthenticated" ? (
              <div className="flex flex-col gap-4 w-full">
                <Link href="/auth/login" className="w-full" onClick={closeMobileMenu}>
                  <Button
                    className="w-full bg-white text-black hover:bg-[#F5D68E] transition-colors cursor-pointer"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register" className="w-full" onClick={closeMobileMenu}>
                  <Button className="w-full bg-white text-black hover:bg-[#F5D68E] transition-colors cursor-pointer">
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