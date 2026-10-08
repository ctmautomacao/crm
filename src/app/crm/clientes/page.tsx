"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/utils";
import { Plus, Search, Phone, Mail } from "lucide-react";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nome: "", cpfCnpj: "", email: "", telefone: "", cidade: "", estado: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const data = await fetch("/api/clientes").then(r => r.json());
    setClientes(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModal(false);
    setForm({ nome: "", cpfCnpj: "", email: "", telefone: "", cidade: "", estado: "" });
    load();
  }

  const filtered = clientes.filter(c => {
    const q = search.toLowerCase();
    return c.nome?.toLowerCase().includes(q) || c.cpfCnpj?.includes(q) || c.email?.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} cliente${clientes.length !== 1 ? "s" : ""}`}
        actions={
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition">
            <Plus className="w-4 h-4" /> Novo Cliente
          </button>
        }
      />

      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF/CNPJ, e-mail..."
            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-600" />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-500">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-500">Nenhum cliente encontrado</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">CPF/CNPJ</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contato</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cidade</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/crm/clientes/${c.id}`} className="font-medium text-gray-200 hover:text-blue-400 transition-colors">
                        {c.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.cpfCnpj || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {c.telefone && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Phone className="w-3 h-3" /> {c.telefone}
                          </span>
                        )}
                        {c.email && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Mail className="w-3 h-3" /> {c.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{c.cidade || "-"}{c.estado ? ` / ${c.estado}` : ""}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(c.criadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Novo Cliente</h2>
              <button onClick={() => setModal(false)} className="text-gray-500 hover:text-white transition">✕</button>
            </div>
            <form onSubmit={criar} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Nome *</label>
                  <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">CPF / CNPJ</label>
                  <input value={form.cpfCnpj} onChange={e => setForm(p => ({ ...p, cpfCnpj: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Telefone</label>
                  <input value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">E-mail</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Cidade</label>
                  <input value={form.cidade} onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Estado (UF)</label>
                  <input maxLength={2} value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
                  {saving ? "Salvando..." : "Criar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
