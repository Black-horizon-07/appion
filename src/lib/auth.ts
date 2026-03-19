import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    // Required when using credentials provider because the JWT session strategy
    // must be used (not database sessions)
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !(user as any).password) {
          throw new Error("No account found with this email");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          (user as any).password
        );

        if (!isCorrectPassword) {
          throw new Error("Incorrect password");
        }

        // Return clean user object without password
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    })
  ],
  pages: {
    signIn: "/",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("signIn callback:", { userEmail: user?.email, provider: account?.provider });
        if (account?.provider === "google" && profile?.email) {
          const existingUser = await db.user.findUnique({
            where: { email: profile.email },
          });

          if (existingUser) {
            // Just update image if missing
            if (!existingUser.image && (user as any).image) {
              await db.user.update({
                where: { id: existingUser.id },
                data: { image: (user as any).image },
              });
            }
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true; // Still return true so the flow doesn't break
      }
    },
    async session({ session, token, user }) {
       // With database sessions (like Google OAuth originally used) user will exist
       // With JWT sessions (Credentials provider) token will exist and hold sub/id
      if (session?.user) {
        // @ts-ignore
        session.user.id = token?.sub || user?.id;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      // When a user signs in with Google, ensure the token's sub is the existing
      // user's ID if an account was linked
      if (account?.provider === "google" && token.email) {
        const existingUser = await db.user.findUnique({
          where: { email: token.email },
        });
        if (existingUser) {
          token.sub = existingUser.id;
        }
      }
      return token;
    }
  }
};
