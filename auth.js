
import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { getUserById } from './data/user';
import { getTwoFactorConfirmationByUserId } from './data/password-reset-token';
import { deleteTwoFactorConfirmationById } from './data/two-factor';

import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/mongodb-driver";

export const DEFAULT_LOGIN_REDIRECT = '/dashboard';

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    async signIn({ user }) {
      try {
        if (!user?.id) return false;
        const existingUser = await getUserById(user.id);
        if (!existingUser?.isVerified) return false;

        if (existingUser.isTwoFactorEnabled) {
      const confirmation = await getTwoFactorConfirmationByUserId(existingUser._id);
      if (!confirmation) return false;

      await deleteTwoFactorConfirmationById(confirmation._id);
    }

        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },

    async jwt({ token, user, trigger, session }) {
      try {
        // Initial login — store user info in token
        if (user) {
          token.id = user.id;
          token.role = user.role;
          token.isTwoFactorEnabled = user.isTwoFactorEnabled;
        }

        // Update callback URL (optional)
        if (trigger === 'update' && session?.callbackUrl) {
          token.callbackUrl = session.callbackUrl;
        }

        // If role is not in token, fetch from DB
        if (!token.role) {
          const existingUser = await getUserById(token.sub);
          if (existingUser) {
            token.role = existingUser.role;
            token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
          }
        }

        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },

    async session({ token, session }) {
      try {
        if (token?.sub && session.user) {
          session.user.id = token.sub;
        }

        if (session.user) {
          session.user.role = token.role;
          session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
        }

        session.callbackUrl = token.callbackUrl || DEFAULT_LOGIN_REDIRECT;

        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },

    async redirect({ url, baseUrl }) {
      try {
        const parsedUrl = new URL(url, baseUrl);
        const searchParams = parsedUrl.searchParams;

        if (parsedUrl.pathname === '/auth/login' && searchParams.has('callbackUrl')) {
          const callbackUrl = searchParams.get('callbackUrl');
          if (callbackUrl?.startsWith('/') && !callbackUrl.startsWith('/auth')) {
            return new URL(callbackUrl, baseUrl).toString();
          }
        }

        if (url.startsWith('/auth')) {
          return new URL(DEFAULT_LOGIN_REDIRECT, baseUrl).toString();
        }

        if (url.startsWith('/')) {
          return new URL(url, baseUrl).toString();
        }

        if (new URL(url).origin === baseUrl) {
          return url;
        }

        return baseUrl;
      } catch (error) {
        console.error('Redirect callback error:', error);
        return baseUrl;
      }
    }
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60, // 1 hour in seconds
  },

  ...authConfig
});
