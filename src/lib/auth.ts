import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { vendedores, tenants } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [vendedor] = await db
          .select()
          .from(vendedores)
          .where(and(eq(vendedores.email, credentials.email), eq(vendedores.ativo, true)))
          .limit(1);

        if (!vendedor) return null;

        const senhaCorreta = await bcrypt.compare(credentials.password, vendedor.senhaHash);
        if (!senhaCorreta) return null;

        const [tenant] = await db
          .select()
          .from(tenants)
          .where(and(eq(tenants.id, vendedor.tenantId), eq(tenants.ativo, true)))
          .limit(1);

        if (!tenant) return null;

        return {
          id: vendedor.id,
          email: vendedor.email,
          name: vendedor.nome,
          tenantId: vendedor.tenantId,
          tenantSlug: tenant.slug,
          perfil: vendedor.perfil,
          sistema: vendedor.sistema,
          comissaoPct: vendedor.comissaoPct,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = (user as any).tenantId;
        token.tenantSlug = (user as any).tenantSlug;
        token.perfil = (user as any).perfil;
        token.sistema = (user as any).sistema;
        token.comissaoPct = (user as any).comissaoPct;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).tenantSlug = token.tenantSlug;
        (session.user as any).perfil = token.perfil;
        (session.user as any).sistema = token.sistema;
        (session.user as any).comissaoPct = token.comissaoPct;
      }
      return session;
    },
  },
};
