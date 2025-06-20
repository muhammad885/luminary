import mongoose from 'mongoose';
import ResetToken from "@/model/reset-password";
import TwoFactorToken from "@/model/two-factor";
import TwoFactorConfirmation from "@/model/two-factor-confirmation";

// Only attempt to connect if we're in a Node.js environment
const connectIfNeeded = async () => {
  if (typeof window === 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
    if (mongoose.connection.readyState === 0) { // 0 = disconnected
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      } catch (error) {
        console.error('MongoDB connection error:', error);
      }
    }
  }
};

export const getPasswordResetTokenByToken = async (token) => {
  try {
    await connectIfNeeded();
    return await ResetToken.findOne({ token });
  } catch (error) {
    console.error('Error fetching password reset token:', error);
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (email) => {
  try {
    await connectIfNeeded();
    return await ResetToken.findOne({ email });
  } catch (error) {
    console.error('Error fetching password reset token by email:', error);
    return null;
  }
};

export const getTwoFactorTokenByToken = async (token) => {
  if (!token) {
    console.warn("No token provided to getTwoFactorTokenByToken");
    return null;
  }

  try {
    await connectIfNeeded();
    return await TwoFactorToken.findOne({ token })
      .select('-__v')
      .lean();
  } catch (error) {
    console.error("Error fetching two-factor token:", error);
    return null;
  }
};

export const getTwoFactorTokenByEmail = async (email) => {
  if (!email) {
    console.warn("No email provided to getTwoFactorTokenByEmail");
    return null;
  }

  try {
    await connectIfNeeded();
    return await TwoFactorToken.findOne({ email }).lean();
  } catch (error) {
    console.error("Error fetching two-factor token by email:", error);
    return null;
  }
};

export const getTwoFactorConfirmationByUserId = async (userId) => {
  if (!userId) {
    console.warn('Invalid userId provided to getTwoFactorConfirmationByUserId');
    return null;
  }

  try {
    await connectIfNeeded();
    return await TwoFactorConfirmation.findOne({ userId })
      .select('-__v')
      .lean();
  } catch (error) {
    console.error("Error fetching two-factor confirmation:", error);
    return null;
  }
};

export const deleteTwoFactorConfirmationById = async (id) => {
  if (!id) {
    console.warn('Invalid id provided to deleteTwoFactorConfirmationById');
    return null;
  }

  try {
    await connectIfNeeded();
    return await TwoFactorConfirmation.findByIdAndDelete(id);
  } catch (error) {
    console.error("Error deleting two-factor confirmation:", error);
    return null;
  }
};