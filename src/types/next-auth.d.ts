// Extended NextAuth types for IMD 2026 at ITB v3.0

import 'next-auth';
import 'next-auth/jwt';

import { AdminRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      name: string;
      image: string | null;
      registration?: any;
    };
    admin?: {
      id: string;
      username: string;
      email: string;
      role: AdminRole;
      isActive: boolean;
    };
  }

  interface User {
    id: string;
    username?: string;
    email: string;
    name?: string;
    image?: string | null;
    type?: 'user' | 'admin';
    role?: AdminRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    type: 'user' | 'admin';
    username?: string;
    role?: AdminRole;
    email?: string;
    name?: string;
    picture?: string | null;
  }
}
