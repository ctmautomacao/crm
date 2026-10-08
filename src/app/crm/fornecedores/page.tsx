"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plus, Search } from "lucide-react";

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nome: "", cnpj: "", email: "", telefone: "", contato: "", observacoes: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const data = await fetch("/api/fornecedores").then(r => r.json());
    setFornecedores(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/fornecedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModal(false);
    setForm({ nome: "", cnpj: "", email: "", telefone: "", contato: "", observacoes: "" });
    load();
  }

  const filtered = fornecedores.filter(f => {
    const q = search.toLowerCase();
    return f.nome?.toLowerCase().includes(q) || f.cnpj?.includes(q) || f.contato?.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader
        title="Fornecedores"
        subtitle={`${fornecedores.length} fornecedor${fornecedores.length !== 1 ? "es" : ""}`}
        actions={
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition">
            <Plus className="w-4 h-4" /> Novo Fornecedor
          </button>
        }
      />

      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, CNPJ, contato..."
            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-600" />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-500">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-500">Nenhum fornecedor encontrado</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contato</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Telefone</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">E-mail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(f => (
                  <tr key={f.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/crm/fornecedores/${f.id}`} className="font-medium text-gray-200 hover:text-blue-400 transition-colors">
                        {f.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{f.cnpj || "-"}</td>
                    <td className="px-4 py-3 text-gray-400">{f.contato || "-"}</td>
                    <td className="px-4 py-3 text-gray-400">{f.telefone || "-"}</td>
                    <td className="px-4 py-3 text-gray-400">{f.email || "-"}</td>
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
              <h2 className="text-lg font-semibold text-white">Novo Fornecedor</h2>
              <button onClick={() => setModal(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={criar} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Nome *</label>
                  <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">CNPJ</label>
                  <input value={form.cnpj} onChange={e => setForm(p => ({ ...p, cnpj: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Contato</label>
                  <input value={form.contato} onChange={e => setForm(p => ({ ...p, contato: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Telefone</label>
                  <input value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">E-mail</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Observações</label>
                  <textarea rows={2} value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
                  {saving ? "Salvando..." : "Criar Fornecedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
