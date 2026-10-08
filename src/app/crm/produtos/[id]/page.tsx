"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Edit2, Check, X } from "lucide-react";

export default function ProdutoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabelas, setTabelas] = useState<any>({});
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<any>({});

  async function load() {
    const [pRes, tRes] = await Promise.all([
      fetch(`/api/produtos/${id}`),
      fetch("/api/configuracoes/tabelas"),
    ]);
    const d = await pRes.json();
    const t = await tRes.json();
    setData(d);
    setTabelas(t);
    setForm({
      nome: d.produto?.nome || "",
      descricao: d.produto?.descricao || "",
      partNumber: d.produto?.partNumber || "",
      codigoBarras: d.produto?.codigoBarras || "",
      ncm: d.produto?.ncm || "",
      unidade: d.produto?.unidade || "UN",
      marcaId: d.produto?.marcaId || "",
      categoriaId: d.produto?.categoriaId || "",
      grupoId: d.produto?.grupoId || "",
      custoAtual: d.produto?.custoAtual || "",
      margemBrutaPadrao: d.produto?.margemBrutaPadrao || "20",
      indicePadrao: d.produto?.indicePadrao || "0",
    });
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function salvar() {
    await fetch(`/api/produtos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditando(false);
    load();
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  if (!data?.produto) return <div className="p-8 text-center text-gray-500">Produto não encontrado</div>;

  const { produto, marca, categoria, grupo, fornecedores, historico } = data;

  return (
    <div>
      <PageHeader title={produto.nome} subtitle={produto.partNumber ? `PN: ${produto.partNumber}` : "Sem Part Number"} />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Dados do Produto</h3>
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
                  { label: "Part Number", value: produto.partNumber },
                  { label: "NCM", value: produto.ncm },
                  { label: "Cód. Barras", value: produto.codigoBarras },
                  { label: "Unidade", value: produto.unidade },
                  { label: "Marca", value: marca?.nome },
                  { label: "Categoria", value: categoria?.nome },
                  { label: "Grupo", value: grupo?.nome },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{f.label}</span>
                    <span className="text-sm text-gray-300">{f.value}</span>
                  </div>
                ))}
                <div className="border-t border-gray-800 pt-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Custo Atual</span>
                    <span className="text-sm font-medium text-gray-200">{produto.custoAtual ? formatCurrency(Number(produto.custoAtual)) : "-"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Margem Bruta Padrão</span>
                    <span className="text-sm text-blue-400">{produto.margemBrutaPadrao}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Índice Padrão</span>
                    <span className="text-sm text-gray-400">{produto.indicePadrao}%</span>
                  </div>
                </div>
                {produto.descricao && (
                  <div className="border-t border-gray-800 pt-2.5">
                    <span className="text-xs text-gray-500 block mb-1">Descrição</span>
                    <p className="text-sm text-gray-300">{produto.descricao}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Nome *", key: "nome" },
                  { label: "Descrição", key: "descricao" },
                  { label: "Part Number", key: "partNumber" },
                  { label: "Cód. Barras", key: "codigoBarras" },
                  { label: "NCM", key: "ncm" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                    <input value={form[f.key]} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                ))}
                {[
                  { label: "Marca", key: "marcaId", opts: tabelas.marcas },
                  { label: "Categoria", key: "categoriaId", opts: tabelas.categorias },
                  { label: "Grupo", key: "grupoId", opts: tabelas.grupos },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                    <select value={form[f.key]} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                      <option value="">-</option>
                      {(f.opts || []).map((o: any) => <option key={o.id} value={o.id}>{o.nome}</option>)}
                    </select>
                  </div>
                ))}
                {[
                  { label: "Custo Atual", key: "custoAtual" },
                  { label: "Margem Bruta % (padrão)", key: "margemBrutaPadrao" },
                  { label: "Índice % (padrão)", key: "indicePadrao" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                    <input type="number" step="0.01" value={form[f.key]} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Fornecedores */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Fornecedores</h3>
            {(fornecedores || []).length === 0 ? (
              <p className="text-sm text-gray-600">Nenhum fornecedor vinculado</p>
            ) : (
              <div className="space-y-2">
                {fornecedores.map((f: any) => (
                  <Link key={f.id} href={`/crm/fornecedores/${f.fornecedorId}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
                    <span className="text-sm text-gray-200">{f.fornecedor?.nome}</span>
                    {f.custoFornecedor && <span className="text-sm text-gray-400">{formatCurrency(Number(f.custoFornecedor))}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Histórico de Preços */}
          {(historico || []).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h3 className="text-sm font-medium text-gray-300">Histórico de Preços</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Custo</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Vigência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {historico.map((h: any) => (
                    <tr key={h.id}>
                      <td className="px-4 py-3 text-gray-300">{formatCurrency(Number(h.custo))}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(h.vigenciaInicio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-4">
        <Link href="/crm/produtos" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition w-fit">
          <ArrowLeft className="w-4 h-4" /> Voltar para Produtos
        </Link>
      </div>
    </div>
  );
}
