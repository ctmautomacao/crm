"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusLeadVariant, statusLeadLabel } from "@/components/ui/Badge";
import { TemperaturaInput } from "@/components/ui/TemperaturaInput";
import { formatDate } from "@/lib/utils";
import { Plus, Search } from "lucide-react";
import { NovoLeadModal } from "@/components/leads/NovoLeadModal";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/leads");
    const data = await res.json();
    setLeads(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = leads.filter((row) => {
    const q = search.toLowerCase();
    return (
      row.lead.nomeContato?.toLowerCase().includes(q) ||
      row.lead.empresa?.toLowerCase().includes(q) ||
      row.vendedor?.nome?.toLowerCase().includes(q) ||
      row.lead.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} lead${leads.length !== 1 ? "s" : ""}`}
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Novo Lead
          </button>
        }
      />

      <div className="p-6">
        {/* Filtro */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, empresa, status..."
            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Tabela */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-500">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-500">Nenhum lead encontrado</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contato / Empresa</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Temp.</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Criado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((row) => (
                  <tr key={row.lead.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/crm/leads/${row.lead.id}`} className="hover:text-blue-400 transition-colors">
                        <div className="font-medium text-gray-200">{row.lead.nomeContato}</div>
                        {row.lead.empresa && <div className="text-xs text-gray-500">{row.lead.empresa}</div>}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusLeadVariant[row.lead.status]}>
                        {statusLeadLabel[row.lead.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <TemperaturaInput value={row.lead.temperatura} readOnly size="sm" />
                    </td>
                    <td className="px-4 py-3 text-gray-400">{row.vendedor?.nome || "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(row.lead.criadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <NovoLeadModal
          onClose={() => setModalOpen(false)}
          onCreated={() => { setModalOpen(false); load(); }}
        />
      )}
    </div>
  );
}
