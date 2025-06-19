const { z } = require("zod");

// Helper function to validate productId format
const validateProductId = (value) => {
  return /^PRD-\d{6}$/.test(value);
};

// Base product schema
const ProductSchema = z.object({
  productId: z.string()
    .min(1, "Product ID is required")
    .refine(validateProductId, {
      message: "Product ID must be in format PRD-XXXXXX where X is a digit"
    }),
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z
    .number({
      invalid_type_error: "Price must be a number",
      required_error: "Price is required",
    })
    .positive("Price must be greater than zero"),
  purchasePrice: z
    .number({
      invalid_type_error: "Purchase Price must be a number",
      required_error: "Purchase Price is required",
    })
    .positive("Purchase Price must be greater than zero"),
  discountedPrice: z
    .number({
      invalid_type_error: "Discounted Price must be a number",
    })
    .positive("Discounted Price must be greater than zero")
    .optional(),
  category: z.string({ required_error: "Category is required" }),
  stock: z
    .number({
      invalid_type_error: "Stock must be a number",
      required_error: "Stock is required",
    })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  features: z.array(z.string()).optional(),
});

// Schema for creating a new product
const CreateProductSchema = ProductSchema.extend({
  productId: z.string().optional() // Allowed to be optional for creation as it will be generated
})
.refine(data => {
  if (data.discountedPrice && data.discountedPrice > data.price) {
    return false;
  }
  return true;
}, {
  message: "Discounted price cannot be greater than regular price",
  path: ["discountedPrice"]
})
.refine(data => {
  if (data.purchasePrice > data.price) {
    return false;
  }
  return true;
}, {
  message: "Purchase price cannot be greater than selling price",
  path: ["purchasePrice"]
});

// Schema for updating an existing product (all fields optional except productId)
const UpdateProductSchema = ProductSchema.partial()
  .refine(data => {
    if (data.discountedPrice && data.price && data.discountedPrice > data.price) {
      return false;
    }
    return true;
  }, {
    message: "Discounted price cannot be greater than regular price",
    path: ["discountedPrice"]
  })
  .refine(data => {
    if (data.purchasePrice && data.price && data.purchasePrice > data.price) {
      return false;
    }
    return true;
  }, {
    message: "Purchase price cannot be greater than selling price",
    path: ["purchasePrice"]
  });

module.exports = {
  ProductSchema,
  CreateProductSchema,
  UpdateProductSchema
};