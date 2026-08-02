import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// Removed bcrypt and prisma imports as they are no longer needed for fixed admin

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const validUsername = process.env.ADMIN_USERNAME || 'admin';
        const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (credentials.username === validUsername && credentials.password === validPassword) {
          return { id: 'admin', name: 'المدير', role: 'ADMIN' };
        } 
        
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: { signIn: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET || 'farha-secret-key-change-in-production',
};
