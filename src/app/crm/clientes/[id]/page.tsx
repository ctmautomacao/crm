"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusLeadVariant, statusLeadLabel } from "@/components/ui/Badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft, Edit2, Check, X } from "lucide-react";

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<any>({});

  async function load() {
    const res = await fetch(`/api/clientes/${id}`);
    const d = await res.json();
    setData(d);
    setForm({
      nome: d.cliente?.nome || "",
      cpfCnpj: d.cliente?.cpfCnpj || "",
      email: d.cliente?.email || "",
      telefone: d.cliente?.telefone || "",
      endereco: d.cliente?.endereco || "",
      cidade: d.cliente?.cidade || "",
      estado: d.cliente?.estado || "",
      cep: d.cliente?.cep || "",
      observacoes: d.cliente?.observacoes || "",
    });
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function salvar() {
    await fetch(`/api/clientes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditando(false);
    load();
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  if (!data?.cliente) return <div className="p-8 text-center text-gray-500">Cliente não encontrado</div>;

  const { cliente, leads, pedidos } = data;

  return (
    <div>
      <PageHeader title={cliente.nome} subtitle={cliente.cpfCnpj || "Sem CPF/CNPJ"} />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Dados do Cliente</h3>
              {!editando ? (
                <button onClick={() => setEditando(true)} className="text-gray-500 hover:text-white transition">
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={salvar} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditando(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            {!editando ? (
              <div className="space-y-2.5">
                {[
                  { label: "Nome", value: cliente.nome },
                  { label: "CPF/CNPJ", value: cliente.cpfCnpj },
                  { label: "E-mail", value: cliente.email },
                  { label: "Telefone", value: cliente.telefone },
                  { label: "Endereço", value: cliente.endereco },
                  { label: "Cidade", value: cliente.cidade },
                  { label: "Estado", value: cliente.estado },
                  { label: "CEP", value: cliente.cep },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} className="flex items-start justify-between gap-2">
                    <span className="text-xs text-gray-500 flex-shrink-0">{f.label}</span>
                    <span className="text-sm text-gray-300 text-right">{f.value}</span>
                  </div>
                ))}
                {cliente.observacoes && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Observações</span>
                    <p className="text-sm text-gray-300">{cliente.observacoes}</p>
                  </div>
                )}
                <div className="pt-1 text-xs text-gray-600">Cadastrado em {formatDate(cliente.criadoEm)}</div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Nome *", key: "nome", required: true },
                  { label: "CPF/CNPJ", key: "cpfCnpj" },
                  { label: "E-mail", key: "email", type: "email" },
                  { label: "Telefone", key: "telefone" },
                  { label: "Endereço", key: "endereco" },
                  { label: "Cidade", key: "cidade" },
                  { label: "Estado", key: "estado" },
                  { label: "CEP", key: "cep" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                    <input type={f.type || "text"} value={form[f.key]} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Observações</label>
                  <textarea rows={3} value={form.observacoes} onChange={e => setForm((p: any) => ({ ...p, observacoes: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Leads */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Leads</h3>
            {(leads || []).length === 0 ? (
              <p className="text-sm text-gray-600">Nenhum lead vinculado</p>
            ) : (
              <div className="space-y-2">
                {leads.map((l: any) => (
                  <Link key={l.id} href={`/crm/leads/${l.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
                    <span className="text-sm text-gray-200">{l.nomeContato}</span>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusLeadVariant[l.status]}>{statusLeadLabel[l.status]}</Badge>
                      <span className="text-xs text-gray-500">{formatDate(l.criadoEm)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pedidos */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Pedidos</h3>
            {(pedidos || []).length === 0 ? (
              <p className="text-sm text-gray-600">Nenhum pedido vinculado</p>
            ) : (
              <div className="space-y-2">
                {pedidos.map((p: any) => (
                  <Link key={p.id} href={`/crm/pedidos/${p.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
                    <span className="font-mono text-sm text-blue-400">{p.numero}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{p.status}</span>
                      <span className="text-sm font-medium text-gray-200">{formatCurrency(Number(p.valorTotal || 0))}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-4">
        <Link href="/crm/clientes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition w-fit">
          <ArrowLeft className="w-4 h-4" /> Voltar para Clientes
        </Link>
      </div>
    </div>
  );
}
