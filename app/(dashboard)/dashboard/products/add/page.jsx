"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Loader2, UploadCloud, X, Plus, Minus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateProductSchema } from "@/schemas/product"
import { createProduct } from "@/actions/products"
import { getAllCategories } from "@/actions/categories"
import { Checkbox } from "@/components/ui/checkbox"

export default function AddProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [features, setFeatures] = useState([])
  const [currentFeature, setCurrentFeature] = useState("")

  const form = useForm({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      purchasePrice: 0,
      discountedPrice: 0,
      category: "",
      stock: 0,
      isActive: true,
      image: null,
      features: [],
    },
  })

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const result = await getAllCategories()
        if (result?.success) {
          setCategories(result.data || [])
        } else {
          toast.error(result?.message || "Failed to load categories")
          setCategories([])
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        toast.error("Failed to load categories. Please try again later.")
        setCategories([])
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleImageChange = (file) => {
    if (!file) return

    if (file.size > 500 * 1024) {
      console.log(`File size: ${Math.round(file.size / 1024)}KB exceeds limit of 500KB`)
      form.setError("images", {
        type: "manual",
        message: "Image size must be less than 500KB",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      form.setError("images", {
        type: "manual",
        message: "Please upload an image file",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64String = reader.result
      setImagePreview(base64String)
      form.setValue("image", base64String, { shouldValidate: true })
      form.clearErrors("images")
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageChange(file)
      e.target.value = ""
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleImageChange(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    form.setValue("image", null, { shouldValidate: true })
  }

  const addFeature = () => {
    if (currentFeature.trim() === "") return
    
    const newFeature = currentFeature.trim()
    const updatedFeatures = [...features, newFeature]
    setFeatures(updatedFeatures)
    form.setValue("features", updatedFeatures)
    setCurrentFeature("")
  }

  const removeFeature = (index) => {
    const updatedFeatures = features.filter((_, i) => i !== index)
    setFeatures(updatedFeatures)
    form.setValue("features", updatedFeatures)
  }

  const onSubmit = async (data) => {
    console.log(data)
    setIsSubmitting(true)

    try {
      const productData = {
        ...data,
        features: features, // Ensure features array is included
      }

      console.log("Sending product data:", {
        ...productData,
        image: productData.image
          ? `[Base64 image string - ${Math.round((productData.image.length * 3) / 4 / 1024)}KB]`
          : null,
      })

      const result = await createProduct(productData)

      if (result?.success) {
        toast.success("Product created successfully")
        router.push("/dashboard/products")
      } else {
        if (result?.error) {
          Object.entries(result.error).forEach(([key, value]) => {
            if (value?._errors) {
              form.setError(key, {
                type: "server",
                message: value._errors.join(", "),
              })
            }
          })
        }
        toast.error(result?.error || "Failed to create product")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Price (₦)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price (₦)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price (₦)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories}>
                        <FormControl>
                          <SelectTrigger>
                            {isLoadingCategories ? (
                              <span className="text-muted-foreground">Loading categories...</span>
                            ) : (
                              <SelectValue placeholder="Select a category" />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <div className="text-muted-foreground p-2 text-center text-sm">Loading categories...</div>
                          ) : categories.length === 0 ? (
                            <div className="text-muted-foreground p-2 text-center text-sm">No categories available</div>
                          ) : (
                            categories.map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Product Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {imagePreview ? (
                            <div className="relative group">
                              <img
                                src={imagePreview || "/placeholder.svg"}
                                alt="Product preview"
                                className="w-full h-64 object-contain rounded-lg border bg-gray-50"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm transition-all"
                              >
                                <X className="h-4 w-4 text-gray-700" />
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-gray-300"}`}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                            >
                              <div className="flex flex-col items-center justify-center gap-2">
                                <UploadCloud className="h-10 w-10 text-gray-400" />
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-gray-700">Drag and drop your image here</p>
                                  <p className="text-xs text-gray-500">or click to browse (Max 500KB)</p>
                                </div>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id="image-upload"
                                  onChange={handleFileInputChange}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => document.getElementById("image-upload").click()}
                                >
                                  Select Image
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter product description" className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Features Section */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-medium">Features</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a feature (e.g., 'Waterproof', 'Silk', etc.)"
                        value={currentFeature}
                        onChange={(e) => setCurrentFeature(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addFeature()
                          }
                        }}
                      />
                      <Button type="button" onClick={addFeature} variant="outline">
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
                </div>
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Product</FormLabel>
                      <p className="text-sm text-muted-foreground">This product will be visible to customers</p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/products")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isLoadingCategories}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Product...
                    </>
                  ) : (
                    "Create Product"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}