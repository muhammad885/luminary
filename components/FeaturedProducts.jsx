'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, ArrowRight, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/hooks/useCart";
import { getAllProductsGroupedByCategory } from "@/actions/products";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(price);
};

// Skeleton Loaders
const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
    <div className="relative aspect-square overflow-hidden rounded-xl mb-4 w-full">
      <Skeleton className="w-full h-full" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-5 w-3/4 rounded-full" />
      <Skeleton className="h-4 w-1/2 rounded-full" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  </div>
);

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
    <section id="products" className="py-16 md:py-20 bg-white">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 font-sans text-gray-900">
            Featured Collections
          </h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto text-base md:text-lg">
            Discover our curated selection of premium gifts and fragrances
          </p>
        </div>

        {isLoading ? (
          <>
            <TabListSkeleton />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <TabsList className="flex w-max mx-auto gap-2 mb-8 md:mb-12 p-1 bg-gray-50 rounded-full border border-gray-200 ">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="px-5 py-2 rounded-full transition-all duration-200 data-[state=active]:bg-gray-900 data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:shadow-sm whitespace-nowrap text-sm md:text-base cursor-pointer"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="animate-fadeIn">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {getProductsToDisplay().map((product) => (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                      <button 
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-100 shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Heart className="w-4 h-4 text-gray-500 hover:text-red-500" />
                      </button>
                      {product?.isNew && (
                        <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full shadow-sm">
                          New
                        </span>
                      )}
                    </div>
                    
                    <div className="relative aspect-square overflow-hidden rounded-xl mb-4 w-full">
                      <Image
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        width={400}
                        height={400}
                        priority
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors duration-200 line-clamp-1">
                        {product.name}
                      </h3>
                      
                      {product.category && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {product.category}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-bold">
                            {formatPrice(product.discountedPrice || product.price)}
                          </span>
                          {product.discountedPrice && (
                            <span className="line-through text-gray-400 text-sm">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        {product.badge && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center border-t border-gray-100">
                        {product.stock > 0 ? (
                          <Button
                            onClick={(e) => handleAddToCart(product, e)}
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all duration-200"
                            size="sm"
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" /> Add
                          </Button>
                        ) : (
                          <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg py-2 px-4 text-sm">
                            Out of Stock
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-500 hover:bg-gray-100 hover:text-gray-900"
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
                <div className="text-center py-16">
                  <p className="text-gray-400">No products found in this category</p>
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