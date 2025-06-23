import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./schemas/authSchema";
import { comparePasswords } from "./app/auth/password";

const isProduction = process.env.NODE_ENV === "production";
const cookiePrefix = isProduction ? "__Secure-" : "";
const cookieSecure = isProduction;

export const authConfig = {
  // Required secret - must be 32+ characters
  secret: process.env.NEXTAUTH_SECRET,

  // Configure authentication providers
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
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/users?email=${email}`
          );
          
          if (!response.ok) throw new Error("User lookup failed");

          console.log(response)

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

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Cookie settings
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: cookieSecure,
        domain: isProduction ? ".yourdomain.com" : undefined,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: cookieSecure,
      },
    },
    csrfToken: {
      name: `${isProduction ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: cookieSecure,
      },
    },
  },

  // Callbacks
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
  },

  // Custom pages
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  // Debugging
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error(code, metadata);
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      console.log(code, metadata);
    }
  },
};