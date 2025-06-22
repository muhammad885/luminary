import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./schemas/authSchema";
import { comparePasswords } from "./app/auth/password";

const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          // 1. Validate input fields
          const validatedFields = loginSchema.safeParse(credentials);
          if (!validatedFields.success) {
            throw new Error("Invalid credentials format");
          }

          const { email, password } = validatedFields.data;

          // 2. Fetch user from API
          const response = await fetch(
            `${process.env.NEXTAUTH_URL}/api/users?email=${email}`
          );
          
          if (!response.ok) {
            throw new Error("User lookup failed");
          }

          const user = await response.json();

          // 3. Verify user exists and has password
          if (!user?.password) {
            throw new Error("Invalid user record");
          }

          // 4. Compare passwords
          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          // 5. Return sanitized user object
          return {
            id: user._id?.toString(), // Ensure ID is string
            email: user.email,
            name: user.name,
            role: user.role
            // Add other safe fields as needed
          };

        } catch (error) {
          console.error("Authorization error:", error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
};

export default authConfig;