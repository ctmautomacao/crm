"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Search } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  AGUARDANDO: "bg-yellow-900/30 text-yellow-400",
  APROVADO: "bg-blue-900/30 text-blue-400",
  EM_PRODUCAO: "bg-purple-900/30 text-purple-400",
  ENTREGUE: "bg-green-900/30 text-green-400",
  CANCELADO: "bg-red-900/30 text-red-400",
  FATURADO: "bg-gray-700 text-gray-300",
};

const STATUS_LABELS: Record<string, string> = {
  AGUARDANDO: "Aguardando", APROVADO: "Aprovado", EM_PRODUCAO: "Em Produção",
  ENTREGUE: "Entregue", CANCELADO: "Cancelado", FATURADO: "Faturado",
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/pedidos").then(r => r.json()).then(data => {
      setPedidos(data);
      setLoading(false);
    });
  }, []);

  const filtered = pedidos.filter(row => {
    const q = search.toLowerCase();
    return (
      row.pedido.numero?.toLowerCase().includes(q) ||
      row.cliente?.nome?.toLowerCase().includes(q) ||
      row.pedido.status?.toLowerCase().includes(q)
    );
  });

  const totalGeral = pedidos.reduce((acc, r) => acc + Number(r.pedido.valorTotal || 0), 0);

  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle={`${pedidos.length} pedido${pedidos.length !== 1 ? "s" : ""} · ${formatCurrency(totalGeral)} em volume`}
      />

      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por número, cliente, status..."
            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-600" />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-500">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-500">Nenhum pedido encontrado</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Número</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Valor Total</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Vendedor</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Criado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(row => (
                  <tr key={row.pedido.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/crm/pedidos/${row.pedido.id}`} className="font-mono text-blue-400 hover:text-blue-300">
                        {row.pedido.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{row.cliente?.nome || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.pedido.status] || "bg-gray-800 text-gray-400"}`}>
                        {STATUS_LABELS[row.pedido.status] || row.pedido.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-200 font-medium text-right">{formatCurrency(Number(row.pedido.valorTotal || 0))}</td>
                    <td className="px-4 py-3 text-gray-400">{row.vendedor?.nome || "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(row.pedido.criadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
