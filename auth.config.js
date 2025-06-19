import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./schemas/authSchema";
import { getUserByEmail } from "./data/user";

const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({

      async authorize(credentials) {

        const validatedFields = loginSchema.safeParse(credentials);

        if(validatedFields.success){
          const { email, password} = validatedFields.data;

          const user = await getUserByEmail(email)
          if (!user) return null;

          const isValid = await bcrypt.compare(password, user.password);
           if (!isValid) return null;

        return {
          id: user._id,
          email: user.email,
          name: user.name,
        };
        }
        
      },
    }),
  ],
};

export default authConfig;
