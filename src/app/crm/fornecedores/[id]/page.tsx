"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Edit2, Check, X } from "lucide-react";

export default function FornecedorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<any>({});

  async function load() {
    const d = await fetch(`/api/fornecedores/${id}`).then(r => r.json());
    setData(d);
    setForm({
      nome: d.fornecedor?.nome || "",
      cnpj: d.fornecedor?.cnpj || "",
      email: d.fornecedor?.email || "",
      telefone: d.fornecedor?.telefone || "",
      contato: d.fornecedor?.contato || "",
      observacoes: d.fornecedor?.observacoes || "",
    });
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function salvar() {
    await fetch(`/api/fornecedores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditando(false);
    load();
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  if (!data?.fornecedor) return <div className="p-8 text-center text-gray-500">Fornecedor não encontrado</div>;

  const { fornecedor, produtos } = data;

  return (
    <div>
      <PageHeader title={fornecedor.nome} subtitle={fornecedor.cnpj ? `CNPJ: ${fornecedor.cnpj}` : "Sem CNPJ"} />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Dados do Fornecedor</h3>
              {!editando ? (
                <button onClick={() => setEditando(true)} className="text-gray-500 hover:text-white transition"><Edit2 className="w-4 h-4" /></button>
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
                  { label: "CNPJ", value: fornecedor.cnpj },
                  { label: "Contato", value: fornecedor.contato },
                  { label: "Telefone", value: fornecedor.telefone },
                  { label: "E-mail", value: fornecedor.email },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{f.label}</span>
                    <span className="text-sm text-gray-300">{f.value}</span>
                  </div>
                ))}
                {fornecedor.observacoes && (
                  <div className="border-t border-gray-800 pt-2.5">
                    <span className="text-xs text-gray-500 block mb-1">Observações</span>
                    <p className="text-sm text-gray-300">{fornecedor.observacoes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Nome *", key: "nome" },
                  { label: "CNPJ", key: "cnpj" },
                  { label: "Contato", key: "contato" },
                  { label: "Telefone", key: "telefone" },
                  { label: "E-mail", key: "email" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                    <input value={form[f.key]} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
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

        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Produtos Fornecidos</h3>
            {(produtos || []).length === 0 ? (
              <p className="text-sm text-gray-600">Nenhum produto vinculado</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="pb-2 text-xs font-medium text-gray-500 uppercase">Produto</th>
                    <th className="pb-2 text-xs font-medium text-gray-500 uppercase">Part Number</th>
                    <th className="pb-2 text-xs font-medium text-gray-500 uppercase text-right">Custo Fornecedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {produtos.map((p: any) => (
                    <tr key={p.id}>
                      <td className="py-2.5">
                        <Link href={`/crm/produtos/${p.produtoId}`} className="text-gray-200 hover:text-blue-400 transition-colors">
                          {p.produto?.nome || "-"}
                        </Link>
                      </td>
                      <td className="py-2.5 text-gray-500 font-mono text-xs">{p.produto?.partNumber || "-"}</td>
                      <td className="py-2.5 text-right text-gray-300">
                        {p.custoFornecedor ? formatCurrency(Number(p.custoFornecedor)) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-4">
        <Link href="/crm/fornecedores" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition w-fit">
          <ArrowLeft className="w-4 h-4" /> Voltar para Fornecedores
        </Link>
      </div>
    </div>
  );
}
