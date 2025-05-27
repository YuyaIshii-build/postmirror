// app/api/auth/[...nextauth]/route.ts


import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // JWTセッション管理
  },
  pages: {
    signIn: "/login", // ログインページの指定（任意）
  },
  callbacks: {
    // JWTコールバックでuser.idをtokenに格納
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;  // user.idをtoken.idに設定
      }
      console.log("🔑 JWT コールバック:", token); // デバッグ用
      return token;
    },
    // セッションコールバックでtoken.idをsession.user.idに格納
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;  // token.idをsession.user.idに設定
      }
      console.log("🔑 セッションコールバック:", session); // デバッグ用
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // セッションのセキュリティ
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };