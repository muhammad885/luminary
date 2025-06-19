"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { getProductById, getRelatedProducts } from "@/actions/products";
import Image from "next/image";

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState(null);

  const productId = params?.productId || params?.id;

  // Helper function to safely get category name
  const getCategoryName = (category) => {
    if (typeof category === "string") return category;
    if (category && typeof category === "object") return category.name;
    return "uncategorized";
  };

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);
        const response = await getProductById(productId);

        if (response) {
          setProduct(response);
          // Fetch related products after main product loads
          fetchRelatedProducts(
            response._id,
            getCategoryName(response.category)
          );
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError("Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async (id, category) => {
      try {
        setRelatedLoading(true);
        const related = await getRelatedProducts(id, category);
        setRelatedProducts(related);
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [productId]);

  // Format price to Nigerian Naira
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Skeleton */}
          <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>

          {/* Info Skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>

            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}

            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white mt-16 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <ShoppingCart className="h-16 w-16 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          The product you're looking for is not available. It might have been
          removed or doesn't exist.
        </p>
        <Link
          href="/"
          className="py-3 px-6 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          Explore Our Latest Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-full object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-center p-8">
                <div className="text-5xl mb-4">⌚</div>
                <p className="text-[#D4AF37]">{product.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <span className="text-sm font-medium text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full">
              {getCategoryName(product.category)}
            </span>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mt-3">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-3xl font-medium text-[#D4AF37]">
                {formatPrice(product.discountedPrice)}
              </p>
              {product.discountedPrice && (
                <p className="text-lg text-gray-500 line-through">
                  {formatPrice(product.price)}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {product.stock > 0 ? (
                <span className="text-green-600">In Stock</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
            <p className="text-gray-600 mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900">Features</h2>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {product.features?.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="h-5 w-5 text-[#D4AF37] mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gray-200 pt-6">
            {product.stock > 0 ? (
              <AddToCartButton
                product={product}
                resetKey={product._id}
                className="w-full py-3 px-6 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white font-medium rounded-lg transition-colors shadow-sm"
              />
            ) : (
              <button
                disabled
                className="w-full py-3 px-6 bg-black text-white font-medium rounded-lg cursor-not-allowed"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-8">
            You may also like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedLoading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/product/${relatedProduct.id}`}
                    className="group block overflow-hidden rounded-lg transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover transition-opacity group-hover:opacity-90"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      {relatedProduct.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <span className="bg-white px-2 py-1 rounded text-sm font-medium">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-gray-900 line-clamp-1">
                        {relatedProduct.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[#D4AF37] font-medium">
                          {formatPrice(relatedProduct.discountedPrice)}
                        </span>
                        {relatedProduct.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(relatedProduct.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}