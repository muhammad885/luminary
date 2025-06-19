'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/hooks/useCart";
import { getAllProductsGroupedByCategory } from "@/actions/products";
import { Skeleton } from "@/components/ui/skeleton";

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(price);
};

// Skeleton Product Card Component
const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 overflow-hidden">
    <div className="relative overflow-hidden rounded-lg mb-4 h-60 w-full">
      <Skeleton className="w-full h-full" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white flex justify-between items-center">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  </div>
);

// Skeleton Tab List
const TabListSkeleton = () => (
  <div className="flex gap-2 mb-10 p-1 bg-gray-100 rounded-full w-max mx-auto">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-10 w-24 rounded-full" />
    ))}
  </div>
);

const FeaturedProducts = () => {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const products = await getAllProductsGroupedByCategory();
        setProductsByCategory(products);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getProductsToDisplay = () => {
    if (!productsByCategory || Object.keys(productsByCategory).length === 0) return [];
    if (activeTab === "all") {
      return productsByCategory.all || [];
    }
    return productsByCategory[activeTab] || [];
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  const categories = Object.keys(productsByCategory);

  return (
    <section id="products" className="py-20 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-serif text-[#D4AF37]">
            Featured Collections
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto text-lg">
            Discover our curated selection of premium gifts and fragrances. Perfect for all occasions.
          </p>
        </div>

        {isLoading ? (
          <>
            <TabListSkeleton />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="flex w-max mx-auto gap-2 mb-10 p-1 bg-gray-100 rounded-full">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="px-6 py-2 rounded-full transition-all duration-300 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white hover:bg-gray-200 data-[state=active]:shadow-md whitespace-nowrap"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="animate-fadeIn">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {getProductsToDisplay().map((product) => (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-[#D4AF37]/40 overflow-hidden"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <button 
                      className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="w-5 h-5 text-gray-400 hover:text-[#D4AF37]" />
                    </button>
                    
                    <div className="relative overflow-hidden rounded-lg mb-4 h-60 w-full">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transform transition-transform duration-500 group-hover:scale-105"
                        width={300}
                        height={300}
                      />
                      {product?.isNew && (
                        <span className="absolute top-3 left-3 bg-[#D4AF37] text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                          New Arrival
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold group-hover:text-[#D4AF37] transition-colors duration-300 line-clamp-1">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[#D4AF37] text-lg font-bold">
                          {formatPrice(product.discountedPrice || product.price)}
                        </span>
                        {product.discountedPrice && (
                          <span className="line-through text-gray-400 text-sm">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                        {product.description}
                      </p>
                      
                      {Array.isArray(product.features) && product.features.length > 0 && (
                        <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600">
                          {product.features.slice(0, 3).map((feature, index) => (
                            <li key={index}>{feature.trim()}</li>
                          ))}
                        </ul>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center border-t border-[#D4AF37]/20">
                        {product.stock > 0 ? (
                          <Button
                            onClick={(e) => handleAddToCart(product, e)}
                            className="flex-1 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white rounded-lg transition-all duration-300 shadow hover:shadow-md"
                            size="sm"
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                          </Button>
                        ) : (
                          <div className="flex-1 flex items-center justify-center bg-black text-white rounded-lg py-1 px-2">
                            Out of Stock
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-[#D4AF37] hover:bg-[#D4AF37]/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product.id);
                          }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {getProductsToDisplay().length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products found in this category</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;