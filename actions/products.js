'use server';

import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import Products from "@/model/Products";
import Category from "@/model/Category";
import { CreateProductSchema, UpdateProductSchema } from "@/schemas/product";
import { revalidatePath } from "next/cache";
import User from "@/model/User";
import { sendNewArrivalsEmail } from "@/lib/mail";

export async function createProduct(formData) {
  await dbConnect();

  try {
    // Generate unique product ID (PRD-XXXXXX format)
    const generateProductId = () => {
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
      return `PRD-${randomNum}`;
    };

    // Coerce number types and ensure features is properly formatted
    const data = {
      ...formData,
      productId: generateProductId(), // Add generated product ID
      price: parseFloat(formData.price),
      purchasePrice: parseFloat(formData.purchasePrice),
      discountedPrice: parseFloat(formData.discountedPrice),
      stock: parseInt(formData.stock, 10),
      features: Array.isArray(formData.features) ? formData.features : []
    };

    // Validate and convert image (if needed)
    if (data.image && typeof data.image === "object" && "size" in data.image) {
      if (data.image.size > 500 * 1024) {
        return {
          success: false,
          error: "Image size must be less than 500KB"
        };
      }

      const arrayBuffer = await data.image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString("base64");
      data.image = `data:${data.image.type};base64,${base64Image}`;
    } else if (!data.image) {
      data.image = undefined;
    }

    // Validate with Zod
    const validationResult = CreateProductSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.format(),
      };
    }

    const validatedData = validationResult.data;

    // Validate ObjectId format for category
    if (!mongoose.Types.ObjectId.isValid(validatedData.category)) {
      return {
        success: false,
        error: "Invalid category ID"
      };
    }

    // Check if category exists
    const categoryExists = await Category.findById(validatedData.category).lean();
    if (!categoryExists) {
      return {
        success: false,
        error: "Selected category does not exist"
      };
    }

    // Check for duplicate name (case insensitive)
    const existingProduct = await Products.findOne({ 
      name: { $regex: new RegExp(`^${validatedData.name}$`, 'i') }
    }).lean();
    
    if (existingProduct) {
      return {
        success: false,
        error: "Product with this name already exists"
      };
    }

    // Check if productId already exists (unlikely but possible)
    let isUnique = false;
    let productId;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      productId = generateProductId();
      const existingWithId = await Products.findOne({ productId }).lean();
      if (!existingWithId) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return {
        success: false,
        error: "Could not generate unique product ID"
      };
    }

    // Ensure discounted price is not greater than regular price
    if (validatedData.discountedPrice > validatedData.price) {
      return {
        success: false,
        error: "Discounted price cannot be greater than regular price"
      };
    }

    // Ensure purchase price is not greater than selling price
    if (validatedData.purchasePrice > validatedData.price) {
      return {
        success: false,
        error: "Purchase price cannot be greater than selling price"
      };
    }

    // Create product
    const newProduct = await Products.create({
      ...validatedData,
      productId, // Use the generated unique ID
      category: new mongoose.Types.ObjectId(validatedData.category),
      features: validatedData.features || []
    });

    const serializedProduct = {
      ...newProduct.toObject(),
      _id: newProduct._id.toString(),
      category: newProduct.category.toString(),
      createdAt: newProduct.createdAt.toISOString(),
      updatedAt: newProduct.updatedAt.toISOString(),
    };

    revalidatePath("/dashboard/products");

    return {
      success: true,
      data: serializedProduct,
    };
  } catch (error) {
    console.error("Create product error:", error);
    return {
      success: false,
      error: "Failed to create product"
    };
  }
}

export async function getProducts(page = 1, limit = 10, search = "", category = "") {
  await dbConnect();

  const skip = (page - 1) * limit;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'category.name': { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  const total = await Products.countDocuments(query);
  
  const products = await Products.find(query)
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Serialize the products
  const serializedProducts = products.map(product => ({
    ...product,
    _id: product._id.toString(),
    category: product.category ? {
      ...product.category,
      _id: product.category._id.toString()
    } : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    purchasePrice: product.purchasePrice || 0 // Ensure purchasePrice is included
  }));

  return {
    products: serializedProducts,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}

export async function updateProduct(id, formData) {
  await dbConnect();

  console.log(`The id is ${id}`)

  try {
    // Sanitize data and ensure features is properly formatted
    const sanitizedData = {
      ...formData,
      purchasePrice: parseFloat(formData.purchasePrice),
      image: typeof formData.image === 'string' ? formData.image : null,
      features: Array.isArray(formData.features) ? formData.features : [],
    };
    

    // Validate form data
    const validationResult = UpdateProductSchema.safeParse(sanitizedData);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.format(),
      };
    }

    // Find product
    const product = await Products.findById(id);

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const validatedData = validationResult.data;

    // If category is being updated, check if it exists
    if (validatedData.category) {
      const category = await Category.findById(validatedData.category);
      if (!category) {
        return { success: false, error: "Selected category does not exist" };
      }
    }

    // If name is being updated, check if it's unique (case insensitive)
    if (validatedData.name && validatedData.name !== product.name) {
      const existingProduct = await Products.findOne({ 
        name: { $regex: new RegExp(`^${validatedData.name}$`, 'i') },
        _id: { $ne: id } // Exclude current product
      });
      if (existingProduct) {
        return { success: false, error: "Product with this name already exists" };
      }
    }

    // Ensure discounted price is valid if provided
    if (validatedData.discountedPrice !== undefined && 
        validatedData.price !== undefined &&
        validatedData.discountedPrice > validatedData.price) {
      return {
        success: false,
        error: "Discounted price cannot be greater than regular price"
      };
    }

    // Ensure purchase price is valid if provided
    if (validatedData.purchasePrice !== undefined && 
        validatedData.price !== undefined &&
        validatedData.purchasePrice > validatedData.price) {
      return {
        success: false,
        error: "Purchase price cannot be greater than selling price"
      };
    }

    // Create update object with only defined fields
    const updateFields = {};
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        // Special handling for category to ensure proper ObjectId
        if (key === 'category') {
          updateFields[key] = new mongoose.Types.ObjectId(value);
        } 
        // Ensure features is always set as an array (empty array if undefined)
        else if (key === 'features') {
          updateFields[key] = value || [];
        }
        else {
          updateFields[key] = value;
        }
      }
    }

    // Update product
    const updatedProduct = await Products.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { 
        new: true,
        runValidators: true // Ensure mongoose validators run
      }
    )
      .populate("category", "name")
      .lean();

    // Convert MongoDB ObjectId to string for client-side
    const serializedProduct = {
      ...updatedProduct,
      _id: updatedProduct._id.toString(),
      category: {
        ...updatedProduct.category,
        _id: updatedProduct.category?._id?.toString()
      }
    };

    revalidatePath(`/dashboard/products/edit/${id}`);
    revalidatePath("/dashboard/products");

    return { 
      success: true, 
      data: serializedProduct 
    };
  } catch (error) {
    console.error("Update product error:", {
      message: error.message,
      stack: error.stack,
    });
    return { 
      success: false, 
      error: error.message || "Failed to update product" 
    };
  }
}

export async function getProductById(id) {
  await dbConnect();
  
  try {
    // Remove isActive filter to allow editing inactive products
    const product = await mongoose.model('Product').findOne({
      _id: id
    })
    .populate('category', 'name _id') // Include both name and _id
    .lean({ virtuals: true }); // Keep virtuals if any

    if (!product) {
      console.log(`Product ${id} not found`);
      return null;
    }

    return {
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      purchasePrice: product.purchasePrice || 0,
      discountedPrice: product.discountedPrice || 0, // Default to 0 instead of null
      image: product.image || null, // Return null instead of placeholder
      features: product.features || [],
      stock: product.stock || 0, // Include stock with default 0
      isActive: product.isActive ?? true, // Include active status
      category: product.category ? {
        _id: product.category._id.toString(),
        name: product.category.name
      } : null
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function deleteProduct(id) {
  await dbConnect();

  try {
    const product = await Products.findById(id);

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    await Products.findByIdAndDelete(id);

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete product" };
  }
}

export async function getAllProductsGroupedByCategory() {
  await dbConnect();

  try {
    // First find all active products
    const products = await Products.find({ isActive: true })
      .populate({
        path: "category",
        select: "name status" // We need status for filtering
      })
      .sort({ createdAt: -1 })
      .lean();

    // Then filter for products with active categories
    const validProducts = products.filter(product => 
      product.category && product.category.status === 'Active'
    );

    const serialized = validProducts.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      purchasePrice: product.purchasePrice || 0,
      discountedPrice: product.discountedPrice || null,
      image: product.image || "/placeholder.png",
      features: product.features || [],
      category: product.category.name,
      stock: product.stock
    }));

    // Group by category name
    const productsByCategory = {
      all: serialized,
      ...serialized.reduce((acc, product) => {
        const catKey = product.category.toLowerCase().replace(/\s+/g, '-');
        acc[catKey] = acc[catKey] || [];
        acc[catKey].push(product);
        return acc;
      }, {})
    };

    return productsByCategory;

  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      all: [],
      // Empty groups if error occurs
    };
  }
}

export async function getRelatedProducts(currentProductId, categoryName) {
  console.log(currentProductId, categoryName)
  await dbConnect();

  try {
    // 1. Validate inputs
    if (!currentProductId || !mongoose.Types.ObjectId.isValid(currentProductId)) {
      console.error('Invalid or missing product ID');
      return [];
    }

    if (!categoryName) {
      console.error('Category name is required');
      return [];
    }

    // 2. Find the category
    const category = await mongoose.model('Category')
      .findOne({ 
        name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
      })
      .select('_id');

    if (!category) {
      console.error(`Category "${categoryName}" not found`);
      return [];
    }

    // 3. Find related products (excluding current)
    const products = await mongoose.model('Product')
      .find({
        _id: { $ne: new mongoose.Types.ObjectId(currentProductId) },
        category: category._id,
        isActive: true
      })
      .limit(4)
      .sort({ createdAt: -1 })
      .lean()
      .populate('category', 'name');

    // 4. Fallback if no same-category products found
    if (products.length === 0) {
      const fallbackProducts = await mongoose.model('Product')
        .find({
          _id: { $ne: new mongoose.Types.ObjectId(currentProductId) },
          isActive: true
        })
        .limit(4)
        .sort({ createdAt: -1 })
        .lean()
        .populate('category', 'name');
      
      return fallbackProducts.map(product => ({
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        purchasePrice: product.purchasePrice || 0,
        discountedPrice: product.discountedPrice || null,
        image: product.image || '/placeholder.png',
        category: product.category?.name || 'uncategorized'
      }));
    }

    return products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      purchasePrice: product.purchasePrice || 0,
      discountedPrice: product.discountedPrice || null,
      image: product.image || '/placeholder.png',
      category: product.category?.name || 'uncategorized'
    }));

  } catch (error) {
    console.error('Error in getRelatedProducts:', error);
    return [];
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Get products within a date range
export async function getProductsByDateRange(startDate, endDate) {
  await dbConnect();

  try {
    // Create proper date objects from UTC strings
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const products = await Products.find({
      isActive: true,
      createdAt: { 
        $gte: start, 
        $lte: end 
      }
    })
    .populate({
      path: "category",
      select: "name status",
    })
    .sort({ createdAt: -1 })
    .lean();

    // Filter out products that don't have an active category
    const validProducts = products.filter(product => 
      product.category && product.category.status === 'Active'
    );

    // Serialize and return
    return validProducts.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      formattedPrice: formatPrice(product.price), // Add formatted price
      image: product.image || "/placeholder.png",
      category: product.category.name,
      createdAt: product.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching products by date range:', error);
    throw new Error('Failed to fetch products');
  }
}
// Send new arrivals notification to all active customers
export async function sendNewArrivalsNotification(productIds) {
  await dbConnect();

  try {
    // 1. Fetch the selected products
    const products = await Products.find({
      _id: { $in: productIds },
      isActive: true
    })
    .populate({
      path: "category",
      select: "name",
    })
    .lean();

    if (products.length === 0) {
      return { success: false, error: 'No active products found' };
    }

    // 2. Fetch all active customers
    const customers = await User.find({
      role: 'Customer',
      status: 'Active'
    });

    if (customers.length === 0) {
      return { success: false, error: 'No active customers found' };
    }

    // 3. Format products with Naira prices
    const formattedProducts = products.map(p => ({
      name: p.name,
      description: p.description,
      price: p.price,
      formattedPrice: formatPrice(p.price),
      image: p.image,
      category: p.category.name
    }));

    // 4. Send emails to all customers
    const sendPromises = customers.map(customer => 
      sendNewArrivalsEmail(
        customer.email,
        customer.name,
        formattedProducts
      )
    );

    await Promise.all(sendPromises);
    
    return {
      success: true,
      message: "Notifications sent successfully",
      recipientCount: customers.length,
      productCount: products.length
    };
    
  } catch (error) {
    console.error('Error sending new arrivals notification:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send notifications'
    };
  }
}