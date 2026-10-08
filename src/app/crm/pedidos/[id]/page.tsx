"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

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

const PARCELA_STATUS_COLORS: Record<string, string> = {
  PENDENTE: "text-yellow-400",
  PAGO: "text-green-400",
  VENCIDO: "text-red-400",
  CANCELADO: "text-gray-500",
};

export default function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  async function load() {
    const res = await fetch(`/api/pedidos/${id}`);
    const d = await res.json();
    setData(d);
    setStatus(d.pedido?.status || "AGUARDANDO");
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function alterarStatus(novoStatus: string) {
    setStatus(novoStatus);
    await fetch(`/api/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });
    load();
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  if (!data?.pedido) return <div className="p-8 text-center text-gray-500">Pedido não encontrado</div>;

  const { pedido, cliente, vendedor, proposta, parcelas } = data;

  return (
    <div>
      <PageHeader
        title={pedido.numero}
        subtitle={cliente?.nome || "Sem cliente"}
        actions={
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[pedido.status] || "bg-gray-800 text-gray-400"}`}>
              {STATUS_LABELS[pedido.status] || pedido.status}
            </span>
            <select value={status} onChange={e => alterarStatus(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Cliente", value: cliente?.nome || "-" },
            { label: "Proposta", value: proposta?.numero || "-" },
            { label: "Vendedor", value: vendedor?.nome || "-" },
            { label: "Valor Total", value: formatCurrency(Number(pedido.valorTotal || 0)) },
          ].map(item => (
            <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className="text-sm font-medium text-gray-200">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Parcelas */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-medium text-gray-300">Parcelas / Contas a Receber</h3>
          </div>

          {(parcelas || []).length === 0 ? (
            <div className="py-10 text-center text-gray-600 text-sm">Nenhuma parcela registrada</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Valor</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Pago em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {parcelas.map((p: any) => {
                  const totalLiq = (p.liquidacoes || []).reduce((acc: number, l: any) => acc + Number(l.valor), 0);
                  return (
                    <tr key={p.id} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-gray-400">{p.numero}ª</td>
                      <td className="px-4 py-3 text-gray-300">{formatDate(p.vencimento)}</td>
                      <td className="px-4 py-3 text-gray-200 font-medium text-right">{formatCurrency(Number(p.valor))}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${PARCELA_STATUS_COLORS[p.status] || "text-gray-400"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {totalLiq > 0 ? formatCurrency(totalLiq) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {pedido.observacoes && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Observações</h3>
            <p className="text-sm text-gray-400">{pedido.observacoes}</p>
          </div>
        )}
      </div>

      <div className="px-6 pb-4">
        <Link href="/crm/pedidos" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition w-fit">
          <ArrowLeft className="w-4 h-4" /> Voltar para Pedidos
        </Link>
      </div>
    </div>
  );
}
