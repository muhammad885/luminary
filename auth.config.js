import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./schemas/authSchema";
import { comparePasswords } from "./app/auth/password";

const isProduction = process.env.NODE_ENV === "production";
const siteUrl = new URL(process.env.NEXTAUTH_URL);
const cookieDomain = isProduction ? siteUrl.hostname : undefined;

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Critical for Netlify

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const validatedFields = loginSchema.safeParse(credentials);
          if (!validatedFields.success) {
            throw new Error("Invalid credentials format");
          }

          const { email, password } = validatedFields.data;
          const response = await fetch(
            `${process.env.NEXTAUTH_URL}/api/users?email=${email}`
          );
          
          if (!response.ok) throw new Error("User lookup failed");

          const user = await response.json();
          if (!user?.password) throw new Error("Invalid user record");

          const isValid = await comparePasswords(password, user.password);
          if (!isValid) throw new Error("Invalid password");

          return {
            id: user._id?.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            isVerified: user.isVerified,
            isTwoFactorEnabled: user.isTwoFactorEnabled
          };
        } catch (error) {
          console.error("Authorization error:", error.message || String(error));
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        domain: cookieDomain,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        domain: cookieDomain,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        domain: cookieDomain,
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.isTwoFactorEnabled = user.isTwoFactorEnabled;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.isVerified = token.isVerified;
      session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Fix for Netlify URL resolution
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

};