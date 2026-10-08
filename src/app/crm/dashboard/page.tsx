import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/db";
import { leads, oportunidades, propostas, pedidos } from "@/db/schema";
import { eq, and, count, sum } from "drizzle-orm";
import { Users, Briefcase, CheckCircle, ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats(tenantId: string, vendedorId: string, isGerente: boolean) {
  const whereL = isGerente ? eq(leads.tenantId, tenantId) : and(eq(leads.tenantId, tenantId), eq(leads.vendedorId, vendedorId));
  const whereO = isGerente ? eq(oportunidades.tenantId, tenantId) : and(eq(oportunidades.tenantId, tenantId), eq(oportunidades.vendedorId, vendedorId));
  const whereP = isGerente ? and(eq(propostas.tenantId, tenantId), eq(propostas.status, "APROVADA")) : and(eq(propostas.tenantId, tenantId), eq(propostas.vendedorId, vendedorId), eq(propostas.status, "APROVADA"));
  const wherePed = isGerente ? eq(pedidos.tenantId, tenantId) : and(eq(pedidos.tenantId, tenantId), eq(pedidos.vendedorId, vendedorId));

  const [[tl], [to], [tpa], [tp]] = await Promise.all([
    db.select({ c: count() }).from(leads).where(whereL as any),
    db.select({ c: count() }).from(oportunidades).where(whereO as any),
    db.select({ c: count() }).from(propostas).where(whereP as any),
    db.select({ c: count(), s: sum(pedidos.valorTotal) }).from(pedidos).where(wherePed as any),
  ]);

  return {
    leads: tl.c,
    oportunidades: to.c,
    propostasAprovadas: tpa.c,
    pedidos: { count: tp.c, total: Number(tp.s ?? 0) },
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const stats = await getStats(
    session.user.tenantId,
    session.user.id!,
    session.user.perfil === "GERENTE"
  );

  const cards = [
    {
      label: "Leads",
      value: stats.leads,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-900/20",
      border: "border-blue-900/50",
    },
    {
      label: "Oportunidades",
      value: stats.oportunidades,
      icon: Briefcase,
      color: "text-purple-400",
      bg: "bg-purple-900/20",
      border: "border-purple-900/50",
    },
    {
      label: "Propostas Aprovadas",
      value: stats.propostasAprovadas,
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-900/20",
      border: "border-green-900/50",
    },
    {
      label: "Pedidos — Volume Total",
      value: formatCurrency(stats.pedidos.total),
      sub: `${stats.pedidos.count} pedido${stats.pedidos.count !== 1 ? "s" : ""}`,
      icon: ShoppingCart,
      color: "text-orange-400",
      bg: "bg-orange-900/20",
      border: "border-orange-900/50",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Olá, ${session.user.name?.split(" ")[0]}! Bom trabalho.`}
      />

      <div className="p-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`rounded-xl border ${card.border} ${card.bg} p-5`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-gray-400">{card.label}</p>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.bg}`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                {card.sub && <p className="text-xs text-gray-500 mt-1">{card.sub}</p>}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Pipeline</h3>
            <div className="space-y-3">
              {[
                { label: "Leads novos", value: stats.leads, color: "bg-blue-600" },
                { label: "Oportunidades abertas", value: stats.oportunidades, color: "bg-purple-600" },
                { label: "Propostas aprovadas", value: stats.propostasAprovadas, color: "bg-green-600" },
                { label: "Pedidos", value: stats.pedidos.count, color: "bg-orange-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-gray-400 flex-shrink-0">{item.label}</div>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${Math.min(100, (item.value / Math.max(stats.leads, 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-300 w-6 text-right">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Acesso rápido</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/crm/leads", label: "Novo Lead", color: "bg-blue-600 hover:bg-blue-500" },
                { href: "/crm/oportunidades", label: "Oportunidades", color: "bg-purple-600 hover:bg-purple-500" },
                { href: "/crm/propostas", label: "Nova Proposta", color: "bg-green-700 hover:bg-green-600" },
                { href: "/crm/pedidos", label: "Pedidos", color: "bg-orange-700 hover:bg-orange-600" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`${item.color} text-white text-sm font-medium text-center py-2.5 rounded-lg transition-colors`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
