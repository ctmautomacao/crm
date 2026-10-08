"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search } from "lucide-react";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tabelas, setTabelas] = useState<any>({});
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    nome: "", descricao: "", partNumber: "", ncm: "", unidade: "UN",
    marcaId: "", categoriaId: "", grupoId: "", custoAtual: "", margemBrutaPadrao: "20", indicePadrao: "0",
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [prods, tabs] = await Promise.all([
      fetch("/api/produtos").then(r => r.json()),
      fetch("/api/configuracoes/tabelas").then(r => r.json()),
    ]);
    setProdutos(prods);
    setTabelas(tabs);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModal(false);
    setForm({ nome: "", descricao: "", partNumber: "", ncm: "", unidade: "UN", marcaId: "", categoriaId: "", grupoId: "", custoAtual: "", margemBrutaPadrao: "20", indicePadrao: "0" });
    load();
  }

  const filtered = produtos.filter(p => {
    const q = search.toLowerCase();
    return p.nome?.toLowerCase().includes(q) || p.partNumber?.toLowerCase().includes(q) || p.marca?.nome?.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle={`${produtos.length} produto${produtos.length !== 1 ? "s" : ""}`}
        actions={
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition">
            <Plus className="w-4 h-4" /> Novo Produto
          </button>
        }
      />

      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, part number, marca..."
            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-600" />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-500">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-500">Nenhum produto encontrado</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nome / Part Number</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Marca</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Categoria</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Custo</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Mg. Bruta</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Un.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/crm/produtos/${p.id}`} className="hover:text-blue-400 transition-colors">
                        <div className="font-medium text-gray-200">{p.nome}</div>
                        {p.partNumber && <div className="text-xs text-gray-500 font-mono">{p.partNumber}</div>}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{p.marca?.nome || "-"}</td>
                    <td className="px-4 py-3 text-gray-400">{p.categoria?.nome || "-"}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{p.custoAtual ? formatCurrency(Number(p.custoAtual)) : "-"}</td>
                    <td className="px-4 py-3 text-right text-blue-400">{p.margemBrutaPadrao ? `${p.margemBrutaPadrao}%` : "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{p.unidade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Novo Produto</h2>
              <button onClick={() => setModal(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={criar} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Nome *</label>
                  <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Descrição</label>
                  <textarea rows={2} value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Part Number</label>
                  <input value={form.partNumber} onChange={e => setForm(p => ({ ...p, partNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">NCM</label>
                  <input value={form.ncm} onChange={e => setForm(p => ({ ...p, ncm: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Marca</label>
                  <select value={form.marcaId} onChange={e => setForm(p => ({ ...p, marcaId: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">-</option>
                    {(tabelas.marcas || []).map((m: any) => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Categoria</label>
                  <select value={form.categoriaId} onChange={e => setForm(p => ({ ...p, categoriaId: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">-</option>
                    {(tabelas.categorias || []).map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Grupo</label>
                  <select value={form.grupoId} onChange={e => setForm(p => ({ ...p, grupoId: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">-</option>
                    {(tabelas.grupos || []).map((g: any) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Unidade</label>
                  <select value={form.unidade} onChange={e => setForm(p => ({ ...p, unidade: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    {["UN", "PC", "KG", "M", "M2", "M3", "L", "CX", "PAR", "KIT"].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Custo Atual</label>
                  <input type="number" step="0.01" value={form.custoAtual} onChange={e => setForm(p => ({ ...p, custoAtual: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Margem Bruta % (padrão)</label>
                  <input type="number" step="0.01" value={form.margemBrutaPadrao} onChange={e => setForm(p => ({ ...p, margemBrutaPadrao: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Índice % (padrão)</label>
                  <input type="number" step="0.01" value={form.indicePadrao} onChange={e => setForm(p => ({ ...p, indicePadrao: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
                  {saving ? "Salvando..." : "Criar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
