"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  ShoppingCart,
  Package,
  Building2,
  Truck,
  Settings,
  LogOut,
  Zap,
  AlertTriangle,
} from "lucide-react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    perfil: "GERENTE" | "VENDEDOR";
    sistema: boolean;
  };
}

const navItems = [
  { href: "/crm/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/crm/leads", icon: Users, label: "Leads" },
  { href: "/crm/oportunidades", icon: Briefcase, label: "Oportunidades" },
  { href: "/crm/cotacoes", icon: FileText, label: "Cotações" },
  { href: "/crm/propostas", icon: FileText, label: "Propostas" },
  { href: "/crm/pedidos", icon: ShoppingCart, label: "Pedidos" },
  { divider: true },
  { href: "/crm/clientes", icon: Building2, label: "Clientes" },
  { href: "/crm/fornecedores", icon: Truck, label: "Fornecedores" },
  { href: "/crm/produtos", icon: Package, label: "Produtos" },
  { divider: true },
  { href: "/crm/configuracoes", icon: Settings, label: "Configurações" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">CTM CRM</div>
            <div className="text-xs text-gray-500">Automação</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          if ("divider" in item) {
            return <div key={i} className="my-2 border-t border-gray-800" />;
          }

          const active = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-blue-600/15 text-blue-400 font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-800 p-3">
        {user.sistema && (
          <div className="flex items-center gap-1.5 px-2 py-1 mb-2 bg-yellow-900/30 border border-yellow-800/50 rounded-md text-yellow-500 text-xs">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            Conta sistema
          </div>
        )}
        <div className="px-2 mb-2">
          <div className="text-sm font-medium text-gray-200 truncate">{user.name}</div>
          <div className="text-xs text-gray-500 truncate">{user.email}</div>
          <div className="text-xs mt-0.5">
            <span className={cn(
              "inline-block px-1.5 py-0.5 rounded text-xs font-medium",
              user.perfil === "GERENTE"
                ? "bg-purple-900/50 text-purple-400"
                : "bg-gray-800 text-gray-400"
            )}>
              {user.perfil === "GERENTE" ? "Gerente" : "Vendedor"}
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
