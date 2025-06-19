const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `PRD-${Math.floor(100000 + Math.random() * 900000)}`
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
      set: v => parseFloat(v.toFixed(2))
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
      set: v => parseFloat(v.toFixed(2))
    },
    discountedPrice: {
      type: Number,
      required: [true, 'Discounted price is required'],
      min: [0, 'Discounted price cannot be negative'],
      set: v => parseFloat(v.toFixed(2))
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required']
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    image: {
      type: String,
      validate: {
        validator: v => {
          if (!v) return true;
          return v.startsWith('data:image/') && v.includes(';base64,');
        },
        message: 'Invalid image format'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    features: {
      type: [{
        type: String,
        trim: true,
        maxlength: [50, 'Feature cannot exceed 50 characters']
      }],
      default: [],
      validate: {
        validator: v => v.length <= 20,
        message: 'Cannot have more than 20 features'
      }
    },
    tags: {
      type: [String],
      default: [],
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Removed: Validation that checked if discountedPrice > price

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (!this.price || !this.discountedPrice) return 0;
  return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
});

// Indexes
ProductSchema.index({
  name: 'text',
  description: 'text',
  features: 'text'
});
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ price: 1, isActive: 1 });
ProductSchema.index({ discountedPrice: 1 });
ProductSchema.index({ stock: 1 });

// Middleware to validate category exists
ProductSchema.pre('save', async function(next) {
  if (this.isModified('category')) {
    const category = await mongoose.model('Category').findById(this.category);
    if (!category) {
      throw new Error('Invalid category reference');
    }
  }
  
  // Validate purchase price vs selling price
  if (this.purchasePrice > this.price) {
    throw new Error('Purchase price cannot be greater than selling price');
  }
  
  next();
});

// Query helper
ProductSchema.query.active = function() {
  return this.where({ isActive: true });
};

// Static method
ProductSchema.statics.findByPriceRange = function(min, max) {
  return this.find({
    price: { $gte: min, $lte: max },
    isActive: true
  });
};

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);