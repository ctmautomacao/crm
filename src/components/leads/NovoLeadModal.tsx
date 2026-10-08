"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TemperaturaInput } from "@/components/ui/TemperaturaInput";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function NovoLeadModal({ onClose, onCreated }: Props) {
  const [tabelas, setTabelas] = useState<any>({});
  const [form, setForm] = useState({
    nomeContato: "",
    empresa: "",
    telefone: "",
    email: "",
    origemId: "",
    campanhaId: "",
    indicadorId: "",
    vendedorId: "",
    temperatura: 1,
    status: "NOVO",
    observacoes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/configuracoes/tabelas").then((r) => r.json()).then(setTabelas);
  }, []);

  function set(field: string, val: any) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Novo Lead</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Nome do Contato *</label>
              <input required value={form.nomeContato} onChange={(e) => set("nomeContato", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Empresa</label>
              <input value={form.empresa} onChange={(e) => set("empresa", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Telefone / WhatsApp</label>
              <input value={form.telefone} onChange={(e) => set("telefone", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Origem</label>
              <select value={form.origemId} onChange={(e) => set("origemId", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="">Selecione</option>
                {(tabelas.origens || []).map((o: any) => <option key={o.id} value={o.id}>{o.nome}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Campanha</label>
              <select value={form.campanhaId} onChange={(e) => set("campanhaId", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="">Selecione</option>
                {(tabelas.campanhas || []).map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Indicador</label>
              <select value={form.indicadorId} onChange={(e) => set("indicadorId", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="">Selecione</option>
                {(tabelas.indicadores || []).map((i: any) => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Vendedor</label>
              <select value={form.vendedorId} onChange={(e) => set("vendedorId", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="">Minha conta</option>
                {(tabelas.vendedores || []).filter((v: any) => v.ativo).map((v: any) => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5">Temperatura</label>
              <TemperaturaInput value={form.temperatura} onChange={(v) => set("temperatura", v)} />
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Observações</label>
              <textarea rows={3} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
              {loading ? "Salvando..." : "Criar Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
