// auth.js
import NextAuth from 'next-auth';
import authConfig from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    async signIn({ user, account }) {
      try {
        // Skip checks for OAuth accounts
        if (account?.provider !== 'credentials') return true;
        if (!user?.id) return false;

        
        const apiUrl = new URL(`/api/users/${user.id}`, process.env.NEXTAUTH_URL).toString();
        
        const userRes = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });

        
        // Handle non-JSON responses
        if (!userRes.ok) {
          const errorText = await userRes.text();
          console.error('API Error Response:', errorText);
          return {error: true, message: `API returned ${userRes.status}: ${errorText.substring(0, 100)}`}
        }

        const existingUser = await userRes.json();
        if (!existingUser?.isVerified) {
          console.log('User not verified');
          return false;
        }

        // Handle 2FA
        if (existingUser.isTwoFactorEnabled) {
          const twoFactorUrl = new URL(`/api/two-factor/${user.id}`, process.env.NEXTAUTH_URL).toString();
          const twoFactorRes = await fetch(twoFactorUrl);
          
          if (!twoFactorRes.ok) {
            console.error('2FA check failed:', twoFactorRes.status);
            return false;
          }
          
          const confirmation = await twoFactorRes.json();
          if (!confirmation) {
            console.error('2FA confirmation required');
            return false;
          }

          const deleteUrl = new URL(`/api/two-factor/${confirmation._id}`, process.env.NEXTAUTH_URL).toString();
          const deleteRes = await fetch(deleteUrl, { method: 'DELETE' });
          
          if (!deleteRes.ok) {
            console.error('Failed to delete 2FA confirmation');
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },

    async jwt({ token, user, trigger, session }) {
      try {
        if (user) {
          token.id = user.id;
          token.role = user.role;
          token.isTwoFactorEnabled = user.isTwoFactorEnabled;
        }

        if (trigger === 'update' && session?.callbackUrl) {
          token.callbackUrl = session.callbackUrl;
        }

        if (!token.role && token.sub) {
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/users/${token.sub}`);
          const existingUser = await res.json();
          if (existingUser) {
            token.role = existingUser.role;
            token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
          }
        }

        return token;
      } catch (error) {
        console.error('JWT error:', error);
        return token;
      }
    },

    async session({ token, session }) {
      try {
        if (token.sub && session.user) {
          session.user.id = token.sub;
          session.user.role = token.role;
          session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
        }
        session.callbackUrl = token.callbackUrl || '/';
        return session;
      } catch (error) {
        console.error('Session error:', error);
        return session;
      }
    },

    async redirect({ url, baseUrl }) {
      try {
        const parsedUrl = new URL(url, baseUrl);
        if (parsedUrl.pathname === '/auth/login' && parsedUrl.searchParams.has('callbackUrl')) {
          const callbackUrl = parsedUrl.searchParams.get('callbackUrl');
          if (callbackUrl?.startsWith('/') && !callbackUrl.startsWith('/auth')) {
            return new URL(callbackUrl, baseUrl).toString();
          }
        }
        return url.startsWith('/') ? new URL(url, baseUrl).toString() : url;
      } catch (error) {
        console.error('Redirect error:', error);
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
    maxAge: 60 * 60, // 1 hour
  },
  ...authConfig
});