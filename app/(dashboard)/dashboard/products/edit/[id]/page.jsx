"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Save, Loader2, X, Plus, Minus } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getProductById, updateProduct } from "@/actions/products";
import { getAllCategories } from "@/actions/categories";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  purchasePrice: z.coerce.number().positive("Purchase price must be positive"),
  discountedPrice: z.coerce.number().min(0, "Discount cannot be negative").optional(),
  stock: z.coerce.number().int().nonnegative("Stock must be a positive integer"),
  isActive: z.boolean().default(true),
  features: z.array(z.string()).optional(),
});

export default function EditProductPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [productImage, setProductImage] = useState(null);
  const [currentCategoryName, setCurrentCategoryName] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [features, setFeatures] = useState([]);
  const [currentFeature, setCurrentFeature] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      price: 0,
      purchasePrice: 0,
      discountedPrice: 0,
      stock: 0,
      isActive: true,
      features: [],
    },
  });

  const currentCategoryId = watch("category");

  const addFeature = () => {
    if (currentFeature.trim() === "") return;
    
    const newFeatures = [...features, currentFeature.trim()];
    setFeatures(newFeatures);
    setValue("features", newFeatures);
    setCurrentFeature("");
  };

  const removeFeature = (index) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
    setValue("features", newFeatures);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [product, categoriesResponse] = await Promise.all([
          getProductById(unwrappedParams.id),
          getAllCategories(),
        ]);

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        } else {
          toast.error("Failed to load categories");
        }

        if (product) {
          const currentCategory = categoriesResponse.data?.find(
            (cat) => cat._id === product.category?._id
          );
          
          setValue("name", product.name);
          setValue("category", product.category?._id || "");
          setValue("description", product.description);
          setValue("price", product.price || 0);
          setValue("purchasePrice", product.purchasePrice || 0);
          setValue("discountedPrice", product.discountedPrice || 0);
          setValue("stock", product.stock || 0);
          setValue("isActive", product.isActive ?? true);
          setValue("features", product.features || []);
          setFeatures(product.features || []);
          setProductImage(product.image || null);
          
          if (currentCategory) {
            setCurrentCategoryName(currentCategory.name);
          }
        }
      } catch (error) {
        toast.error("Failed to load product data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [unwrappedParams.id, setValue]);

  useEffect(() => {
    if (currentCategoryId && categories.length > 0) {
      const selectedCategory = categories.find(cat => cat._id === currentCategoryId);
      if (selectedCategory) {
        setCurrentCategoryName(selectedCategory.name);
      }
    }
  }, [currentCategoryId, categories]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|png|gif|svg\+xml)/)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, SVG)");
      return;
    }

    if (file.size > 500 * 1024) {
      toast.error("File size must be 500KB or less");
      return;
    }

    setIsImageUploading(true);
    
    try {
      const base64String = await convertToBase64(file);
      setProductImage(base64String);
    } catch (error) {
      toast.error("Failed to process image");
      console.error(error);
    } finally {
      setIsImageUploading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const removeImage = () => {
    setProductImage(null);
  };

  const onSubmit = async (data) => {
    setIsSubmittingForm(true);
    try {
      // Ensure discounted price is not greater than regular price
      if (data.discountedPrice > data.price) {
        toast.error("Selling price cannot be greater than regular price");
        return;
      }

      // Ensure purchase price is not greater than selling price
      if (data.purchasePrice > data.price) {
        toast.error("Purchase price cannot be greater than Market price");
        return;
      }

      const productData = {
        ...data,
        image: productImage,
        features: features,
        // Convert empty discounted price to undefined
        discountedPrice: data.discountedPrice === 0 ? undefined : data.discountedPrice
      };

      const result = await updateProduct(unwrappedParams.id, productData);

      if (result.success) {
        toast.success("Product updated successfully");
        router.push("/dashboard/products");
      } else {
        console.log(result.error)
        toast.error(JSON.stringify(result.error))
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Update the details of this product.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                {currentCategoryName && (
                  <p className="text-sm text-muted-foreground">
                    Current category: <span className="font-medium">{currentCategoryName}</span>
                  </p>
                )}
                <Select 
                  onValueChange={(value) => {
                    setValue("category", value);
                    const selectedCategory = categories.find(cat => cat._id === value);
                    if (selectedCategory) {
                      setCurrentCategoryName(selectedCategory.name);
                    }
                  }}
                  value={watch("category")}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
                {...register("description")}
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Market Price (₦)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("price", {
                    valueAsNumber: true,
                    setValueAs: (v) => v === "" ? 0 : parseFloat(v)
                  })}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (₦)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("purchasePrice", {
                    valueAsNumber: true,
                    setValueAs: (v) => v === "" ? 0 : parseFloat(v)
                  })}
                />
                {errors.purchasePrice && (
                  <p className="text-sm text-red-500">{errors.purchasePrice.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountedPrice">Selling Price (₦)</Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("discountedPrice", {
                    valueAsNumber: true,
                    setValueAs: (v) => v === "" ? 0 : parseFloat(v)
                  })}
                />
                {errors.discountedPrice && (
                  <p className="text-sm text-red-500">{errors.discountedPrice.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("stock", {
                    valueAsNumber: true,
                    setValueAs: (v) => v === "" ? 0 : parseInt(v, 10)
                  })}
                />
                {errors.stock && (
                  <p className="text-sm text-red-500">{errors.stock.message}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 md:col-span-3">
                <Checkbox
                  id="isActive"
                  {...register("isActive")}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                  checked={watch("isActive")}
                />
                <Label htmlFor="isActive">Active Product</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a feature (e.g., 'Waterproof', 'Silk', etc.)"
                  value={currentFeature}
                  onChange={(e) => setCurrentFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addFeature} 
                  variant="outline"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="flex flex-col gap-4">
                {productImage ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div className="relative w-64 h-64 rounded-md overflow-hidden border flex justify-center items-center">
                        <img
                          src={productImage?.startsWith('data:image') ? productImage : `data:image/jpeg;base64,${productImage}`}
                          alt="Product preview"
                          className="max-w-full max-h-full object-contain bg-muted"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => document.getElementById('product-image-upload')?.click()}
                        disabled={isImageUploading}
                      >
                        {isImageUploading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ImagePlus className="w-4 h-4 mr-2" />
                        )}
                        Change Image
                      </Button>
                      <input 
                        id="product-image-upload"
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <label
                      htmlFor="product-image-upload"
                      className="flex flex-col items-center justify-center w-full max-w-xs h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center p-5">
                        {isImageUploading ? (
                          <Loader2 className="w-8 h-8 mb-3 animate-spin" />
                        ) : (
                          <>
                            <ImagePlus className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground text-center">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              SVG, PNG, JPG, GIF (MAX. 500KB)
                            </p>
                          </>
                        )}
                      </div>
                    </label>
                    <input 
                      id="product-image-upload"
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/dashboard/products")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingForm}>
              {isSubmittingForm ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>

      {isLoading && (
        <div className="absolute inset-0 bg-background/80 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading product data...</p>
          </div>
        </div>
      )}
    </div>
  );
}