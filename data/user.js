
import dbConnect from '@/lib/mongodb';
import User from '@/model/User';
import mongoose from 'mongoose';

export const getUserByEmail = async (email) => {
  if (!email || typeof email !== 'string') {
    console.error('Invalid email parameter');
    return null;
  }

  try {
    await dbConnect()

    const user = await User.findOne({ email })
      .lean(); // Convert to plain JavaScript object

    if (!user) {
      console.log(`No user found with email: ${email}`);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error fetching user by email:', error.message);
    return null;
  }
};

export const getUserById = async (id) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      await dbConnect()
  
      const user = await User.findById(id);
      return user;
    } catch (error) {
      return { 
        success: false, error: 'Error fetching user by ID:', error
      }
    }
  };