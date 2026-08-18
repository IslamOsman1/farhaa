import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authenticateAdmin, assertAuthEnv } from '@/lib/admin-security';

function getRequestIp(req) {
  const forwarded =
    req?.headers?.['x-forwarded-for'] ||
    req?.headers?.get?.('x-forwarded-for') ||
    req?.headers?.['x-real-ip'] ||
    req?.headers?.get?.('x-real-ip');

  if (!forwarded) return 'unknown';
  return String(forwarded).split(',')[0].trim();
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        assertAuthEnv();
        const ip = getRequestIp(req);
        if (process.env.NODE_ENV !== 'production') {
          console.log('[auth-debug] authorize', {
            ip,
            username: credentials?.username || null,
            passwordLength: typeof credentials?.password === 'string' ? credentials.password.length : null,
          });
        }
        return authenticateAdmin(credentials, ip);
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username || null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
