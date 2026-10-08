"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { TemperaturaInput } from "@/components/ui/TemperaturaInput";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Search } from "lucide-react";

export default function OportunidadesPage() {
  const [oportunidades, setOportunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/oportunidades");
    const data = await res.json();
    setOportunidades(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = oportunidades.filter((row) => {
    const q = search.toLowerCase();
    return (
      row.oportunidade.titulo?.toLowerCase().includes(q) ||
      row.cliente?.nome?.toLowerCase().includes(q) ||
      row.vendedor?.nome?.toLowerCase().includes(q) ||
      row.status?.nome?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Oportunidades"
        subtitle={`${oportunidades.length} oportunidade${oportunidades.length !== 1 ? "s" : ""}`}
      />

      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, cliente, status..."
            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-500">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-500">Nenhuma oportunidade encontrada</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Título / Cliente</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Temp.</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Est.</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Criado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((row) => (
                  <tr key={row.oportunidade.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/crm/oportunidades/${row.oportunidade.id}`} className="hover:text-blue-400 transition-colors">
                        <div className="font-medium text-gray-200">{row.oportunidade.titulo}</div>
                        {row.cliente?.nome && <div className="text-xs text-gray-500">{row.cliente.nome}</div>}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {row.status ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                          {row.status.nome}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <TemperaturaInput value={row.oportunidade.temperatura} readOnly size="sm" />
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {row.oportunidade.valorEstimado ? formatCurrency(Number(row.oportunidade.valorEstimado)) : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{row.vendedor?.nome || "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(row.oportunidade.criadoEm)}</td>
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
