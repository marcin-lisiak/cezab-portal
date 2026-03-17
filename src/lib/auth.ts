import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const isDev = process.env.NODE_ENV !== "production";

const credentials = CredentialsProvider({
  name: "DEV login",
  credentials: {
    email: { label: "E-mail", type: "text" },
  },
  async authorize(credentials) {
    const email = String(credentials?.email || "").trim().toLowerCase();
    if (!email) return null;

    // Zawsze upewnij się, że użytkownik istnieje w bazie i użyj jego realnego ID (cuid)
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: email.split("@")[0] },
    });
    return { id: user.id, email: user.email, name: user.name || undefined } as any;
  },
});

const emailProvider = EmailProvider({
  server: {
    host: process.env.EMAIL_SERVER_HOST as string,
    port: Number(process.env.EMAIL_SERVER_PORT || 587),
    auth: {
      user: process.env.EMAIL_SERVER_USER as string,
      pass: process.env.EMAIL_SERVER_PASSWORD as string,
    },
  },
  from: process.env.EMAIL_FROM,
  async sendVerificationRequest({ identifier, url }) {
    if (isDev && !process.env.EMAIL_SERVER_HOST) {
      // eslint-disable-next-line no-console
      console.log("[DEV LOGIN LINK]", url);
      return;
    }
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT || 587),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
    await transporter.sendMail({
      to: identifier,
      from: process.env.EMAIL_FROM,
      subject: "Logowanie do CEZAB Portal",
      text: `Kliknij, aby się zalogować: ${url}`,
      html: `<p>Kliknij, aby się zalogować: <a href=\"${url}\">${url}</a></p>`,
    });
  },
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    ...(isDev ? [credentials] : []),
    ...(process.env.EMAIL_SERVER_HOST ? [emailProvider] : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && (user as any).id) {
        token.sub = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
};
