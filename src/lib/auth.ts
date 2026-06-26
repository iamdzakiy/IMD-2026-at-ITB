import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { authConfig } from '@/auth.config';
import { prisma } from '@/lib/db';

/**
 * ============================================================================
 * NEXTAUTH V5 CONFIGURATION - IMD 2026 at ITB 3.0
 * ============================================================================
 *
 * Dual authentication system:
 * 1. User Login (participants) - Credentials + Google OAuth
 * 2. Admin Login (staff) - Credentials only
 *
 * NextAuth v5 uses new export pattern with auth.ts
 * Auth config is split for edge compatibility (see auth.config.ts)
 *
 * NOTE: Not using PrismaAdapter to avoid OAuth account linking conflicts.
 * Users can use either credentials OR Google OAuth independently.
 * ============================================================================
 */

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect errors to login page
  },
  trustHost: true, // Required for NextAuth v5 in development
  providers: [
    // ==========================================
    // ADMIN CREDENTIALS PROVIDER
    // ==========================================
    Credentials({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username as string },
        });

        if (!admin) {
          return null;
        }

        if (!admin.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          admin.password,
        );

        if (!isPasswordValid) {
          return null;
        }
        return {
          id: admin.id,
          email: admin.email,
          name: admin.username,
          type: 'admin',
          role: admin.adminRole,
        };
      },
    }),

    // ==========================================
    // USER CREDENTIALS PROVIDER
    // ==========================================
    Credentials({
      id: 'user-credentials',
      name: 'User Login',
      credentials: {
        identifier: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: credentials.identifier as string },
              { email: credentials.identifier as string },
            ],
          },
        });

        if (!user || !user.active || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          type: 'user',
        };
      },
    }),

    // ==========================================
    // GOOGLE OAUTH PROVIDER (USER ONLY)
    // ==========================================
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      async profile(profile) {
        // Check if user exists in our database
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (existingUser) {
          return {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            image: existingUser.image,
            type: 'user',
          };
        }

        // For new users, return profile data (username will be created in signIn callback)
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          type: 'user',
        };
      },
    }),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow any relative URL
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allow any URL with same origin
      else if (new URL(url).origin === baseUrl) return url;
      // Default to homepage
      return baseUrl;
    },

    async signIn({ user, account, profile }) {
      // For Google OAuth users, ensure they have a username
      if (account?.provider === 'google' && user?.email) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Generate a unique username from email
          const baseUsername = user.email.split('@')[0];
          let username = baseUsername;
          let counter = 1;

          // Ensure username is unique
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          // Create the user with generated username
          await prisma.user.create({
            data: {
              username,
              email: user.email,
              name: user.name || user.email.split('@')[0],
              image: user.image || (profile?.picture as string),
              active: true, // Auto-activate OAuth users
            },
          });
        } else {
          // User exists with credentials - update their info and activate if not already
          // This allows users to login with Google even if they registered with email/password
          await prisma.user.update({
            where: { email: user.email },
            data: {
              image: user.image || (profile?.picture as string),
              active: true, // Activate account via Google OAuth
              emailVerified: new Date(), // Mark email as verified by Google
            },
          });
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user?.id) {
        token.type = (user as any).type || 'user';
        token.role = (user as any).role;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;

        // For Google OAuth users, the profile() callback may return
        // Google's `sub` as the id for NEW users (before DB creation).
        // The signIn callback creates the user with a Prisma UUID.
        // We must resolve the correct DB id by email lookup.
        if (account?.provider === 'google' && user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          token.id = dbUser?.id || user.id;
        } else {
          token.id = user.id;
        }
      }

      // Refresh user data from DB periodically (every 5 minutes)
      // or on first token creation (when user object exists)
      const now = Math.floor(Date.now() / 1000);
      const lastRefresh = (token.lastDbRefresh as number) || 0;
      const REFRESH_INTERVAL = 5 * 60; // 5 minutes

      if (now - lastRefresh > REFRESH_INTERVAL || user?.id) {
        try {
          if (token.type === 'admin') {
            const admin = await prisma.admin.findUnique({
              where: { id: token.id as string },
            });
            if (admin) {
              token.adminData = {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.adminRole,
                isActive: admin.isActive,
              };
            }
          } else {
            // Look up by id first, fall back to email for Google OAuth users
            let dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              include: {
                registration: {
                  include: {
                    competition: true,
                    team: true,
                  },
                },
              },
            });

            // Fallback: if id lookup fails (e.g. stale Google sub ID in token),
            // try by email and correct the token.id
            if (!dbUser && token.email) {
              dbUser = await prisma.user.findUnique({
                where: { email: token.email as string },
                include: {
                  registration: {
                    include: {
                      competition: true,
                      team: true,
                    },
                  },
                },
              });
              if (dbUser) {
                token.id = dbUser.id; // Fix the token id to the correct DB id
              }
            }

            if (dbUser) {
              token.userData = {
                id: dbUser.id,
                username: dbUser.username,
                email: dbUser.email,
                emailVerified: dbUser.emailVerified,
                name: dbUser.name,
                image: dbUser.image,
                registration: dbUser.registration,
              };
            }
          }
          token.lastDbRefresh = now;
        } catch (error) {
          console.error('[AUTH] Failed to refresh token data:', error);
          // Keep existing token data if DB query fails
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Use cached data from JWT token instead of querying DB every request
      if (token.type === 'admin') {
        if (token.adminData) {
          session.admin = token.adminData as any;
        } else {
          // Fallback: build from token fields
          session.admin = {
            id: token.id as string,
            username: token.name || '',
            email: token.email || '',
            role: token.role as any,
            isActive: true,
          };
        }
      } else {
        if (token.userData) {
          session.user = token.userData as any;
        } else {
          // Fallback: build from token fields
          session.user = {
            id: token.id as string,
            username: token.name || '',
            email: token.email || '',
            emailVerified: null,
            name: token.name || '',
            image: (token.picture as string) || null,
          };
        }
      }

      return session;
    },
  },
});
