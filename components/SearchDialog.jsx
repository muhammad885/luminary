'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { getAllProductsGroupedByCategory } from "@/actions/products";


const SearchDialog = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getAllProductsGroupedByCategory();
        setAllProducts(productsData.all || []);
      } catch (error) {
        console.error('Error loading products:', error);
        setAllProducts([]);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filteredResults = allProducts
      .filter((product) => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      )
      .slice(0, 5);

    setSearchResults(filteredResults);
  }, [searchQuery, allProducts]);

  const handleSelectProduct = (productId) => {
    router.push(`/product/${productId}`);
    onClose();
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-[#D4AF37]/30">
        <div className="flex items-center border-b border-[#D4AF37]/20 p-4">
          <Search className="mr-2 h-5 w-5 shrink-0 text-[#D4AF37]" />
          <Input
            autoFocus
            placeholder="Search products..."
            className="flex h-10 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Command className="border-none">
          <CommandEmpty className="py-6 text-center text-sm text-gray-500">
            {searchQuery.trim() ? "No products found." : "Type to search products..."}
          </CommandEmpty>
          {searchResults.length > 0 && (
            <CommandGroup className="max-h-[300px] overflow-y-auto p-2">
              {searchResults.map((product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => handleSelectProduct(product.id)}
                  className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-[#D4AF37]/10 transition-colors"
                >
                  <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0 border border-[#D4AF37]/20">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover"
                      width={48}
                      height={48}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{product.name}</span>
                    <span className="text-sm text-[#D4AF37] font-medium">
                      {new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: 'NGN',
                        minimumFractionDigits: 0,
                      }).format(product.discountedPrice || product.price)}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;