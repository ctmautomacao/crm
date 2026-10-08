import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    tenantId: string;
    tenantSlug: string;
    perfil: "GERENTE" | "VENDEDOR";
    sistema: boolean;
    comissaoPct: number;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      tenantId: string;
      tenantSlug: string;
      perfil: "GERENTE" | "VENDEDOR";
      sistema: boolean;
      comissaoPct: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenantId: string;
    tenantSlug: string;
    perfil: "GERENTE" | "VENDEDOR";
    sistema: boolean;
    comissaoPct: number;
  }
}
