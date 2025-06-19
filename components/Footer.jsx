import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 pt-16 pb-10">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="font-playfair text-2xl font-bold text-[#D4AF37] mb-6">Luminary</h3>
            <p className="text-gray-300 mb-6">
              Your one-stop gifts store where every gift shines. Discover premium gifts, perfumes, and
              gift baskets for all occasions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-playfair text-xl text-[#D4AF37] mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Home</a></li>
              <li><a href="#products" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Products</a></li>
              <li><a href="#categories" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Categories</a></li>
              <li><a href="#testimonials" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Testimonials</a></li>
              <li><a href="#location" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Store Location</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-playfair text-xl text-[#D4AF37] mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">08066014844, 08165997050</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">luminarygiftstore@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">
                  Shop No.1 Opposite Yakubu Bello Residence,<br />
                  Sabon Fegi Damaturu, Yobe State
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-playfair text-xl text-[#D4AF37] mb-6">Newsletter</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to receive updates about new products and special offers.
            </p>
            <div className="flex">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-gray-800 border-[#D4AF37]/50 focus:border-[#D4AF37] text-gray-100 rounded-r-none focus-visible:ring-[#D4AF37]"
              />
              <Button className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-gray-900 rounded-l-none hover:shadow-lg hover:shadow-[#D4AF37]/20">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-gray-700">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Luminary Gifts Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;