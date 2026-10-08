"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  oportunidadeId: string;
  clienteId?: string;
  vendedorId?: string;
  onClose: () => void;
  onCreated: () => void;
}

export function NovaPropostaModal({ oportunidadeId, clienteId, vendedorId, onClose, onCreated }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    validadeAte: "",
    observacoes: "",
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/propostas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oportunidadeId,
        clienteId: clienteId || null,
        vendedorId: vendedorId || null,
        validadeAte: form.validadeAte || null,
        observacoes: form.observacoes || null,
      }),
    });
    setLoading(false);
    if (res.ok) {
      const created = await res.json();
      router.push(`/crm/propostas/${created.id}`);
      onCreated();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Nova Proposta</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Validade</label>
            <input type="date" value={form.validadeAte} onChange={e => setForm(p => ({ ...p, validadeAte: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Observações iniciais</label>
            <textarea rows={3} value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
              {loading ? "Criando..." : "Criar Proposta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
