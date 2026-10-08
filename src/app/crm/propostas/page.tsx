"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusPropostaVariant, statusPropostaLabel } from "@/components/ui/Badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Search } from "lucide-react";

export default function PropostasPage() {
  const [propostas, setPropostas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/propostas").then(r => r.json()).then(data => {
      setPropostas(data);
      setLoading(false);
    });
  }, []);

  const filtered = propostas.filter(row => {
    const q = search.toLowerCase();
    return (
      row.proposta.numero?.toLowerCase().includes(q) ||
      row.cliente?.nome?.toLowerCase().includes(q) ||
      row.proposta.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Propostas"
        subtitle={`${propostas.length} proposta${propostas.length !== 1 ? "s" : ""}`}
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
            <div className="py-16 text-center text-gray-500">Nenhuma proposta encontrada</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Criada em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(row => (
                  <tr key={row.proposta.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/crm/propostas/${row.proposta.id}`} className="font-mono text-blue-400 hover:text-blue-300">
                        {row.proposta.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{row.cliente?.nome || "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusPropostaVariant[row.proposta.status]}>
                        {statusPropostaLabel[row.proposta.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-300 font-medium">
                      {formatCurrency(Number(row.proposta.valorTotal || 0))}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{row.vendedor?.nome || "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(row.proposta.criadoEm)}</td>
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
